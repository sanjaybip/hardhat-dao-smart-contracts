import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  developmentChains,
  VOTING_PERIOD,
  VOTING_DELAY,
  QUORUM_PERCENTAGE,
} from "../helper-hardhat-config";
import verify from "../utils/verify";

const governorContractDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, network, getNamedAccounts, ethers } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  const governanceToken = await ethers.getContract("GovernanceToken");
  const timeLock = await ethers.getContract("TimeLock");

  let blockConfirmations = 1;
  if (!developmentChains.includes(network.name)) {
    blockConfirmations = 4;
  }
  log("----------------------------------------------------");
  log("Deploying GovernorContract Contract and waiting for confirmations...");
  const args: any = [
    governanceToken.address,
    timeLock.address,
    QUORUM_PERCENTAGE,
    VOTING_PERIOD,
    VOTING_DELAY,
  ];
  const governorContract = await deploy("GovernorContract", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governorContract.address, args);
  }
};

export default governorContractDeploy;
governorContractDeploy.tags = ["all", "governorcontract"];

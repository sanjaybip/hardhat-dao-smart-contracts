import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const governanceTokenDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  let blockConfirmations = 1;
  if (!developmentChains.includes(network.name)) {
    blockConfirmations = 4;
  }
  log("----------------------------------------------------");
  log("Deploying GovernanceToken and waiting for confirmations...");
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: blockConfirmations,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(governanceToken.address, []);
  }
  await delegate(governanceToken.address, deployer);
  log("Delegated!");
};

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
  const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);
  const txRespo = await governanceToken.delegate(delegatedAccount);
  txRespo.wait(1);
  console.log(`Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`);
};

export default governanceTokenDeploy;
governanceTokenDeploy.tags = ["all", "governance"];

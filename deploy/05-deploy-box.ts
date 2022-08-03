import { ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const boxDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  let blockConfirmations = 1;
  if (!developmentChains.includes(network.name)) {
    blockConfirmations = 4;
  }
  log("----------------------------------------------------");
  log("Deploying Box Contract and waiting for confirmations...");
  const args: any = [];
  const box = await deploy("Box", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(box.address, args);
  }
  // transfer ownership to timeLock from deployer
  const timeLock = await ethers.getContract("TimeLock");
  const boxContract = await ethers.getContractAt("Box", box.address);
  const transferTx = await boxContract.transferOwnership(timeLock.address);
  await transferTx.wait(1);
};

export default boxDeploy;
boxDeploy.tags = ["all", "box"];

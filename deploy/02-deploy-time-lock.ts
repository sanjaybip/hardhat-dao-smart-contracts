import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, MIN_DELAY } from "../helper-hardhat-config";
import verify from "../utils/verify";

const timeLockDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, network, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  let blockConfirmations = 1;
  if (!developmentChains.includes(network.name)) {
    blockConfirmations = 4;
  }
  log("----------------------------------------------------");
  log("Deploying TimeLock Contract and waiting for confirmations...");
  const args: any = [MIN_DELAY, [], []];
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: blockConfirmations,
  });

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(timeLock.address, args);
  }
};

export default timeLockDeploy;
timeLockDeploy.tags = ["all", "timelock"];

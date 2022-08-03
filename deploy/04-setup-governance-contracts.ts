import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NULL_ADDRESS } from "../helper-hardhat-config";

const setupContracts: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { ethers, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const timeLock = await ethers.getContract("TimeLock", deployer);
  const governorContract = await ethers.getContract("GovernorContract");
  console.log("---------------------------");
  console.log("Setting up contracts for roles...");

  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

  const proposerTx = await timeLock.grantRole(proposerRole, governorContract.address);
  await proposerTx.wait(1);
  const executorTx = await timeLock.grantRole(executorRole, NULL_ADDRESS);
  await executorTx.wait(1);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];

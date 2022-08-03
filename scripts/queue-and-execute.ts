import { ethers, network } from "hardhat";
import {
  developmentChains,
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  MIN_DELAY,
} from "../helper-hardhat-config";
import moveBlocks from "../utils/move-blocks";
import moveTime from "../utils/move-time";

async function queueAndExecute(functionName: string, args: any[], proposalDescription: string) {
  const box = await ethers.getContract("Box");
  const encodeFnCall = box.interface.encodeFunctionData(functionName, args);
  const descrpHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(proposalDescription));

  const governorContract = await ethers.getContract("GovernorContract");
  console.log("Queueing...");
  const queueTx = await governorContract.queue([box.address], [0], [encodeFnCall], descrpHash);
  await queueTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  console.log("Executing...");
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governorContract.execute([box.address], [0], [encodeFnCall], descrpHash);
  await executeTx.wait(1);
  if (developmentChains.includes(network.name)) {
    await moveBlocks(1);
  }
  const boxNewValue = await box.retrieve();
  console.log(boxNewValue.toString());
}
queueAndExecute(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

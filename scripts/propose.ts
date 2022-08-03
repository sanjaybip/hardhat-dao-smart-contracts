import { ethers, network } from "hardhat";
import * as fs from "fs";
import {
  developmentChains,
  FUNC,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
  proposalsFile,
} from "../helper-hardhat-config";
import moveBlocks from "../utils/move-blocks";

export async function propose(functionName: string, args: any[], proposalDescription: string) {
  const governorContract = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");
  const encodedFnCall = box.interface.encodeFunctionData(functionName, args);
  console.log(`Proposing ${functionName} on ${box.address} with ${args}`);
  console.log(`Proposal Description:\n  ${proposalDescription}`);

  const proposeTx = await governorContract.propose(
    [box.address],
    [0],
    [encodedFnCall],
    proposalDescription
  );
  // If working on a development chain, we will push forward till we get to the voting period.
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }
  const proposeReceipt = await proposeTx.wait(1);
  const proposalId = proposeReceipt.events[0].args.proposalId;
  console.log(`Proposed with proposal ID:\n  ${proposalId}`);

  const proposalState = await governorContract.state(proposalId);
  const proposalSnapShot = await governorContract.proposalSnapshot(proposalId);
  const proposalDeadline = await governorContract.proposalDeadline(proposalId);

  let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8") || "{}");
  const chainId = network.config.chainId!.toString();
  if (chainId in proposals) {
    if (!proposals[chainId].includes(proposalId.toString())) {
      proposals[chainId].push(proposalId.toString());
    }
  } else {
    proposals[chainId] = [proposalId.toString()];
  }

  fs.writeFileSync(proposalsFile, JSON.stringify(proposals));

  // The state of the proposal. 1 is not passed. 0 is passed.
  console.log(`Current Proposal State: ${proposalState}`);
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}

propose(FUNC, [NEW_STORE_VALUE], PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

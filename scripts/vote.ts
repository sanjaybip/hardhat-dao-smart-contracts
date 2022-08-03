import * as fs from "fs";
import { ethers, network } from "hardhat";

import { developmentChains, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config";
import moveBlocks from "../utils/move-blocks";

const index = 0;
async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const proposalId = proposals[network.config.chainId!.toString()][proposalIndex];

  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1;
  const reason = "I lika the proposal";
  await vote(proposalId, voteWay, reason);
}

async function vote(proposalId: string, voteWay: number, reason: string) {
  console.log("Voting...");
  const governorContract = await ethers.getContract("GovernorContract");
  const voteTx = await governorContract.castVoteWithReason(proposalId, voteWay, reason);
  const voteTxReceipt = await voteTx.wait(1);
  console.log(voteTxReceipt.events[0].args.reason);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }
  const proposalState = await governorContract.state(proposalId);
  console.log(`Current Proposal State: ${proposalState}`);
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

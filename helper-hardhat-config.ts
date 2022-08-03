export const developmentChains = ["hardhat", "localhost"];
export const MIN_DELAY = 3600; // 1 hour - after a vote passes, you have 1 hour before you can enact
export const VOTING_PERIOD = 5; // blocks
export const VOTING_DELAY = 1; // 1 Block - How many blocks till a proposal vote becomes active
export const QUORUM_PERCENTAGE = 10; // Need 4% of voters to pass
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
// requires when creating proposal
export const NEW_STORE_VALUE = 365;
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1 365 in the Box!";

export const proposalsFile = "proposals.json";

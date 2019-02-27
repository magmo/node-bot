import { Channel, Commitment, CommitmentType, sign, toHex, } from 'fmg-core';
import { bytesFromAppAttributes } from "fmg-nitro-adjudicator";
import { ALLOCATION, BEGINNING_APP_CHANNEL_HOLDINGS, BEGINNING_APP_CHANNEL_NONCE, DESTINATION, DUMMY_RULES_ADDRESS, FUNDED_CHANNEL_HOLDINGS,  FUNDED_CHANNEL_NONCE, HUB_ADDRESS, NONCE, ONGOING_APP_CHANNEL_HOLDINGS, ONGOING_APP_CHANNEL_NONCE, PARTICIPANT_ADDRESS, PARTICIPANT_PRIVATE_KEY, PARTICIPANTS } from "../src/constants";
import { IAllocatorChannelCommitment } from '../src/wallet/services';

const default_channel: Channel = {
    channelType: DUMMY_RULES_ADDRESS,
    participants: PARTICIPANTS,
    nonce: NONCE,
};

export const funded_channel: Channel = {
    channelType: DUMMY_RULES_ADDRESS,
    participants: PARTICIPANTS,
    nonce: FUNDED_CHANNEL_NONCE,
};

export const beginning_app_phase_channel: Channel = {
    channelType: DUMMY_RULES_ADDRESS,
    participants: PARTICIPANTS,
    nonce: BEGINNING_APP_CHANNEL_NONCE,
};

export const ongoing_app_phase_channel: Channel = {
    channelType: DUMMY_RULES_ADDRESS,
    participants: PARTICIPANTS,
    nonce: ONGOING_APP_CHANNEL_NONCE,
};

const app_attrs = (n: number, proposedAllocation=ALLOCATION, proposedDestination=DESTINATION) => bytesFromAppAttributes({
  consensusCounter: n % 2,
  proposedAllocation,
  proposedDestination,
});

const base = {
    allocation: ALLOCATION,
    destination: DESTINATION,
};

const base_response = {
  id: expect.any(Number),
  allocator_channel_id: expect.any(Number),
  channel: {
    nonce: expect.any(Number),
    channelType: DUMMY_RULES_ADDRESS,
    participants: PARTICIPANTS,
  },
  allocation: ALLOCATION,
  destination: DESTINATION,
};

function pre_fund_setup(turnNum: number): Commitment {
  return {
    ...base,
    channel: { ...funded_channel },
    turnNum,
    appAttributes: app_attrs(0),
    commitmentCount: turnNum,
    commitmentType: CommitmentType.PreFundSetup,
  };
}

function post_fund_setup(turnNum: number): Commitment {
  return {
    ...base,
    channel: { ...beginning_app_phase_channel },
    turnNum,
    appAttributes: app_attrs(0),
    commitmentCount: turnNum % funded_channel.participants.length,
    commitmentType: CommitmentType.PostFundSetup,
  };
}

function app(turnNum: number, channel: Channel): Commitment {
  return {
    ...base,
    channel,
    turnNum,
    appAttributes: app_attrs(turnNum % channel.participants.length),
    commitmentCount: 0,
    commitmentType: CommitmentType.App,
  };
}

export const constructors = {
  pre_fund_setup,
  post_fund_setup,
  app,
};

export const pre_fund_setup_1_response: IAllocatorChannelCommitment = {
  ...base_response,
  turnNum: 1,
  appAttributes: app_attrs(0),
  commitmentCount: 1,
  commitmentType: CommitmentType.PreFundSetup,
};

export const post_fund_setup_1_response: IAllocatorChannelCommitment = {
  ...base_response,
  turnNum: 3,
  appAttributes: app_attrs(0),
  commitmentCount: 1,
  channel: funded_channel,
  commitmentType: CommitmentType.PostFundSetup,
};

export const app_1_response: IAllocatorChannelCommitment = {
  ...base_response,
  turnNum: 5,
  appAttributes: app_attrs(1),
  commitmentCount: 0,
  channel: beginning_app_phase_channel,
  commitmentType: CommitmentType.App,
};


const commitment = pre_fund_setup(0);
export const open_channel_params = {
  from: PARTICIPANT_ADDRESS,
  commitment,
  signature: sign(toHex(commitment), PARTICIPANT_PRIVATE_KEY),
};

export const invalid_open_channel_params = {
  from: PARTICIPANT_ADDRESS,
  commitment,
  signature: sign(toHex(commitment), "0xf00"),
};

export const created_channel = {
  id: expect.any(Number),
  holdings: 0,
  rules_address: DUMMY_RULES_ADDRESS,
  participants: PARTICIPANTS.map(p => ({ address: p })),
};

export const created_channel_response = {
  id: expect.any(Number),
  holdings: 0,
  channelType: DUMMY_RULES_ADDRESS,
  participants: PARTICIPANTS,
  nonce: NONCE,
};

export const funded_channel_response = {
  id: expect.any(Number),
  holdings: FUNDED_CHANNEL_HOLDINGS,
  channelType: DUMMY_RULES_ADDRESS,
  participants: PARTICIPANTS,
  nonce: FUNDED_CHANNEL_NONCE,
};

export const beginning_app_phase_channel_response = {
  id: expect.any(Number),
  holdings: BEGINNING_APP_CHANNEL_HOLDINGS,
  channelType: DUMMY_RULES_ADDRESS,
  participants: PARTICIPANTS,
  nonce: BEGINNING_APP_CHANNEL_NONCE,
};

export const ongoing_app_phase_channel_response = {
  id: expect.any(Number),
  holdings: ONGOING_APP_CHANNEL_HOLDINGS,
  channelType: DUMMY_RULES_ADDRESS,
  participants: PARTICIPANTS,
  nonce: ONGOING_APP_CHANNEL_NONCE,
};

export const created_pre_fund_setup_1 = {
  id: expect.any(Number),
  allocator_channel_id: expect.any(Number),
  turn_number: 1,
  commitment_count: 1,
  commitment_type: CommitmentType.PreFundSetup,
  allocation: ALLOCATION,
  destination: DESTINATION,
  appAttributes: app_attrs(1),
};

export const sample_participants = [
  { address: HUB_ADDRESS },
  { address: PARTICIPANT_ADDRESS },
];
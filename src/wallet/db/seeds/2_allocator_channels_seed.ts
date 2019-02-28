import { CommitmentType } from 'fmg-core';
import { Model } from 'objection';
import {
  ALLOCATION,
  BEGINNING_APP_CHANNEL_HOLDINGS,
  BEGINNING_APP_CHANNEL_NONCE,
  DESTINATION,
  DUMMY_RULES_ADDRESS,
  FUNDED_CHANNEL_HOLDINGS,
  FUNDED_CHANNEL_NONCE,
  HUB_ADDRESS,
  ONGOING_APP_CHANNEL_HOLDINGS,
  ONGOING_APP_CHANNEL_NONCE,
  PARTICIPANT_ADDRESS,
} from '../../../constants';
import AllocatorChannel from '../../models/allocatorChannel';
import knex from '../connection';
Model.knex(knex);

const participants = [
  { address: PARTICIPANT_ADDRESS, priority: 0 },
  { address: HUB_ADDRESS, priority: 1 },
];

const channel_1 = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: 1,
  holdings: 0,
  participants,
};

const channel_2 = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: 2,
  holdings: 0,
  participants,
};

const allocationByPriority = (priority: number) => ({
  priority,
  destination: DESTINATION[priority],
  amount: ALLOCATION[priority],
});

const allocations = () => [allocationByPriority(0), allocationByPriority(1)];
const app_attrs = (n: number) => ({
  consensusCounter: n,
  proposedAllocation: ALLOCATION,
  proposedDestination: DESTINATION,
});

function pre_fund_setup(turn_number: number) {
  return {
    turn_number,
    commitment_type: CommitmentType.PreFundSetup,
    commitment_count: turn_number,
    allocations: allocations(),
    app_attrs: app_attrs(0),
  };
}

const funded_channel = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: FUNDED_CHANNEL_NONCE,
  holdings: FUNDED_CHANNEL_HOLDINGS,
  commitments: [pre_fund_setup(0), pre_fund_setup(1)],
  participants,
};

function post_fund_setup(turn_number: number) {
  return {
    turn_number,
    commitment_type: CommitmentType.PostFundSetup,
    commitment_count: turn_number % funded_channel.participants.length,
    allocations: allocations(),
    app_attrs: app_attrs(0),
  };
}

const beginning_app_phase_channel = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: BEGINNING_APP_CHANNEL_NONCE,
  holdings: BEGINNING_APP_CHANNEL_HOLDINGS,
  commitments: [post_fund_setup(2), post_fund_setup(3)],
  participants,
};

function app(turn_number: number) {
  return {
    turn_number,
    commitment_type: CommitmentType.PostFundSetup,
    commitment_count: turn_number % funded_channel.participants.length,
    allocations: allocations(),
    app_attrs: app_attrs(turn_number % participants.length),
  };
}

const ongoing_app_phase_channel = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: ONGOING_APP_CHANNEL_NONCE,
  holdings: ONGOING_APP_CHANNEL_HOLDINGS,
  commitments: [app(4), app(5)],
  participants,
};

export const seeds = {
  channel_1,
  channel_2,
  funded_channel,
  beginning_app_phase_channel,
  ongoing_app_phase_channel,
};

export async function seed() {
  await knex('allocator_channels').del();
  await AllocatorChannel.query().insertGraph(Object.values(seeds));
}

export const constructors = {
  pre_fund_setup,
  post_fund_setup,
  app,
};

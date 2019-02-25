import * as Knex from "knex";
import { DUMMY_RULES_ADDRESS, FUNDED_CHANNEL_NONCE, FUNDED_CHANNEL_HOLDINGS, HUB_ADDRESS, PARTICIPANT_ADDRESS, DESTINATION, ALLOCATION, BEGINNING_APP_CHANNEL_NONCE, BEGINNING_APP_CHANNEL_HOLDINGS, ONGOING_APP_CHANNEL_NONCE, ONGOING_APP_CHANNEL_HOLDINGS } from "../../../constants"
import AllocatorChannel from "../../models/allocatorChannel";
import { Model } from "objection";
import knex from "../connection";
import { CommitmentType } from "fmg-core";
import { bytesFromAppAttributes } from "fmg-nitro-adjudicator";
Model.knex(knex);

const participants = [{ address: PARTICIPANT_ADDRESS, priority: 0}, { address: HUB_ADDRESS, priority: 1 }]

const channel_1 = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: 1,
  holdings: 0,
  participants,
}

const channel_2 = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: 2,
  holdings: 0,
  participants,
}

const allocationByPriority = (priority: number) => ({
  priority,
  destination: DESTINATION[priority],
  amount: ALLOCATION[priority],
})

const allocations = () => [allocationByPriority(0), allocationByPriority(1)]
const app_attrs = (n: number) => bytesFromAppAttributes({
  consensusCounter: 0,
  proposedAllocation: ALLOCATION,
  proposedDestination: DESTINATION,
})

function pre_fund_setup(turn_number: number) {
  return {
    turn_number,
    commitment_type: CommitmentType.PreFundSetup,
    commitment_count: turn_number,
    allocations: allocations(),
    app_attrs: app_attrs(0)
  }
}

const funded_channel = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: FUNDED_CHANNEL_NONCE,
  holdings: FUNDED_CHANNEL_HOLDINGS,
  commitments: [ 
    pre_fund_setup(0),
    pre_fund_setup(1),
  ],
  participants,
}

function post_fund_setup(turn_number: number) {
  return {
    turn_number,
    commitment_type: CommitmentType.PostFundSetup,
    commitment_count: turn_number % funded_channel.participants.length,
    allocations: allocations(),
    app_attrs: app_attrs(0),
  }
}

const beginning_app_phase_channel = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: BEGINNING_APP_CHANNEL_NONCE,
  holdings: BEGINNING_APP_CHANNEL_HOLDINGS,
  commitments: [ 
    post_fund_setup(0),
    post_fund_setup(1),
  ],
  participants,
}

function app(turn_number: number) {
  return {
    turn_number,
    commitment_type: CommitmentType.PostFundSetup,
    commitment_count: turn_number % funded_channel.participants.length,
    allocations: allocations(),
    app_attrs: app_attrs(turn_number % participants.length)
  }
}

const ongoing_app_phase_channel = {
  rules_address: DUMMY_RULES_ADDRESS,
  nonce: ONGOING_APP_CHANNEL_NONCE,
  holdings: ONGOING_APP_CHANNEL_HOLDINGS,
  commitments: [ 
    app(0),
    app(1),
  ],
  participants,
}

export const seeds = {
  channel_1,
  channel_2,
  funded_channel,
  beginning_app_phase_channel,
  ongoing_app_phase_channel,
}

export async function seed(knex: Knex) {
  await knex('allocator_channels').del()
  await AllocatorChannel.query().insertGraph(Object.values(seeds));
}

export const constructors = {
  pre_fund_setup,
  post_fund_setup,
  app
}
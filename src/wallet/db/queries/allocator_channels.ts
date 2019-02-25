import {
  MessageSignature,
  Address,
  CommitmentType,
  Uint32,
  Commitment,
} from "fmg-core"
import { appAttributesFromBytes } from "fmg-nitro-adjudicator";
import knex from "../connection"
import { CommitmentString } from "../../../types";
import AllocatorChannel from "../../models/allocatorChannel";

export interface CreateAllocatorChannelParams {
  commitment: CommitmentString,
  signature: MessageSignature,
}
export interface IAllocatorChannel {
  channelId: Address,
  channelType: Address,
  nonce_id: number,
}

function getAllAllocatorChannels() {
  return knex('allocator_channels').select("*");
}

function getSingleAllocatorChannel(id: number) {
  return knex('allocator_channels')
    .where({id})
    .first()
}

export const queries = {
  getAllAllocatorChannels,
  getSingleAllocatorChannel,
  openAllocatorChannel,
  updateAllocatorChannel,
}

async function openAllocatorChannel(theirCommitment: Commitment) {
  const { channel, allocation, destination, } = theirCommitment
  const { participants, channelType: rules_address, nonce } = channel;

  const allocationByPriority = (priority: number) => ({
    priority,
    destination: destination[priority],
    amount: allocation[priority],
  })

  const allocations = () => [allocationByPriority(0), allocationByPriority(1)]

  const commitment = (turn_number: Uint32) => ({
    turn_number,
    commitment_type: CommitmentType.PreFundSetup,
    commitment_count: turn_number,
    consensus_count: 0,
    allocations: allocations(),
    proposed_allocations: allocations(),
  })

  const commitments = [commitment(0), commitment(1)]

  return AllocatorChannel
  .query()
  .eager('[commitments, participants]')
  .insertGraphAndFetch({
    rules_address,
    holdings: 0,
    commitments,
    nonce,
    participants: participants.map((address, i) => { return { address, priority: i }}),
  })
}

async function updateAllocatorChannel(theirCommitment: Commitment, hubCommitment: Commitment) {
  const { channel, } = theirCommitment
  const { channelType, nonce, } = channel;

  const allocator_channel = await AllocatorChannel.query()
  .where({ nonce, rules_address: channelType })
  .select("id")
  .first()

  if (!allocator_channel.id) {
    throw new Error("Channel does not exist")
  }

  const allocationByPriority = (priority: number, c: Commitment) => ({
    priority,
    destination: c.destination[priority],
    amount: c.allocation[priority],
  })

  const allocations = (c: Commitment) => [allocationByPriority(0, c), allocationByPriority(1, c)]

  const consensusCounter = (c: Commitment) => appAttributesFromBytes(c.appAttributes).consensusCounter
  const proposedAllocation = (c: Commitment) => appAttributesFromBytes(c.appAttributes).proposedAllocation
  const proposedDestination = (c: Commitment) => appAttributesFromBytes(c.appAttributes).proposedDestination
  const commitment = (c: Commitment) => ({
    turn_number: c.turnNum,
    commitment_type: c.commitmentType,
    commitment_count: c.commitmentCount,
    allocations: allocations(c),
    consensus_count: consensusCounter(c),
    proposed_allocations: allocations({...c, allocation: proposedAllocation(c), destination: proposedDestination(c)}),
  })

  const commitments = [commitment(theirCommitment), commitment(hubCommitment)]

  return AllocatorChannel
  .query()
  .eager('[commitments.[allocations,proposed_allocations],participants]')
  .upsertGraphAndFetch({
    id: allocator_channel.id,
    commitments,
  });
}

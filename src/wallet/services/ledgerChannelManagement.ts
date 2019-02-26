import { Commitment, sign, recover, Address, Signature, CommitmentType } from "fmg-core";
import { queries } from "../db/queries/allocator_channels";
import ConsensusCommitment from "../models/allocatorChannelCommitment";
import { HUB_PRIVATE_KEY } from "../../constants";
import { mover, toHex } from "fmg-core";
import Allocation from "../models/allocation";
import { bytesFromAppAttributes, appAttributesFromBytes,  } from 'fmg-nitro-adjudicator';
import AllocatorChannel from "../models/allocatorChannel";
import { ChannelResponse } from ".";
import errors from "../errors";
import AllocatorChannelCommitment from "../models/allocatorChannelCommitment";


export async function openLedgerChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    if (await channelExists(theirCommitment)) {
      throw errors.CHANNEL_EXISTS;
    }

    if (!await validSignature(theirCommitment, theirSignature)) {
      throw errors.COMMITMENT_NOT_SIGNED;
    }

    const allocator_channel = await queries.openAllocatorChannel(theirCommitment);
    return formResponse(allocator_channel);
}

export async function updateLedgerChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    if (!await validSignature(theirCommitment, theirSignature)) {
        throw errors.COMMITMENT_NOT_SIGNED;
    }

    if (!(await channelExists(theirCommitment))) {
        throw errors.CHANNEL_MISSING;
    }

    if (!await valuePreserved(theirCommitment)) {
        throw errors.VALUE_LOST;
    }

    if (!await validTransition(theirCommitment)) {
      throw errors.INVALID_TRANSITION;
    }

    const ourCommitment = nextCommitment(theirCommitment);

    const allocator_channel = await queries.updateAllocatorChannel(theirCommitment, ourCommitment);
    return formResponse(allocator_channel);
}

export function nextCommitment(theirCommitment: Commitment): Commitment {
  switch (theirCommitment.commitmentType) {
    case CommitmentType.PreFundSetup:
      return {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };

    case CommitmentType.PostFundSetup:
      return {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };

    case CommitmentType.App:
      const { consensusCounter, proposedAllocation, proposedDestination} = appAttributesFromBytes(theirCommitment.appAttributes);
      const appAttributes = bytesFromAppAttributes({
        consensusCounter: consensusCounter + 1,
        proposedAllocation,
        proposedDestination,
      });
      return {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: 0,
        appAttributes,
      };

    case CommitmentType.Conclude:
      return {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };
  }
}

export async function valuePreserved(nextCommitment: any): Promise<boolean> {
    return nextCommitment && true;
}

export async function validSignature(commitment: Commitment,  signature: Signature): Promise<boolean> {
  return recover(toHex(commitment), signature) === mover(commitment);
}

export async function channelExists(theirCommitment: Commitment): Promise<boolean> {
  const { channelType: rules_address, nonce } = theirCommitment.channel;
  const channel = await AllocatorChannel
    .query()
    .where({ rules_address, nonce})
    .first();

  if (channel) {
    return true;
  } else {
    return false;
  }
}

export async function validTransition(theirCommitment: Commitment): Promise<boolean> {
  const { channel } = theirCommitment;
  const allocator_channel_id = (await AllocatorChannel.query()
  .where({rules_address: channel.channelType, nonce: channel.nonce})
  .select("id")
  .first()).id;

  const currentCommitment = await AllocatorChannelCommitment.query()
  .where({ allocator_channel_id })
  .orderBy("id", "desc")
  .select()
  .first();

  return theirCommitment.turnNum === currentCommitment.turn_number + 1;
}

async function formResponse(allocator_channel: any) {
    const commitment = await ConsensusCommitment.query()
    .eager("[allocator_channel.[participants],allocations]").findById(allocator_channel.commitments[1].id);
    const signature = sign(commitment.toHex, HUB_PRIVATE_KEY);

    const { id: allocator_channel_id, participants, nonce, rules_address, holdings } = allocator_channel;
    const { id: commitment_id, turn_number, commitment_count, commitment_type, allocations, app_attrs } = commitment;

    return {
      commitment: {
        id: commitment_id,
        allocator_channel_id,
        turnNum: turn_number,
        commitmentCount: commitment_count,
        commitmentType: commitment_type,
        allocation: allocations.map(amount),
        destination: allocations.map(destination),
        channel: {
          channelType: rules_address,
          nonce,
          participants: participants.map(address),
        },
        appAttributes: app_attrs,
      },
      allocator_channel: {
        id: allocator_channel_id,
        nonce,
        channelType: rules_address,
        participants: participants.map(address),
        holdings,
      }, signature, 
    };
}


const destination = (allocation: Allocation) => allocation.destination;
const amount = (allocation: Allocation) => allocation.amount;
const address = (participant: { address: Address } ) => participant.address;
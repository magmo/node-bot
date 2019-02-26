import { mover, toHex, Commitment, sign, recover, Address, Signature, CommitmentType } from "fmg-core";
import ConsensusCommitment from "../models/allocatorChannelCommitment";
import { HUB_PRIVATE_KEY } from "../../constants";
import Allocation from "../models/allocation";
import AllocatorChannel from "../models/allocatorChannel";
import { ChannelResponse } from ".";

export function validSignature(commitment: Commitment,  signature: Signature): boolean {
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

export async function formResponse(allocator_channel: any): Promise<ChannelResponse> {
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
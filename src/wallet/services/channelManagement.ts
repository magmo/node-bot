import { ChannelResponse } from ".";
import { HUB_PRIVATE_KEY } from "../../constants";
import Allocation from "../models/allocation";
import AllocatorChannel from "../models/allocatorChannel";
import ConsensusCommitment from "../models/allocatorChannelCommitment";

import { Address, Commitment, mover, recover, sign, Signature, toHex } from "fmg-core";
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

export async function formResponse(channel_id: number): Promise<ChannelResponse> {
  const commitment = await ConsensusCommitment.query()
  .eager("[allocator_channel.[participants],allocations]")
  .where({allocator_channel_id: channel_id})
  .orderBy('turn_number', 'desc')
  .first();

  const signature = sign(commitment.toHex, HUB_PRIVATE_KEY);

  return { commitment: commitment.asCoreCommitment, signature };
}
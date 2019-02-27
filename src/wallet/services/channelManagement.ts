import { ChannelResponse } from ".";
import { HUB_PRIVATE_KEY } from "../../constants";
import AllocatorChannel from "../models/allocatorChannel";
import ConsensusCommitment from "../models/allocatorChannelCommitment";

import { Commitment, mover, recover, sign, Signature, toHex } from "fmg-core";
import { AppAttrSanitizer } from "../../types";
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

export async function formResponse(channel_id: number, sanitize: AppAttrSanitizer): Promise<ChannelResponse> {
  const commitment = await ConsensusCommitment.query()
  .eager("[allocator_channel.[participants],allocations]")
  .where({allocator_channel_id: channel_id})
  .orderBy('turn_number', 'desc')
  .first();

  const signature = sign(commitment.toHex(sanitize), HUB_PRIVATE_KEY);

  return { commitment: commitment.asCoreCommitment(sanitize), signature };
}
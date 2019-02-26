import { Commitment, CommitmentType, Signature } from "fmg-core";
import { appAttributesFromBytes, bytesFromAppAttributes,  } from 'fmg-nitro-adjudicator';
import { ChannelResponse } from ".";
import { queries } from "../db/queries/allocator_channels";
import errors from "../errors";
import AllocatorChannel from "../models/allocatorChannel";
import AllocatorChannelCommitment from "../models/allocatorChannelCommitment";
import { channelExists, formResponse, validSignature } from "./channelManagement";

export async function openLedgerChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    if (await channelExists(theirCommitment)) {
      throw errors.CHANNEL_EXISTS;
    }

    if (!validSignature(theirCommitment, theirSignature)) {
      throw errors.COMMITMENT_NOT_SIGNED;
    }

    const allocator_channel = await queries.openAllocatorChannel(theirCommitment);
    return formResponse(allocator_channel);
}

export async function updateLedgerChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    if (!validSignature(theirCommitment, theirSignature)) {
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

export async function valuePreserved(theirCommitment: any): Promise<boolean> {
    return theirCommitment && true;
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

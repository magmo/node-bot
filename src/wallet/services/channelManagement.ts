import { ChannelResponse } from '.';
import { HUB_PRIVATE_KEY } from '../../constants';
import AllocatorChannel from '../models/allocatorChannel';
import ConsensusCommitment from '../models/allocatorChannelCommitment';

import {
  BaseCommitment,
  Commitment,
  CommitmentType,
  mover,
  recover,
  sign,
  Signature,
  toHex,
} from 'fmg-core';
import { AppAttrSanitizer, AppCommitment } from '../../types';
export function validSignature(
  commitment: Commitment,
  signature: Signature,
): boolean {
  return recover(toHex(commitment), signature) === mover(commitment);
}

export async function channelExists(
  theirCommitment: BaseCommitment,
): Promise<boolean> {
  const { channelType: rules_address, nonce } = theirCommitment.channel;
  const channel = await AllocatorChannel.query()
    .where({ rules_address, nonce })
    .first();

  if (channel) {
    return true;
  } else {
    return false;
  }
}

export async function formResponse(
  channel_id: number,
  sanitize: AppAttrSanitizer,
): Promise<ChannelResponse> {
  const commitment = await ConsensusCommitment.query()
    .eager('[allocator_channel.[participants],allocations]')
    .where({ allocator_channel_id: channel_id })
    .orderBy('turn_number', 'desc')
    .first();

  const signature = sign(commitment.toHex(sanitize), HUB_PRIVATE_KEY);

  return { commitment: commitment.asCoreCommitment(sanitize), signature };
}

export function nextCommitment(theirCommitment: AppCommitment): AppCommitment {
  const appAttrType = typeof theirCommitment.appAttributes;

  if (theirCommitment.commitmentType === CommitmentType.App) {
    throw new Error('commitmentType cannot be CommitmentType.App');
  }

  let ourCommitment: typeof theirCommitment;
  switch (theirCommitment.commitmentType) {
    case CommitmentType.PreFundSetup:
      ourCommitment = {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };

      break;
    case CommitmentType.PostFundSetup:
      ourCommitment = {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };
      break;

    case CommitmentType.Conclude:
      ourCommitment = {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };
  }

  if (typeof ourCommitment.appAttributes !== appAttrType) {
    // TODO: Does this actually enforce that the types match?
    throw new Error(
      'Type error: typeof ourCommitment.appAttributes must match typeof theirCommitment.appAttributes',
    );
  }

  return ourCommitment;
}

import { CommitmentType, Signature } from 'fmg-core';
import {
  asCoreCommitment,
  bytesFromAppAttributes,
} from 'fmg-nitro-adjudicator';
import { ChannelResponse } from '.';
import { LedgerCommitment } from '../../types';
import { queries } from '../db/queries/allocator_channels';
import errors from '../errors';
import AllocatorChannel from '../models/allocatorChannel';
import AllocatorChannelCommitment from '../models/allocatorChannelCommitment';
import * as ChannelManagement from './channelManagement';

// TODO: These should be extracted into a hub app?
export async function openLedgerChannel(
  theirCommitment: LedgerCommitment,
  theirSignature: Signature,
): Promise<ChannelResponse> {
  if (await ChannelManagement.channelExists(theirCommitment)) {
    throw errors.CHANNEL_EXISTS;
  }

  const coreCommitment = asCoreCommitment(theirCommitment);

  if (!ChannelManagement.validSignature(coreCommitment, theirSignature)) {
    throw errors.COMMITMENT_NOT_SIGNED;
  }

  const allocator_channel = await queries.openAllocatorChannel(theirCommitment);
  return ChannelManagement.formResponse(
    allocator_channel.id,
    bytesFromAppAttributes,
  );
}

export async function updateLedgerChannel(
  theirCommitment: LedgerCommitment,
  theirSignature: Signature,
): Promise<ChannelResponse> {
  if (
    !ChannelManagement.validSignature(
      asCoreCommitment(theirCommitment),
      theirSignature,
    )
  ) {
    throw errors.COMMITMENT_NOT_SIGNED;
  }

  if (!(await ChannelManagement.channelExists(theirCommitment))) {
    throw errors.CHANNEL_MISSING;
  }

  if (!(await valuePreserved(theirCommitment))) {
    throw errors.VALUE_LOST;
  }

  if (!(await validTransition(theirCommitment))) {
    throw errors.INVALID_TRANSITION;
  }

  const ourCommitment = nextCommitment(theirCommitment);

  const allocator_channel = await queries.updateAllocatorChannel(
    theirCommitment,
    ourCommitment,
    extractAppAttrs,
  );
  return formResponse(allocator_channel.id, bytesFromAppAttributes);
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
      const {
        consensusCounter,
        proposedAllocation,
        proposedDestination,
      } = appAttributesFromBytes(theirCommitment.appAttributes);
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

export async function validTransition(
  theirCommitment: LedgerCommitment,
): Promise<boolean> {
  const { channel } = theirCommitment;
  const allocator_channel_id = (await AllocatorChannel.query()
    .where({ rules_address: channel.channelType, nonce: channel.nonce })
    .select('id')
    .first()).id;

  const currentCommitment = await AllocatorChannelCommitment.query()
    .where({ allocator_channel_id })
    .orderBy('id', 'desc')
    .select()
    .first();

  return theirCommitment.turnNum === currentCommitment.turn_number + 1;
}

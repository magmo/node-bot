import { Bytes32, Commitment, CommitmentType, Signature, } from "fmg-core";
import { ChannelManagement, ChannelResponse, errors } from "../../wallet";
import AllocatorChannel from "../../wallet/models/allocatorChannel";

import { queries } from "../../wallet/";
import AllocatorChannelCommitment from "../../wallet/models/allocatorChannelCommitment";
import { AppAttributes, asCoreCommitment, fromCoreCommitment, Play, PositionType, RPSBaseCommitment, RPSCommitment } from "./rps-commitment";

export async function openLedgerChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    if (await ChannelManagement.channelExists(theirCommitment)) {
      throw errors.CHANNEL_EXISTS;
    }

    if (!ChannelManagement.validSignature(theirCommitment, theirSignature)) {
      throw errors.COMMITMENT_NOT_SIGNED;
    }

    const allocator_channel = await queries.openAllocatorChannel(theirCommitment);
    return ChannelManagement.formResponse(allocator_channel);
}

export async function updateLedgerChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    if (!ChannelManagement.validSignature(theirCommitment, theirSignature)) {
        throw errors.COMMITMENT_NOT_SIGNED;
    }

    if (!(await ChannelManagement.channelExists(theirCommitment))) {
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
    return ChannelManagement.formResponse(allocator_channel);
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
    const ourMove = move(fromCoreCommitment(theirCommitment));
      return {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: 0,
        appAttributes: asCoreCommitment(ourMove).appAttributes,
      };
    case CommitmentType.Conclude:
      return {
        ...theirCommitment,
        turnNum: theirCommitment.turnNum + 1,
        commitmentCount: theirCommitment.commitmentCount + 1,
      };
  }
}

function move(theirPosition: AppAttributes): AppAttributes {
  switch (theirPosition.positionType) {
    case PositionType.Resting:
      const salt = '0xabc';
      const aPlay;
      return {
        stake: theirPosition.stake,
        positionType: PositionType.Proposed,
        salt: '0x',
        preCommit: preCommit(Play.Paper, salt),
        aPlay,
        bPlay,
      };
    case PositionType.Proposed:
      return theirPosition;
    case PositionType.Accepted:
      return theirPosition;
    case PositionType.Reveal:
      return theirPosition;
  }
}

function preCommit(play: Play, salt: Bytes32): Bytes32 {
  return salt;
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

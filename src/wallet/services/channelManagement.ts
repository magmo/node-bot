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

export default class ChannelManagement {
  static async openAllocatorChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
      if (await ChannelManagement.channelExists(theirCommitment)) {
        throw errors.CHANNEL_EXISTS
      }

      if (!await ChannelManagement.validSignature(theirCommitment, theirSignature)) {
        throw errors.COMMITMENT_NOT_SIGNED
      }

      const allocator_channel = await queries.openAllocatorChannel(theirCommitment);
      return ChannelManagement.formResponse(allocator_channel);
  }

  static async updateAllocatorChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
      if (!(await ChannelManagement.channelExists(theirCommitment))) {
          throw errors.CHANNEL_MISSING
      }

      if (!await ChannelManagement.valuePreserved(theirCommitment)) {
          throw errors.VALUE_LOST
      }

      if (!ChannelManagement.validTransition(theirCommitment)) {
        throw errors.INVALID_TRANSITION;
      }

      if (!await ChannelManagement.validSignature(theirCommitment, theirSignature)) {
          throw errors.COMMITMENT_NOT_SIGNED
      }

      const ourCommitment = ChannelManagement.nextCommitment(theirCommitment);

      const allocator_channel = await queries.updateAllocatorChannel(theirCommitment, ourCommitment);
      return ChannelManagement.formResponse(allocator_channel);
  }

  static nextCommitment(theirCommitment: Commitment): Commitment {
    switch (theirCommitment.commitmentType) {
      case CommitmentType.PreFundSetup:
        return {
          ...theirCommitment,
          turnNum: theirCommitment.turnNum + 1,
          commitmentCount: theirCommitment.commitmentCount + 1,
        }

      case CommitmentType.PostFundSetup:
        return {
          ...theirCommitment,
          turnNum: theirCommitment.turnNum + 1,
          commitmentCount: theirCommitment.commitmentCount + 1,
        }

      case CommitmentType.App:
        const { consensusCounter, proposedAllocation, proposedDestination} = appAttributesFromBytes(theirCommitment.appAttributes);
        const appAttributes = bytesFromAppAttributes({
          consensusCounter: consensusCounter + 1,
          proposedAllocation,
          proposedDestination,
        })
        return {
          ...theirCommitment,
          turnNum: theirCommitment.turnNum + 1,
          commitmentCount: 0,
          appAttributes,
        }

      case CommitmentType.Conclude:
        return {
          ...theirCommitment,
          turnNum: theirCommitment.turnNum + 1,
          commitmentCount: theirCommitment.commitmentCount + 1,
        }
    }
  }

  static async valuePreserved(nextCommitment: any): Promise<boolean> {
      return nextCommitment && true;
  }

  static async validSignature(commitment: Commitment,  signature: Signature): Promise<boolean> {
    return recover(toHex(commitment), signature) == mover(commitment)
  }

  static async channelExists(theirCommitment: Commitment): Promise<boolean> {
    const { channelType: rules_address, nonce } = theirCommitment.channel;
    const channel = await AllocatorChannel
      .query()
      .where({ rules_address, nonce})
      .first()

    if (channel) {
      return true
    } else {
      return false
    }
  }

  static async validTransition(theirCommitment: Commitment): Promise<boolean> {
    console.log("WARNING: Not Implemented")
    return true
  }

  private static async formResponse(allocator_channel: any) {
      const commitment = await ConsensusCommitment.query()
      .eager("[allocator_channel.[participants],allocations]").findById(allocator_channel.commitments[1].id);
      const signature = sign(commitment.toHex, HUB_PRIVATE_KEY)

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
          holdings
        }, signature 
      }
  }
}

const destination = (allocation: Allocation) => allocation.destination
const amount = (allocation: Allocation) => allocation.amount
const address = (participant: { address: Address } ) => participant.address
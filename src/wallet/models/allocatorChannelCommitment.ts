import { Model } from 'objection';
import AllocatorChannel from './allocatorChannel';
import { CommitmentType, Commitment, Uint256, Address, Uint32, Bytes, toHex } from 'fmg-core';
import { bytesFromAppAttributes } from 'fmg-nitro-adjudicator';

import Allocation from './allocation';
import ProposedAllocation from './proposed_allocation';

interface ConsensusAppAttributes {
  consensusCounter: Uint32,
  proposedAllocation: Uint256[],
  proposedDestination: Address[],
}

export default class ConsensusCommitment extends Model {
  readonly id!: number;
  allocator_channel!: AllocatorChannel;
  allocator_channel_id!: number;
  turn_number!: Uint32;
  commitment_type!: CommitmentType;
  commitment_count!: Uint32;
  allocations!: Allocation[];

  consensus_count!: Uint32;
  proposed_allocations!: Allocation[];

  static tableName = 'allocator_channel_commitments';

  static relationMappings = {
    allocator_channel: {
      relation: Model.BelongsToOneRelation,
      modelClass: `${__dirname}/allocatorChannel`,
      join: {
        from: 'allocator_channel_commitments.allocator_channel_id',
        to: 'allocator_channels.id'
      }
    },
    allocations: {
      relation: Model.HasManyRelation,
      modelClass: `${__dirname}/allocation`,
      join: {
        from: 'allocator_channel_commitments.id',
        to: 'allocations.allocator_channel_commitment_id',
      }
    },
    proposed_allocations: {
      relation: Model.HasManyRelation,
      modelClass: ProposedAllocation,
      join: {
        from: 'allocator_channel_commitments.id',
        to: 'proposed_allocations.allocator_channel_commitment_id',
      }
    },
  };

  get appAttributes(): ConsensusAppAttributes {
    return {
      consensusCounter: this.consensus_count,
      proposedAllocation: this.proposed_allocations.sort(priority).map(amount),
      proposedDestination: this.proposed_allocations.sort(priority).map(destination),
    }
  }

  get toHex(): Bytes {
    return toHex(this.asCoreCommitment)
  }

  get asCoreCommitment(): Commitment {
    return {
      commitmentType: this.commitment_type,
      commitmentCount: this.commitment_count,
      turnNum: this.turn_number,
      channel: this.allocator_channel.asCoreChannel,
      allocation: this.allocations.sort(a => a.priority).map(a => a.amount),
      destination: this.allocations.sort(a => a.priority).map(a => a.destination),
      appAttributes: bytesFromAppAttributes(this.appAttributes),
    }
  }
}

const priority = (allocation: Allocation): Uint32 => allocation.priority
const amount = (allocation: Allocation): Uint256 => allocation.amount
const destination = (allocation: Allocation): Address => allocation.destination
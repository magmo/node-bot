import { Address, Bytes, Commitment, CommitmentType, toHex, Uint256, Uint32 } from 'fmg-core';
import { Model } from 'objection';
import Allocation from './allocation';
import AllocatorChannel from './allocatorChannel';

export default class AllocatorChannelCommitment extends Model {

  get toHex(): Bytes {
    return toHex(this.asCoreCommitment);
  }

  get asCoreCommitment(): Commitment {
    return {
      commitmentType: this.commitment_type,
      commitmentCount: this.commitment_count,
      turnNum: this.turn_number,
      channel: this.allocator_channel.asCoreChannel,
      allocation: this.allocations.sort(priority).map(amount),
      destination: this.allocations.sort(priority).map(destination),
      appAttributes: this.app_attrs,
    };
  }

  static tableName = 'allocator_channel_commitments';

  static relationMappings = {
    allocator_channel: {
      relation: Model.BelongsToOneRelation,
      modelClass: `${__dirname}/allocatorChannel`,
      join: {
        from: 'allocator_channel_commitments.allocator_channel_id',
        to: 'allocator_channels.id',
      },
    },
    allocations: {
      relation: Model.HasManyRelation,
      modelClass: `${__dirname}/allocation`,
      join: {
        from: 'allocator_channel_commitments.id',
        to: 'allocations.allocator_channel_commitment_id',
      },
    },
  };
  readonly id!: number;
  allocator_channel!: AllocatorChannel;
  allocator_channel_id!: number;
  turn_number!: Uint32;
  commitment_type!: CommitmentType;
  commitment_count!: Uint32;
  allocations!: Allocation[];
  app_attrs!: Bytes;
}

const priority = (allocation: Allocation): Uint32 => allocation.priority;
const amount = (allocation: Allocation): Uint256 => allocation.amount;
const destination = (allocation: Allocation): Address => allocation.destination;
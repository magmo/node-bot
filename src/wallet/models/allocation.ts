import { Model } from 'objection';
import { Uint256, Address, Uint32 } from 'fmg-core';
import ConsensusCommitment from './allocatorChannelCommitment';

export default class Allocation extends Model {

  static tableName = 'allocations';

  static relationMappings = {
    commitment: {
      relation: Model.BelongsToOneRelation,
      modelClass: ConsensusCommitment,
      join: {
        from: 'allocations.allocator_channel_commitment_id',
        to: 'allocator_channel_commitments.id',
      },
    },
  };
  readonly id!: number;
  commitment: ConsensusCommitment;
  destination: Address;
  amount: Uint256;
  priority: Uint32;
}
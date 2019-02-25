import { Model } from 'objection';
import ConsensusCommitment from './allocatorChannelCommitment';
import { Channel, Uint32, Address } from 'fmg-core';
import AllocatorChannelParticipant from './allocator_channel_participant';

export default class AllocatorChannel extends Model {
  readonly id!: number;
  holdings!: number;
  nonce: Uint32;
  participants: AllocatorChannelParticipant[];
  commitments: ConsensusCommitment[];
  rules_address: Address;

  static tableName = 'allocator_channels';

  static relationMappings = {
    participants: {
      relation: Model.HasManyRelation,
      modelClass: AllocatorChannelParticipant,
      join: {
        from: 'allocator_channels.id',
        to: 'allocator_channel_participants.allocator_channel_id',
      }
    },
    commitments: {
      relation: Model.HasManyRelation,
      modelClass: ConsensusCommitment,
      join: {
        from: 'allocator_channels.id',
        to: 'allocator_channel_commitments.allocator_channel_id'
      }
    }
  };

  get asCoreChannel(): Channel {
    return {
      channelType: this.rules_address,
      nonce: this.nonce,
      participants: this.participants.map(p => p.address),
    }
  }
}
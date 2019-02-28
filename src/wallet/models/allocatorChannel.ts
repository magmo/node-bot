import { Address, Channel, Uint32 } from 'fmg-core';
import { Model } from 'objection';
import AllocatorChannelParticipant from './allocator_channel_participant';
import ConsensusCommitment from './allocatorChannelCommitment';

export default class AllocatorChannel extends Model {
  get asCoreChannel(): Channel {
    return {
      channelType: this.rules_address,
      nonce: this.nonce,
      participants: this.participants.map(p => p.address),
    };
  }

  static tableName = 'allocator_channels';

  static relationMappings = {
    participants: {
      relation: Model.HasManyRelation,
      modelClass: AllocatorChannelParticipant,
      join: {
        from: 'allocator_channels.id',
        to: 'allocator_channel_participants.allocator_channel_id',
      },
    },
    commitments: {
      relation: Model.HasManyRelation,
      modelClass: ConsensusCommitment,
      join: {
        from: 'allocator_channels.id',
        to: 'allocator_channel_commitments.allocator_channel_id',
      },
    },
  };
  readonly id!: number;
  holdings!: number;
  nonce: Uint32;
  participants: AllocatorChannelParticipant[];
  commitments: ConsensusCommitment[];
  rules_address: Address;
}

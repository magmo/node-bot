"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const allocator_channel_participant_1 = require("./allocator_channel_participant");
const allocatorChannelCommitment_1 = require("./allocatorChannelCommitment");
class AllocatorChannel extends objection_1.Model {
    get asCoreChannel() {
        return {
            channelType: this.rules_address,
            nonce: this.nonce,
            participants: this.participants.map(p => p.address),
        };
    }
}
AllocatorChannel.tableName = 'allocator_channels';
AllocatorChannel.relationMappings = {
    participants: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: allocator_channel_participant_1.default,
        join: {
            from: 'allocator_channels.id',
            to: 'allocator_channel_participants.allocator_channel_id',
        },
    },
    commitments: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: allocatorChannelCommitment_1.default,
        join: {
            from: 'allocator_channels.id',
            to: 'allocator_channel_commitments.allocator_channel_id',
        },
    },
};
exports.default = AllocatorChannel;
//# sourceMappingURL=allocatorChannel.js.map
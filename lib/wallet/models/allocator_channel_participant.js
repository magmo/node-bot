"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
class AllocatorChannelParticipant extends objection_1.Model {
}
AllocatorChannelParticipant.tableName = 'allocator_channel_participants';
AllocatorChannelParticipant.relationMappings = {
    allocator_channel: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: AllocatorChannelParticipant,
        join: {
            from: 'allocator_channel_participants.allocator_channel_id',
            to: 'allocator_channels.id',
        },
    },
};
exports.default = AllocatorChannelParticipant;
//# sourceMappingURL=allocator_channel_participant.js.map
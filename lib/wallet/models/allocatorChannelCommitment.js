"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fmg_core_1 = require("fmg-core");
const objection_1 = require("objection");
class AllocatorChannelCommitment extends objection_1.Model {
    get toHex() {
        return fmg_core_1.toHex(this.asCoreCommitment);
    }
    get asCoreCommitment() {
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
}
AllocatorChannelCommitment.tableName = 'allocator_channel_commitments';
AllocatorChannelCommitment.relationMappings = {
    allocator_channel: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: `${__dirname}/allocatorChannel`,
        join: {
            from: 'allocator_channel_commitments.allocator_channel_id',
            to: 'allocator_channels.id',
        },
    },
    allocations: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: `${__dirname}/allocation`,
        join: {
            from: 'allocator_channel_commitments.id',
            to: 'allocations.allocator_channel_commitment_id',
        },
    },
};
exports.default = AllocatorChannelCommitment;
const priority = (allocation) => allocation.priority;
const amount = (allocation) => allocation.amount;
const destination = (allocation) => allocation.destination;
//# sourceMappingURL=allocatorChannelCommitment.js.map
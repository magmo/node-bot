"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const allocatorChannelCommitment_1 = require("./allocatorChannelCommitment");
class Allocation extends objection_1.Model {
}
Allocation.tableName = 'allocations';
Allocation.relationMappings = {
    commitment: {
        relation: objection_1.Model.BelongsToOneRelation,
        modelClass: allocatorChannelCommitment_1.default,
        join: {
            from: 'allocations.allocator_channel_commitment_id',
            to: 'allocator_channel_commitments.id',
        },
    },
};
exports.default = Allocation;
//# sourceMappingURL=allocation.js.map
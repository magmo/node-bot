"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const TABLE_NAME = 'allocator_channel_participants';
exports.up = async (knex) => {
    await knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments();
        table.integer('allocator_channel_id').notNullable();
        table.foreign('allocator_channel_id').references('allocator_channels.id');
        table.string('address').notNullable();
        table.integer('priority').notNullable();
        table.unique(["allocator_channel_id", "address"]);
        table.unique(["allocator_channel_id", "priority"]);
    });
    return utils_1.addAddressCheck(knex, TABLE_NAME, "address");
};
exports.down = (knex) => knex.schema.dropTable(TABLE_NAME);
//# sourceMappingURL=20190216153915_allocator_channel_participants.js.map
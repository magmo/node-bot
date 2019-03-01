"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const TABLE_NAME = 'allocator_channel_commitments';
exports.up = async (knex) => {
    await knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments();
        table.integer('allocator_channel_id').unsigned().notNullable();
        table.foreign('allocator_channel_id').references('allocator_channels.id');
        table.integer('turn_number').unsigned().notNullable();
        table.integer('commitment_type').unsigned().notNullable();
        table.integer('commitment_count').unsigned().notNullable();
        table.text('app_attrs').notNullable();
        table.unique(["allocator_channel_id", "turn_number"]);
    });
    await utils_1.addBytesCheck(knex, TABLE_NAME, "app_attrs");
};
exports.down = (knex) => knex.schema.dropTable(TABLE_NAME);
//# sourceMappingURL=20190219211138_allocator_channel_commitments.js.map
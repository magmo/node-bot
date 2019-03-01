"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const TABLE_NAME = 'allocations';
exports.up = async (knex) => {
    await knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments();
        table.integer('allocator_channel_commitment_id').unsigned().notNullable();
        table.foreign('allocator_channel_commitment_id').references('allocator_channel_commitments.id').onDelete("CASCADE");
        table.integer('priority').unsigned().notNullable();
        table.string('destination').notNullable();
        table.string('amount').notNullable();
        table.unique(["allocator_channel_commitment_id", "priority"]);
    });
    return utils_1.addAddressCheck(knex, TABLE_NAME, "destination");
};
exports.down = (knex) => knex.schema.dropTable(TABLE_NAME);
//# sourceMappingURL=20190219230549_allocations.js.map
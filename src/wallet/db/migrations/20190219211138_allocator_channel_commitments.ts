import * as Knex from "knex";
const TABLE_NAME = 'allocator_channel_commitments'

exports.up = async function(knex: Knex) {
    await knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments();
        table.integer('allocator_channel_id').unsigned().notNullable();
        table.foreign('allocator_channel_id').references('allocator_channels.id')
        table.integer('turn_number').unsigned().notNullable();
        table.integer('commitment_type').unsigned().notNullable();
        table.integer('commitment_count').unsigned().notNullable();
        table.integer('consensus_count').unsigned().notNullable();

        table.unique(["allocator_channel_id", "turn_number"])
      });
};

exports.down = function(knex: Knex) {
    return knex.schema.dropTable(TABLE_NAME)
};

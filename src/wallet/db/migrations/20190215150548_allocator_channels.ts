import * as Knex from 'knex';

const TABLE_NAME = 'allocator_channels';

exports.up = async (knex: Knex) => {
    await knex.schema.createTable(TABLE_NAME, table => {
        table.increments();
        table.string('rules_address').notNullable();
        // TODO: remove CASCADE
        table
            .foreign('rules_address')
            .references('rules.address')
            .onDelete('CASCADE');
        table
            .integer('nonce')
            .unsigned()
            .notNullable()
            .unique();
        table
            .integer('holdings')
            .unsigned()
            .notNullable();

        // NOTE: uniqueness on the nonce ensures unique channel ids
    });
};

exports.down = (knex: Knex) => knex.schema.dropTable(TABLE_NAME);

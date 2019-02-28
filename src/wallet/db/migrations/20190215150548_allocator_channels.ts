import * as Knex from 'knex';
import { addBytesCheck } from '../utils';

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
    table.text('holdings').notNullable(); // has to store a uint256

    // NOTE: uniqueness on the nonce ensures unique channel ids
  });

  await addBytesCheck(knex, TABLE_NAME, 'holdings');
};

exports.down = (knex: Knex) => knex.schema.dropTable(TABLE_NAME);

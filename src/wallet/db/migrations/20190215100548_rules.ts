import * as Knex from "knex";
import { addAddressCheck } from '../utils';

const TABLE_NAME = 'rules';

exports.up = async (knex: Knex) => {
    await knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments();
        table.string('address').notNullable().unique();
      });

    return addAddressCheck(knex, TABLE_NAME, "address");
};

exports.down = async (knex: Knex) => knex.schema.dropTable(TABLE_NAME);
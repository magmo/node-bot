"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const TABLE_NAME = 'rules';
exports.up = async (knex) => {
    await knex.schema.createTable(TABLE_NAME, (table) => {
        table.increments();
        table.string('address').notNullable().unique();
    });
    return utils_1.addAddressCheck(knex, TABLE_NAME, "address");
};
exports.down = async (knex) => knex.schema.dropTable(TABLE_NAME);
//# sourceMappingURL=20190215100548_rules.js.map
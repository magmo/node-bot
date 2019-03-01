"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addAddressCheck(knex, table, column) {
    return knex.raw(`\
    ALTER TABLE ${table}\
    ADD CONSTRAINT ${column}_is_address CHECK (${column} ~ '^0x[0-9a-fA-f]{40}$')
  `);
}
exports.addAddressCheck = addAddressCheck;
function addBytesCheck(knex, table, column) {
    return knex.raw(`\
    ALTER TABLE ${table}\
    ADD CONSTRAINT ${column}_is_bytes CHECK (${column} ~ '^0x[0-9a-fA-f]*$')
  `);
}
exports.addBytesCheck = addBytesCheck;
//# sourceMappingURL=utils.js.map
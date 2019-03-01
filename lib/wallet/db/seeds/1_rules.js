"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const constants_1 = require("../../../constants");
const rule_1 = require("../../models/rule");
const connection_1 = require("../connection");
objection_1.Model.knex(connection_1.default);
async function seed() {
    // Deletes ALL existing entries
    await connection_1.default('rules').del();
    await rule_1.default.query().insert({ address: constants_1.DUMMY_RULES_ADDRESS });
}
exports.seed = seed;
//# sourceMappingURL=1_rules.js.map
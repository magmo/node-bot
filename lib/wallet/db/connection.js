"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const Knex = require("knex");
dotenv_1.config();
const environment = process.env.NODE_ENV || 'development';
// tslint:disable-next-line:no-var-requires
const config = require('../../../knexfile')[environment];
const knex = Knex(config);
const objection_1 = require("objection");
objection_1.Model.knex(knex);
exports.default = knex;
//# sourceMappingURL=connection.js.map
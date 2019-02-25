import * as Knex from "knex"
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const environment = process.env.NODE_ENV || 'development';
//ts-lint: ignore
const config = require('../../../knexfile')[environment];

//ts-lint: ignore
const knex = Knex(config)

import { Model } from 'objection';
import { log } from "util";
Model.knex(knex)

export default knex;
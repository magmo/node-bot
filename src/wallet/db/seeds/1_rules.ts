import * as Knex from "knex";
import { DUMMY_RULES_ADDRESS } from "../../../constants"
import { Model } from "objection";
import knex from "../connection";
import Rule from "../../models/rule";
Model.knex(knex);

export async function seed(knex: Knex) {
  // Deletes ALL existing entries
  await knex('rules').del()

  await Rule.query().insert(
      { address: DUMMY_RULES_ADDRESS },
  );
}
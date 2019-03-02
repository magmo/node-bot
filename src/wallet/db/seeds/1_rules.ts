import { Model } from 'objection';
import { DUMMY_RULES_ADDRESS } from '../../../constants';
import Rule from '../../models/rule';
import knex from '../connection';
Model.knex(knex);

export function seed() {
  // Deletes ALL existing entries
  return knex('rules')
    .del()
    .then(() => {
      return Rule.query().insert({ address: DUMMY_RULES_ADDRESS });
    });
}

import { Model } from 'objection';
import { DUMMY_RULES_ADDRESS } from '../../../constants';
import Rule from '../../models/rule';
import knex from '../connection';
Model.knex(knex);

export async function seed() {
    // Deletes ALL existing entries
    await knex('rules').del();

    await Rule.query().insert({ address: DUMMY_RULES_ADDRESS });
}

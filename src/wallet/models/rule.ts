import { Model } from 'objection';
import { Address } from 'fmg-core';
import AllocatorChannel from './allocatorChannel';

export default class Rule extends Model {
  readonly id!: string;
  readonly address!: Address;
  readonly name!: string;

  static tableName = 'rules';
  static idColumn = 'address';

  static relationMappings = {
    channels: {
      relation: Model.HasManyRelation,
      modelClass: AllocatorChannel,
      join: {
        to: 'allocator_channels.rule_id',
        from: 'rules.id',
      }
    },
  };
}
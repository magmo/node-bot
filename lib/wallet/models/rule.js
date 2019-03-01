"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const allocatorChannel_1 = require("./allocatorChannel");
class Rule extends objection_1.Model {
}
Rule.tableName = 'rules';
Rule.idColumn = 'address';
Rule.relationMappings = {
    channels: {
        relation: objection_1.Model.HasManyRelation,
        modelClass: allocatorChannel_1.default,
        join: {
            to: 'allocator_channels.rule_id',
            from: 'rules.id',
        },
    },
};
exports.default = Rule;
//# sourceMappingURL=rule.js.map
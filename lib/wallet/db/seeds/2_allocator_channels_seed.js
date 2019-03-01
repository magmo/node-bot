"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fmg_core_1 = require("fmg-core");
const fmg_nitro_adjudicator_1 = require("fmg-nitro-adjudicator");
const objection_1 = require("objection");
const constants_1 = require("../../../constants");
const allocatorChannel_1 = require("../../models/allocatorChannel");
const connection_1 = require("../connection");
objection_1.Model.knex(connection_1.default);
const participants = [{ address: constants_1.PARTICIPANT_ADDRESS, priority: 0 }, { address: constants_1.HUB_ADDRESS, priority: 1 }];
const channel_1 = {
    rules_address: constants_1.DUMMY_RULES_ADDRESS,
    nonce: 1,
    holdings: 0,
    participants,
};
const channel_2 = {
    rules_address: constants_1.DUMMY_RULES_ADDRESS,
    nonce: 2,
    holdings: 0,
    participants,
};
const allocationByPriority = (priority) => ({
    priority,
    destination: constants_1.DESTINATION[priority],
    amount: constants_1.ALLOCATION[priority],
});
const allocations = () => [allocationByPriority(0), allocationByPriority(1)];
const app_attrs = (n) => fmg_nitro_adjudicator_1.bytesFromAppAttributes({
    consensusCounter: n,
    proposedAllocation: constants_1.ALLOCATION,
    proposedDestination: constants_1.DESTINATION,
});
function pre_fund_setup(turn_number) {
    return {
        turn_number,
        commitment_type: fmg_core_1.CommitmentType.PreFundSetup,
        commitment_count: turn_number,
        allocations: allocations(),
        app_attrs: app_attrs(0),
    };
}
const funded_channel = {
    rules_address: constants_1.DUMMY_RULES_ADDRESS,
    nonce: constants_1.FUNDED_CHANNEL_NONCE,
    holdings: constants_1.FUNDED_CHANNEL_HOLDINGS,
    commitments: [
        pre_fund_setup(0),
        pre_fund_setup(1),
    ],
    participants,
};
function post_fund_setup(turn_number) {
    return {
        turn_number,
        commitment_type: fmg_core_1.CommitmentType.PostFundSetup,
        commitment_count: turn_number % funded_channel.participants.length,
        allocations: allocations(),
        app_attrs: app_attrs(0),
    };
}
const beginning_app_phase_channel = {
    rules_address: constants_1.DUMMY_RULES_ADDRESS,
    nonce: constants_1.BEGINNING_APP_CHANNEL_NONCE,
    holdings: constants_1.BEGINNING_APP_CHANNEL_HOLDINGS,
    commitments: [
        post_fund_setup(2),
        post_fund_setup(3),
    ],
    participants,
};
function app(turn_number) {
    return {
        turn_number,
        commitment_type: fmg_core_1.CommitmentType.PostFundSetup,
        commitment_count: turn_number % funded_channel.participants.length,
        allocations: allocations(),
        app_attrs: app_attrs(turn_number % participants.length),
    };
}
const ongoing_app_phase_channel = {
    rules_address: constants_1.DUMMY_RULES_ADDRESS,
    nonce: constants_1.ONGOING_APP_CHANNEL_NONCE,
    holdings: constants_1.ONGOING_APP_CHANNEL_HOLDINGS,
    commitments: [
        app(4),
        app(5),
    ],
    participants,
};
exports.seeds = {
    channel_1,
    channel_2,
    funded_channel,
    beginning_app_phase_channel,
    ongoing_app_phase_channel,
};
async function seed() {
    await connection_1.default('allocator_channels').del();
    await allocatorChannel_1.default.query().insertGraph(Object.values(exports.seeds));
}
exports.seed = seed;
exports.constructors = {
    pre_fund_setup,
    post_fund_setup,
    app,
};
//# sourceMappingURL=2_allocator_channels_seed.js.map
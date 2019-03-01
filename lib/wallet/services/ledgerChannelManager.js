"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fmg_core_1 = require("fmg-core");
const fmg_nitro_adjudicator_1 = require("fmg-nitro-adjudicator");
const allocator_channels_1 = require("../db/queries/allocator_channels");
const errors_1 = require("../errors");
const allocatorChannel_1 = require("../models/allocatorChannel");
const allocatorChannelCommitment_1 = require("../models/allocatorChannelCommitment");
const channelManagement_1 = require("./channelManagement");
async function openLedgerChannel(theirCommitment, theirSignature) {
    if (await channelManagement_1.channelExists(theirCommitment)) {
        throw errors_1.default.CHANNEL_EXISTS;
    }
    if (!channelManagement_1.validSignature(theirCommitment, theirSignature)) {
        throw errors_1.default.COMMITMENT_NOT_SIGNED;
    }
    const allocator_channel = await allocator_channels_1.queries.openAllocatorChannel(theirCommitment);
    return channelManagement_1.formResponse(allocator_channel);
}
exports.openLedgerChannel = openLedgerChannel;
async function updateLedgerChannel(theirCommitment, theirSignature) {
    if (!channelManagement_1.validSignature(theirCommitment, theirSignature)) {
        throw errors_1.default.COMMITMENT_NOT_SIGNED;
    }
    if (!(await channelManagement_1.channelExists(theirCommitment))) {
        throw errors_1.default.CHANNEL_MISSING;
    }
    if (!await valuePreserved(theirCommitment)) {
        throw errors_1.default.VALUE_LOST;
    }
    if (!await validTransition(theirCommitment)) {
        throw errors_1.default.INVALID_TRANSITION;
    }
    const ourCommitment = nextCommitment(theirCommitment);
    const allocator_channel = await allocator_channels_1.queries.updateAllocatorChannel(theirCommitment, ourCommitment);
    return channelManagement_1.formResponse(allocator_channel);
}
exports.updateLedgerChannel = updateLedgerChannel;
function nextCommitment(theirCommitment) {
    switch (theirCommitment.commitmentType) {
        case fmg_core_1.CommitmentType.PreFundSetup:
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: theirCommitment.commitmentCount + 1 });
        case fmg_core_1.CommitmentType.PostFundSetup:
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: theirCommitment.commitmentCount + 1 });
        case fmg_core_1.CommitmentType.App:
            const { consensusCounter, proposedAllocation, proposedDestination } = fmg_nitro_adjudicator_1.appAttributesFromBytes(theirCommitment.appAttributes);
            const appAttributes = fmg_nitro_adjudicator_1.bytesFromAppAttributes({
                consensusCounter: consensusCounter + 1,
                proposedAllocation,
                proposedDestination,
            });
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: 0, appAttributes });
        case fmg_core_1.CommitmentType.Conclude:
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: theirCommitment.commitmentCount + 1 });
    }
}
exports.nextCommitment = nextCommitment;
async function valuePreserved(theirCommitment) {
    return theirCommitment && true;
}
exports.valuePreserved = valuePreserved;
async function validTransition(theirCommitment) {
    const { channel } = theirCommitment;
    const allocator_channel_id = (await allocatorChannel_1.default.query()
        .where({ rules_address: channel.channelType, nonce: channel.nonce })
        .select("id")
        .first()).id;
    const currentCommitment = await allocatorChannelCommitment_1.default.query()
        .where({ allocator_channel_id })
        .orderBy("id", "desc")
        .select()
        .first();
    return theirCommitment.turnNum === currentCommitment.turn_number + 1;
}
exports.validTransition = validTransition;
//# sourceMappingURL=ledgerChannelManager.js.map
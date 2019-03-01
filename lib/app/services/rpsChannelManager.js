"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fmg_core_1 = require("fmg-core");
const wallet_1 = require("../../wallet");
const allocatorChannel_1 = require("../../wallet/models/allocatorChannel");
const wallet_2 = require("../../wallet/");
const allocatorChannelCommitment_1 = require("../../wallet/models/allocatorChannelCommitment");
const rps_commitment_1 = require("./rps-commitment");
async function openLedgerChannel(theirCommitment, theirSignature) {
    if (await wallet_1.ChannelManagement.channelExists(theirCommitment)) {
        throw wallet_1.errors.CHANNEL_EXISTS;
    }
    if (!wallet_1.ChannelManagement.validSignature(theirCommitment, theirSignature)) {
        throw wallet_1.errors.COMMITMENT_NOT_SIGNED;
    }
    const allocator_channel = await wallet_2.queries.openAllocatorChannel(theirCommitment);
    return wallet_1.ChannelManagement.formResponse(allocator_channel);
}
exports.openLedgerChannel = openLedgerChannel;
async function updateLedgerChannel(theirCommitment, theirSignature) {
    if (!wallet_1.ChannelManagement.validSignature(theirCommitment, theirSignature)) {
        throw wallet_1.errors.COMMITMENT_NOT_SIGNED;
    }
    if (!(await wallet_1.ChannelManagement.channelExists(theirCommitment))) {
        throw wallet_1.errors.CHANNEL_MISSING;
    }
    if (!await valuePreserved(theirCommitment)) {
        throw wallet_1.errors.VALUE_LOST;
    }
    if (!await validTransition(theirCommitment)) {
        throw wallet_1.errors.INVALID_TRANSITION;
    }
    const ourCommitment = nextCommitment(theirCommitment);
    const allocator_channel = await wallet_2.queries.updateAllocatorChannel(theirCommitment, ourCommitment);
    return wallet_1.ChannelManagement.formResponse(allocator_channel);
}
exports.updateLedgerChannel = updateLedgerChannel;
function nextCommitment(theirCommitment) {
    switch (theirCommitment.commitmentType) {
        case fmg_core_1.CommitmentType.PreFundSetup:
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: theirCommitment.commitmentCount + 1 });
        case fmg_core_1.CommitmentType.PostFundSetup:
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: theirCommitment.commitmentCount + 1 });
        case fmg_core_1.CommitmentType.App:
            const ourMove = move(rps_commitment_1.fromCoreCommitment(theirCommitment));
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: 0, appAttributes: null //asCoreCommitment(ourMove).appAttributes,
             });
        case fmg_core_1.CommitmentType.Conclude:
            return Object.assign({}, theirCommitment, { turnNum: theirCommitment.turnNum + 1, commitmentCount: theirCommitment.commitmentCount + 1 });
    }
}
exports.nextCommitment = nextCommitment;
function move(theirPosition) {
    switch (theirPosition.positionType) {
        case rps_commitment_1.PositionType.Resting:
            const salt = '0xabc';
            const aPlay = null;
            return {
                stake: theirPosition.stake,
                positionType: rps_commitment_1.PositionType.Proposed,
                salt: '0x',
                preCommit: preCommit(rps_commitment_1.Play.Paper, salt),
                aPlay,
                bPlay: aPlay,
            };
        case rps_commitment_1.PositionType.Proposed:
            return theirPosition;
        case rps_commitment_1.PositionType.Accepted:
            return theirPosition;
        case rps_commitment_1.PositionType.Reveal:
            return theirPosition;
    }
}
function preCommit(play, salt) {
    return salt;
}
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
//# sourceMappingURL=rpsChannelManager.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const allocatorChannel_1 = require("../models/allocatorChannel");
const allocatorChannelCommitment_1 = require("../models/allocatorChannelCommitment");
const fmg_core_1 = require("fmg-core");
function validSignature(commitment, signature) {
    return fmg_core_1.recover(fmg_core_1.toHex(commitment), signature) === fmg_core_1.mover(commitment);
}
exports.validSignature = validSignature;
async function channelExists(theirCommitment) {
    const { channelType: rules_address, nonce } = theirCommitment.channel;
    const channel = await allocatorChannel_1.default
        .query()
        .where({ rules_address, nonce })
        .first();
    if (channel) {
        return true;
    }
    else {
        return false;
    }
}
exports.channelExists = channelExists;
async function formResponse(allocator_channel) {
    const commitment = await allocatorChannelCommitment_1.default.query()
        .eager("[allocator_channel.[participants],allocations]").findById(allocator_channel.commitments[1].id);
    const signature = fmg_core_1.sign(commitment.toHex, constants_1.HUB_PRIVATE_KEY);
    const { id: allocator_channel_id, participants, nonce, rules_address, holdings } = allocator_channel;
    const { id: commitment_id, turn_number, commitment_count, commitment_type, allocations, app_attrs } = commitment;
    return {
        commitment: {
            id: commitment_id,
            allocator_channel_id,
            turnNum: turn_number,
            commitmentCount: commitment_count,
            commitmentType: commitment_type,
            allocation: allocations.map(amount),
            destination: allocations.map(destination),
            channel: {
                channelType: rules_address,
                nonce,
                participants: participants.map(address),
            },
            appAttributes: app_attrs,
        },
        allocator_channel: {
            id: allocator_channel_id,
            nonce,
            channelType: rules_address,
            participants: participants.map(address),
            holdings,
        }, signature,
    };
}
exports.formResponse = formResponse;
const destination = (allocation) => allocation.destination;
const amount = (allocation) => allocation.amount;
const address = (participant) => participant.address;
//# sourceMappingURL=channelManagement.js.map
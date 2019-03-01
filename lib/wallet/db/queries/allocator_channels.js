"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fmg_core_1 = require("fmg-core");
const allocatorChannel_1 = require("../../models/allocatorChannel");
exports.queries = {
    openAllocatorChannel,
    updateAllocatorChannel,
};
async function openAllocatorChannel(theirCommitment) {
    const { channel, allocation, destination, } = theirCommitment;
    const { participants, channelType: rules_address, nonce } = channel;
    const allocationByPriority = (priority) => ({
        priority,
        destination: destination[priority],
        amount: allocation[priority],
    });
    const allocations = () => [allocationByPriority(0), allocationByPriority(1)];
    const commitment = (turn_number) => ({
        turn_number,
        commitment_type: fmg_core_1.CommitmentType.PreFundSetup,
        commitment_count: turn_number,
        allocations: allocations(),
        app_attrs: theirCommitment.appAttributes,
    });
    const commitments = [commitment(0), commitment(1)];
    return allocatorChannel_1.default
        .query()
        .eager('[commitments, participants]')
        .insertGraphAndFetch({
        rules_address,
        holdings: 0,
        commitments,
        nonce,
        participants: participants.map((address, i) => ({ address, priority: i })),
    });
}
async function updateAllocatorChannel(theirCommitment, hubCommitment) {
    const { channel, } = theirCommitment;
    const { channelType, nonce, } = channel;
    const allocator_channel = await allocatorChannel_1.default.query()
        .where({ nonce, rules_address: channelType })
        .select("id")
        .first();
    if (!allocator_channel.id) {
        throw new Error("Channel does not exist");
    }
    const allocationByPriority = (priority, c) => ({
        priority,
        destination: c.destination[priority],
        amount: c.allocation[priority],
    });
    const allocations = (c) => [allocationByPriority(0, c), allocationByPriority(1, c)];
    const commitment = (c) => ({
        turn_number: c.turnNum,
        commitment_type: c.commitmentType,
        commitment_count: c.commitmentCount,
        allocations: allocations(c),
        app_attrs: c.appAttributes,
    });
    const commitments = [commitment(theirCommitment), commitment(hubCommitment)];
    return allocatorChannel_1.default
        .query()
        .eager('[commitments.[allocations],participants]')
        .upsertGraphAndFetch({
        id: allocator_channel.id,
        commitments,
    });
}
//# sourceMappingURL=allocator_channels.js.map
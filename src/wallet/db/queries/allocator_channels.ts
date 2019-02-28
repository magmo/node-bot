import {
    Address,
    Commitment,
    CommitmentType,
    Signature,
    Uint32,
} from 'fmg-core';
import { CommitmentString } from '../../../types';
import AllocatorChannel from '../../models/allocatorChannel';

export interface CreateAllocatorChannelParams {
    commitment: CommitmentString;
    signature: Signature;
}
export interface IAllocatorChannel {
    channelId: Address;
    channelType: Address;
    nonce_id: number;
}

export const queries = {
    openAllocatorChannel,
    updateAllocatorChannel,
};

async function openAllocatorChannel(
    theirCommitment: Commitment,
    extractAppAttrs: (Bytes) => any,
) {
    const { channel, allocation, destination } = theirCommitment;
    const { participants, channelType: rules_address, nonce } = channel;

    const allocationByPriority = (priority: number) => ({
        priority,
        destination: destination[priority],
        amount: allocation[priority],
    });

    const allocations = () => [
        allocationByPriority(0),
        allocationByPriority(1),
    ];

    const commitment = (turn_number: Uint32) => ({
        turn_number,
        commitment_type: CommitmentType.PreFundSetup,
        commitment_count: turn_number,
        allocations: allocations(),
        app_attrs: extractAppAttrs(theirCommitment.appAttributes),
    });

    const commitments = [commitment(0), commitment(1)];

    return AllocatorChannel.query()
        .eager('[commitments, participants]')
        .insertGraphAndFetch({
            rules_address,
            holdings: 0,
            commitments,
            nonce,
            participants: participants.map((address, i) => ({
                address,
                priority: i,
            })),
        });
}

async function updateAllocatorChannel(
    theirCommitment: Commitment,
    hubCommitment: Commitment,
    extractAppAttrs: (Bytes) => any,
) {
    const { channel } = theirCommitment;
    const { channelType, nonce } = channel;

    const allocator_channel = await AllocatorChannel.query()
        .where({ nonce, rules_address: channelType })
        .select('id')
        .first();

    if (!allocator_channel.id) {
        throw new Error('Channel does not exist');
    }

    const allocationByPriority = (priority: number, c: Commitment) => ({
        priority,
        destination: c.destination[priority],
        amount: c.allocation[priority],
    });

    const allocations = (c: Commitment) => [
        allocationByPriority(0, c),
        allocationByPriority(1, c),
    ];

    const commitment = (c: Commitment) => ({
        turn_number: c.turnNum,
        commitment_type: c.commitmentType,
        commitment_count: c.commitmentCount,
        allocations: allocations(c),
        app_attrs: extractAppAttrs(c.appAttributes),
    });

    const commitments = [
        commitment(theirCommitment),
        commitment(hubCommitment),
    ];

    return AllocatorChannel.query()
        .eager('[commitments.[allocations],participants]')
        .upsertGraphAndFetch({
            id: allocator_channel.id,
            commitments,
        });
}

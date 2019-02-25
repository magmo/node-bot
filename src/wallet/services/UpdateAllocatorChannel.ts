import { UpdateAllocatorChannelParams, updateLatestCommitment } from "../db/queries/allocator_channel_commitments";

export type UpdateAllocatorChannelParams = UpdateAllocatorChannelParams;

export function updateAllocatorChannel(params: UpdateAllocatorChannelParams) {
    let channel
    let nextCommitment

    // Check if the channel exists
    if (!channel) {
        throw new Error("Channel does not exist")
    }

    // If channel exists, check if the update is properly signed
    if (!verifySignature(channel)) {
        throw new Error("Signature not verified")
    }

    // Check that the commitment update is value preserving
    if (!valuePreserved(channel, nextCommitment)) {
        throw new Error("Value not preserved")
    }

    return updateLatestCommitment(channel, nextCommitment);
}

function valuePreserved(channel: any, nextCommitment: any): boolean {
    return channel && false;
}

function verifySignature(channel: any): boolean {
    return channel && false;
}
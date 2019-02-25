import {
    queries
} from "./db/queries/allocator_channels"

import * as services from "./services";
import { Commitment, Signature, } from "fmg-core";
import { ChannelResponse } from "./services";

export function getAllAllocatorChannels() {
    return queries.getAllAllocatorChannels();
}

export function getSingleAllocatorChannel(id: number) {
    return queries.getSingleAllocatorChannel(id)
}

export function openAllocatorChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    return services.openAllocatorChannel(theirCommitment, theirSignature);
}

export function updateAllocatorChannel(theirCommitment: Commitment, theirSignature: Signature): Promise<ChannelResponse> {
    return services.openAllocatorChannel(theirCommitment, theirSignature);
}

export function channelExists(theirCommitment: Commitment): Promise<boolean> {
    return services.channelExists(theirCommitment);
}
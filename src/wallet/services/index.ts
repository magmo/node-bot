import { Commitment, Uint32, Channel, Signature, Address, Uint256 } from "fmg-core";
import ChannelManagement from "./channelManagement";
import { Blockchain } from "./blockchain";

export interface IAllocatorChannel extends Channel {
    id: number;
    holdings: Uint32;
}

export interface IAllocatorChannelCommitment extends Commitment {
    id: number;
    allocator_channel_id: number;
}

export interface ChannelResponse {
    allocator_channel: IAllocatorChannel;
    commitment: IAllocatorChannelCommitment;
    signature: Signature;
}

export const channelExists: (c: Commitment) => Promise<boolean> = ChannelManagement.channelExists
export const openAllocatorChannel: (c: Commitment, s: Signature) => Promise<ChannelResponse> = ChannelManagement.openAllocatorChannel
export const updateAllocatorChannel: (c: Commitment, s: Signature) => Promise<ChannelResponse>  = ChannelManagement.updateAllocatorChannel
export const fund: (id: Address, amount: Uint256) => Promise<Uint256>  = Blockchain.fund
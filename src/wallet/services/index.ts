import { Commitment, Uint32, Channel, Signature, Address, Uint256 } from "fmg-core";
import LedgerChannelManagement from "./ledgerChannelManagement";
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

export const channelExists: (c: Commitment) => Promise<boolean> = LedgerChannelManagement.channelExists;
export const openLedgerChannel: (c: Commitment, s: Signature) => Promise<ChannelResponse> = LedgerChannelManagement.openLedgerChannel;
export const updateLedgerChannel: (c: Commitment, s: Signature) => Promise<ChannelResponse>  = LedgerChannelManagement.updateLedgerChannel;
export const fund: (id: Address, amount: Uint256) => Promise<Uint256>  = Blockchain.fund;
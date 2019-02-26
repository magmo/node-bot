import { Commitment, Uint32, Channel, Signature, Address, Uint256 } from "fmg-core";
import * as LedgerChannelManager from "./ledgerChannelManager";
import { Blockchain } from "./blockchain";
import * as ChannelManagement from "./channelManagement";

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

export const channelExists: (c: Commitment) => Promise<boolean> = ChannelManagement.channelExists;
export const openLedgerChannel: (c: Commitment, s: Signature) => Promise<ChannelResponse> = LedgerChannelManager.openLedgerChannel;
export const updateLedgerChannel: (c: Commitment, s: Signature) => Promise<ChannelResponse>  = LedgerChannelManager.updateLedgerChannel;
export const fund: (id: Address, amount: Uint256) => Promise<Uint256>  = Blockchain.fund;
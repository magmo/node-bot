import {
  Address,
  Channel,
  Commitment,
  Signature,
  Uint256,
  Uint32,
} from 'fmg-core';
import { LedgerCommitment } from '../../types';
import { Blockchain } from './blockchain';
import * as ChannelManagement from './channelManagement';
import * as LedgerChannelManager from './ledgerChannelManager';

export interface IAllocatorChannel extends Channel {
  id: number;
  holdings: Uint32;
}

export interface IAllocatorChannelCommitment extends Commitment {
  id: number;
  allocator_channel_id: number;
}

export interface ChannelResponse {
  commitment: Commitment;
  signature: Signature;
}

export const channelExists: (c: Commitment) => Promise<boolean> =
  ChannelManagement.channelExists;
export const openLedgerChannel: (
  c: LedgerCommitment,
  s: Signature,
) => Promise<ChannelResponse> = LedgerChannelManager.openLedgerChannel;
export const updateLedgerChannel: (
  c: LedgerCommitment,
  s: Signature,
) => Promise<ChannelResponse> = LedgerChannelManager.updateLedgerChannel;
export const fund: (id: Address, amount: Uint256) => Promise<Uint256> =
  Blockchain.fund;

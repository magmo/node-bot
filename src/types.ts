import { Address, Bytes, Bytes32, Uint32, Uint8 } from 'fmg-core';

export type CommitmentString = string;

export interface Signature {
  r: Bytes32;
  s: Bytes32;
  v: Uint8;
}

export interface UpdateChannelParams {
  from: Address;
  commitment: CommitmentString;
  signature: Signature;
}

export type AppAttrExtractor = (attrs: Bytes) => GenericAppAttributes;
export type AppAttrSanitizer = (attrs: GenericAppAttributes) => Bytes;
export interface GenericAppAttributes {
  [x: string]: any;
}

export { Address, Bytes32, Bytes, Uint8, Uint32 };

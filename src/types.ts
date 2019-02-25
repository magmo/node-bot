import { Address, Bytes32, Uint8, Uint32, Bytes, } from "fmg-core";

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

export { Address, Bytes32, Bytes, Uint8, Uint32 };

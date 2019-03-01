import { BaseCommitment, Bytes32, CommitmentType, Uint256 } from 'fmg-core';
import {
  AppAttributes,
  generateSalt,
  hashCommitment,
  Play,
  PositionType,
  RPSCommitment,
} from '../src/app/services/rps-commitment';

// Commitment Constructors
// =====================

export interface BaseWithBuyInParams extends BaseCommitment {
  stake: Uint256;
}

function base(obj: BaseCommitment): BaseCommitment {
  const {
    channel,
    turnNum,
    allocation,
    destination,
    commitmentCount,
    commitmentType,
  } = obj;
  return {
    channel,
    turnNum,
    allocation,
    destination,
    commitmentCount,
    commitmentType,
  };
}

const zeroBytes32: Bytes32 = '0x' + '0'.repeat(64);
function defaultAppAttrs(stake): AppAttributes {
  return {
    stake,
    positionType: 0,
    preCommit: zeroBytes32,
    aPlay: Play.None,
    bPlay: Play.None,
    salt: zeroBytes32,
  };
}

function preFundSetupA(obj: BaseWithBuyInParams): RPSCommitment {
  return {
    ...base(obj),
    commitmentCount: 0,
    commitmentType: CommitmentType.PreFundSetup,
    appAttributes: defaultAppAttrs(obj.stake),
  };
}

function preFundSetupB(obj: BaseWithBuyInParams): RPSCommitment {
  return {
    ...base(obj),
    commitmentCount: 1,
    commitmentType: CommitmentType.PreFundSetup,
    appAttributes: defaultAppAttrs(obj.stake),
  };
}

function postFundSetupA(obj: BaseWithBuyInParams): RPSCommitment {
  return {
    ...base(obj),
    commitmentCount: 0,
    commitmentType: CommitmentType.PostFundSetup,
    appAttributes: defaultAppAttrs(obj.stake),
  };
}

function postFundSetupB(obj: BaseWithBuyInParams): RPSCommitment {
  return {
    ...base(obj),
    commitmentCount: 1,
    commitmentType: CommitmentType.PostFundSetup,
    appAttributes: defaultAppAttrs(obj.stake),
  };
}

interface ProposeParams extends BaseWithBuyInParams {
  aPlay: Play;
}

function propose(obj: ProposeParams): RPSCommitment {
  const salt = generateSalt();
  const preCommit = hashCommitment(obj.aPlay, salt);
  const appAttributes: AppAttributes = {
    ...defaultAppAttrs(obj.stake),
    aPlay: obj.aPlay,
    salt,
    preCommit,
    positionType: PositionType.Proposed,
  };
  return {
    ...base(obj),
    commitmentType: CommitmentType.App,
    appAttributes,
  };
}

interface AcceptParams extends BaseWithBuyInParams {
  preCommit: string;
  bPlay: Play;
}

function accept(obj: AcceptParams): RPSCommitment {
  const { preCommit, bPlay } = obj;
  const appAttributes = {
    ...defaultAppAttrs(obj.stake),
    preCommit,
    bPlay,
    positionType: PositionType.Accepted,
  };
  return {
    ...base(obj),
    commitmentType: CommitmentType.App,
    appAttributes,
  };
}

interface RevealParams extends BaseWithBuyInParams {
  bPlay: Play;
  aPlay: Play;
  salt: string;
}

function reveal(obj: RevealParams): RPSCommitment {
  const { aPlay, bPlay, salt } = obj;
  const appAttributes = {
    ...defaultAppAttrs(obj.stake),
    aPlay,
    bPlay,
    salt,
    positionType: PositionType.Reveal,
    preCommit: hashCommitment(aPlay, salt),
  };
  return {
    ...base(obj),
    commitmentType: CommitmentType.App,
    appAttributes,
  };
}

function resting(obj: BaseWithBuyInParams): RPSCommitment {
  const appAttributes = {
    ...defaultAppAttrs(obj.stake),
    positionType: PositionType.Resting,
  };
  return {
    ...base(obj),
    commitmentType: CommitmentType.App,
    appAttributes,
  };
}

function conclude(obj: BaseCommitment): RPSCommitment {
  return {
    ...base(obj),
    commitmentType: CommitmentType.Conclude,
    appAttributes: defaultAppAttrs(zeroBytes32),
  };
}

export const constructors = {
  preFundSetupA,
  preFundSetupB,
  postFundSetupA,
  postFundSetupB,
  propose,
  accept,
  reveal,
  resting,
  conclude,
};

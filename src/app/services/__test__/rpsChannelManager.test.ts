import { CommitmentType, toUint256 } from 'fmg-core';
import {
  BaseWithBuyInParams,
  constructors,
} from '../../../../test/rps_test_data';
import { funded_channel } from '../../../../test/test_data';
import { ALLOCATION, DESTINATION } from '../../../constants';
import {
  Play,
  PositionType,
  RPSCommitment,
  zeroBytes32,
} from '../rps-commitment';
import * as RpsChannelManager from '../rpsChannelManager';

process.env.NODE_ENV = 'test';

let pre_fund_setup_0: RPSCommitment;
let propose: RPSCommitment;
let accept: RPSCommitment;
let reveal: RPSCommitment;
let resting: RPSCommitment;

const base: BaseWithBuyInParams = {
  channel: funded_channel,
  stake: toUint256(10),
  turnNum: 0,
  allocation: ALLOCATION,
  destination: DESTINATION,
  commitmentCount: 0,
  commitmentType: CommitmentType.PreFundSetup,
};
const APLAY = Play.Paper;
const BPLAY = Play.Scissors;

function sanitize(c: RPSCommitment): RPSCommitment {
  switch (c.appAttributes.positionType) {
    case PositionType.Proposed:
      return {
        ...c,
        appAttributes: {
          ...c.appAttributes,
          aPlay: Play.None,
          salt: zeroBytes32,
        },
      };
    case PositionType.Resting:
    case PositionType.Accepted:
    case PositionType.Reveal:
      return c;
  }
}

beforeEach(() => {
  pre_fund_setup_0 = constructors.preFundSetupA(base);

  propose = constructors.propose({ ...base, aPlay: APLAY });
  const { stake } = propose.appAttributes;
  accept = constructors.accept({
    ...base,
    turnNum: propose.turnNum + 1,
    bPlay: BPLAY,
    preCommit: propose.appAttributes.preCommit,
  });
  reveal = constructors.reveal({
    ...accept,
    turnNum: accept.turnNum + 1,
    aPlay: APLAY,
    salt: propose.appAttributes.salt,
    bPlay: BPLAY,
    stake,
  });

  resting = constructors.resting({
    ...accept,
    turnNum: reveal.turnNum + 1,
    stake,
  });
});

describe('nextCommitment', () => {
  it('throws on non-app commitments', () => {
    expect(() =>
      RpsChannelManager.nextCommitment(pre_fund_setup_0),
    ).toThrowError('Must be an app commitment');
  });

  it('works on propose commitments', async () => {
    expect(
      // Our opponent would have sanitized their propose
      await RpsChannelManager.nextCommitment(sanitize(propose), {
        ourPlay: BPLAY,
      }),
    ).toMatchObject(accept);
  });

  it('works on accept commitments', async () => {
    expect(
      // Our opponent would have built accept off of our sanitized propose
      await RpsChannelManager.nextCommitment(sanitize(accept), {
        ourLastPosition: propose.appAttributes,
      }),
    ).toMatchObject(reveal);
  });

  it('works on reveal commitments', async () => {
    expect(await RpsChannelManager.nextCommitment(reveal)).toMatchObject(
      resting,
    );
  });

  it('works on resting commitments', async () => {
    expect(
      await RpsChannelManager.nextCommitment(resting, { ourPlay: APLAY }),
    ).toMatchObject({
      ...propose,
      turnNum: resting.turnNum + 1,
    });
  });
});

describe('updateRPSChannel', () => {
  it.skip('works', () => {
    expect.assertions(1);
  });
});

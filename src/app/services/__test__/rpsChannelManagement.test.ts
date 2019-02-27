import { Commitment, Signature, } from "fmg-core";
import { beginning_app_phase_channel, constructors as testDataConstructors, } from "../../../../test/test_data";
import * as RpsChannelManager from "../rpsChannelManager";

process.env.NODE_ENV = 'test';

let pre_fund_setup_0: Commitment;
let pre_fund_setup_1: Commitment;
let post_fund_setup_0: Commitment;
let post_fund_setup_1: Commitment;
let app_0: Commitment;
let app_1: Commitment;
let theirSignature: Signature;
let hubSignature: Signature;

beforeEach(() => {
  pre_fund_setup_0 = testDataConstructors.pre_fund_setup(0);
  pre_fund_setup_1 = testDataConstructors.pre_fund_setup(1);

  post_fund_setup_0 = testDataConstructors.post_fund_setup(2);
  post_fund_setup_1 = testDataConstructors.post_fund_setup(3);

  app_0 = testDataConstructors.app(4, beginning_app_phase_channel);
  app_1 = testDataConstructors.app(5, beginning_app_phase_channel);
});

describe('nextCommitment', () => {
  it('throws on app commitments', () => {
    expect(() => RpsChannelManager.nextCommitment(app_0)).toMatchObject(app_1);
  });

  it('works on app commitments', () => {
    expect(RpsChannelManager.nextCommitment(app_0)).toMatchObject(app_1);
  });

  it.skip('works on conclude commitments', () => {
    expect.assertions(1);
  });
});
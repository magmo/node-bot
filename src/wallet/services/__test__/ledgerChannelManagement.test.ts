import { constructors as testDataConstructors, pre_fund_setup_1_response, created_channel_response, post_fund_setup_1_response, funded_channel_response, funded_channel, app_1_response, beginning_app_phase_channel, ongoing_app_phase_channel } from "../../../../test/test_data";
import * as LedgerChannelManager from "../ledgerChannelManager";
import * as ChannelManagement from "../channelManagement";
import { toHex, sign, Commitment, Signature } from "fmg-core";
import { HUB_PRIVATE_KEY, UNKNOWN_RULES_ADDRESS, PARTICIPANT_PRIVATE_KEY, OTHER_PRIVATE_KEY, HUB_ADDRESS, DUMMY_RULES_ADDRESS, FUNDED_CHANNEL_NONCE, PARTICIPANTS } from "../../../constants";
import errors from "../../errors";

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


describe("openLedgerChannel", () => {
  beforeEach(() => {
    theirSignature = sign(toHex(pre_fund_setup_0), PARTICIPANT_PRIVATE_KEY);
  })

  it("should return an allocator channel and a signed commitment", async () => {
    const { allocator_channel, commitment, signature } = await LedgerChannelManager.openLedgerChannel(pre_fund_setup_0, theirSignature);
    expect(allocator_channel).toMatchObject(created_channel_response);
    expect(commitment).toMatchObject(pre_fund_setup_1_response);

    expect(ChannelManagement.validSignature(commitment, signature)).toBe(true);
  });

  it('throws when the rules are not known', async () => {
    expect.assertions(1);

    const unknown_rules = JSON.parse(JSON.stringify(pre_fund_setup_1));
    unknown_rules.channel.channelType = UNKNOWN_RULES_ADDRESS;
    const signature = sign(toHex(unknown_rules), HUB_PRIVATE_KEY);
    await LedgerChannelManager.openLedgerChannel(unknown_rules, signature).catch( err => {
      expect(err.message).toMatch(
        'insert or update on table \"allocator_channels\" violates foreign key constraint \"allocator_channels_rules_address_foreign\"'
      );
    });
  });

  it('throws when the commitment is incorrectly signed', async () => {
    expect.assertions(1);
    theirSignature = sign(toHex(pre_fund_setup_0), "0xf00");

    await LedgerChannelManager.openLedgerChannel(pre_fund_setup_0, theirSignature).catch((err: Error) => {
      expect(err).toMatchObject(errors.COMMITMENT_NOT_SIGNED);
    });
  });

  it('throws when the channel exists', async () => {
    expect.assertions(1);

    pre_fund_setup_0.channel = {
      channelType: DUMMY_RULES_ADDRESS,
      nonce: FUNDED_CHANNEL_NONCE,
      participants: PARTICIPANTS,
    }

    await LedgerChannelManager.openLedgerChannel(pre_fund_setup_0, theirSignature).catch((err: Error) => {
      expect(err).toMatchObject(errors.CHANNEL_EXISTS);
    });
  });
});

describe("updateLedgerChannel", () => {
  describe('transitioning to a postFundSetup commitment', () => {
    beforeEach(() => {
      theirSignature = sign(toHex(post_fund_setup_0), PARTICIPANT_PRIVATE_KEY);
  
    });
  
    it("should return an allocator channel and a signed commitment", async () => {
      const { allocator_channel, commitment, signature } = await LedgerChannelManager.updateLedgerChannel(post_fund_setup_0, theirSignature);
      expect(allocator_channel).toMatchObject(funded_channel_response);
      expect(commitment).toMatchObject(post_fund_setup_1_response);
  
      expect(ChannelManagement.validSignature(commitment, signature)).toBe(true);
    });
  
    it('throws when the commitment is incorrectly signed', async () => {
      expect.assertions(1);
      theirSignature = sign(toHex(post_fund_setup_0), "0xf00");
      await LedgerChannelManager.updateLedgerChannel(post_fund_setup_0, theirSignature).catch((err: Error) => {
        expect(err).toMatchObject(errors.COMMITMENT_NOT_SIGNED);
      });
    });
  
    it('throws when the transition is invalid', async () => {
      expect.assertions(1);
      post_fund_setup_0.turnNum = 0;
  
      await LedgerChannelManager.updateLedgerChannel(post_fund_setup_0, theirSignature).catch(err => {
        expect(err).toMatchObject(errors.INVALID_TRANSITION);
      });
    });

    it('throws when the channel doesn\'t exist', async () => {
      expect.assertions(1);

      post_fund_setup_0.channel = { ...post_fund_setup_0.channel, nonce: 999 }
  
      await LedgerChannelManager.updateLedgerChannel(post_fund_setup_0, theirSignature).catch(err => {
        expect(err).toMatchObject(errors.CHANNEL_MISSING);
      });
    });
  
    it.skip('throws when the update is not value preserving', async () => {
      expect.assertions(1);
  
      await LedgerChannelManager.updateLedgerChannel(post_fund_setup_0, theirSignature).catch(err => {
        expect(err).toMatchObject(errors.VALUE_LOST);
      });
    });

    it.skip('throws when the app is not funded', async () => {
      expect.assertions(1)
    });
  });

  describe('transitioning to an app commitment', () => {
    beforeEach(() => {
      theirSignature = sign(toHex(app_0), PARTICIPANT_PRIVATE_KEY);
    });

    it("should return an allocator channel and a signed commitment", async () => {
      const { allocator_channel, commitment, signature } = await LedgerChannelManager.updateLedgerChannel(app_0, theirSignature);
      expect(allocator_channel).toMatchObject(beginning_app_phase_channel);
      expect(commitment).toMatchObject(app_1_response);
  
      expect(ChannelManagement.validSignature(commitment, signature)).toBe(true);
    });
  });

  describe.skip('transitioning to a conclude commitment', () => {
    it('works', () => {
      expect.assertions(1);
    });
  });
});

describe.skip('validTransition', () => {
  it('works', () => {
    expect.assertions(1);
  });
});

describe.skip('valuePreserved', () => {
  it('works', () => {
    expect.assertions(1);
  });
});

describe.skip('channelFunded', () => {
  it('works', () => {
    expect.assertions(1);
  });
});

describe('nextCommitment', () => {
  it('works on preFundSetup commitments', () => {
    expect(LedgerChannelManager.nextCommitment(pre_fund_setup_0)).toMatchObject(pre_fund_setup_1);
  });

  it('works on postFundSetup commitments', () => {
    expect(LedgerChannelManager.nextCommitment(post_fund_setup_0)).toMatchObject(post_fund_setup_1);
  });

  it('works on app commitments', () => {
    expect(LedgerChannelManager.nextCommitment(app_0)).toMatchObject(app_1);
  });

  it.skip('works on conclude commitments', () => {
    expect.assertions(1);
  });
});
import { constructors as testDataConstructors, pre_fund_setup_1_response, created_channel_response, post_fund_setup_1_response, funded_channel_response, funded_channel, app_1_response } from "../../../../test/test_data";
import ChannelManagement from "../channelManagement";
import { toHex, sign, Commitment, Signature } from "fmg-core";
import { HUB_PRIVATE_KEY, UNKNOWN_RULES_ADDRESS, PARTICIPANT_PRIVATE_KEY, OTHER_PRIVATE_KEY, HUB_ADDRESS } from "../../../constants";
import { mockFunction, restoreFunctions, returnTrue, returnFalse } from "../../../../test-helpers"
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

  app_0 = testDataConstructors.app(4, funded_channel);
  app_1 = testDataConstructors.app(5, funded_channel);
});

afterEach(() => {
  restoreFunctions(ChannelManagement);
});


describe("validateCommitment", () => {
  it("returns true when the commitment was signed by the mover", async () => {
    const signature = sign(toHex(pre_fund_setup_1), HUB_PRIVATE_KEY)
    expect(await ChannelManagement.validSignature(pre_fund_setup_1, signature)).toBe(true);
  });

  it("returns false when the commitment was not signed by the mover", async () => {
    const signature = sign(toHex(pre_fund_setup_0), HUB_PRIVATE_KEY)
    expect(await ChannelManagement.validSignature(pre_fund_setup_0, signature)).toBe(false);
  });

  it("returns false when the commitment was not signed by the mover", async () => {
    const signature = sign(toHex(pre_fund_setup_0), "0xf00")
    expect(await ChannelManagement.validSignature(pre_fund_setup_0, signature)).toBe(false);
  });
});

describe("openAllocatorChannel", () => {
  beforeEach(() => {
    theirSignature = sign(toHex(post_fund_setup_0), PARTICIPANT_PRIVATE_KEY);

    mockFunction(ChannelManagement, "channelExists", returnFalse);
    mockFunction(ChannelManagement, "validTransition", returnTrue);
    mockFunction(ChannelManagement, "validSignature", returnTrue);
    mockFunction(ChannelManagement, "valuePreserved", returnTrue);
  })

  it("should return an allocator channel and a signed commitment", async () => {
    const theirSignature = sign(toHex(pre_fund_setup_0), "0xf00")
    const { allocator_channel, commitment, signature } = await ChannelManagement.openAllocatorChannel(pre_fund_setup_0, theirSignature);
    expect(allocator_channel).toMatchObject(created_channel_response);
    expect(commitment).toMatchObject(pre_fund_setup_1_response);

    expect(await ChannelManagement.validSignature(commitment, signature)).toBe(true);
  });

  it('throws when the rules are not known', async () => {
    expect.assertions(1);

    const unknown_rules = JSON.parse(JSON.stringify(pre_fund_setup_1));
    unknown_rules.channel.channelType = UNKNOWN_RULES_ADDRESS;
    const signature = sign(toHex(unknown_rules), HUB_PRIVATE_KEY);
    await ChannelManagement.openAllocatorChannel(unknown_rules, signature).catch( err => {
      expect(err.message).toMatch(
        'insert or update on table \"allocator_channels\" violates foreign key constraint \"allocator_channels_rules_address_foreign\"'
      );
    })
  });

  it('throws when the commitment is invalid', async () => {
    mockFunction(ChannelManagement, "validSignature", returnFalse);
    expect.assertions(1);

    await ChannelManagement.openAllocatorChannel(pre_fund_setup_0, theirSignature).catch((err: Error) => {
      expect(err).toMatchObject(errors.COMMITMENT_NOT_SIGNED)
    });
  });

  it('throws when the channel exists', async () => {
    mockFunction(ChannelManagement, "channelExists", returnTrue);
    expect.assertions(1);

    await ChannelManagement.openAllocatorChannel(pre_fund_setup_0, theirSignature).catch((err: Error) => {
      expect(err).toMatchObject(errors.CHANNEL_EXISTS)
    });
  });
});

describe("updateAllocatorChannel", () => {
  describe('transitioning to a postFundSetup commitment', () => {
    beforeEach(() => {
      theirSignature = sign(toHex(post_fund_setup_0), PARTICIPANT_PRIVATE_KEY);
  
      mockFunction(ChannelManagement, "channelExists", returnTrue);
      mockFunction(ChannelManagement, "validTransition", returnTrue);
      mockFunction(ChannelManagement, "validSignature", returnTrue);
      mockFunction(ChannelManagement, "valuePreserved", returnTrue);
    })
  
    it("should return an allocator channel and a signed commitment", async () => {
      const { allocator_channel, commitment, signature } = await ChannelManagement.updateAllocatorChannel(post_fund_setup_0, theirSignature);
      expect(allocator_channel).toMatchObject(funded_channel_response);
      expect(commitment).toMatchObject(post_fund_setup_1_response);
  
      expect(await ChannelManagement.validSignature(commitment, signature)).toBe(true);
    });
  
    it('throws when the commitment is invalid', async () => {
      mockFunction(ChannelManagement, "validSignature", returnFalse);
      expect.assertions(1);
      await ChannelManagement.updateAllocatorChannel(post_fund_setup_0, theirSignature).catch((err: Error) => {
        expect(err).toMatchObject(errors.COMMITMENT_NOT_SIGNED)
      });
    });
  
    it('throws when the transition is invalid', async () => {
      expect.assertions(2);
      mockFunction(ChannelManagement, "validTransition", returnFalse);
  
      await ChannelManagement.updateAllocatorChannel(post_fund_setup_0, theirSignature).catch(err => {
        expect(err).toMatchObject(errors.INVALID_TRANSITION)
      });
  
      expect(ChannelManagement.validTransition).toHaveBeenCalledWith(post_fund_setup_0);
    });
  
    it('throws when the update is not value preserving', async () => {
      mockFunction(ChannelManagement, "valuePreserved", returnFalse);
  
      expect.assertions(1);
  
      await ChannelManagement.updateAllocatorChannel(post_fund_setup_0, theirSignature).catch(err => {
        expect(err).toMatchObject(errors.VALUE_LOST)
      });
    });

    it.skip('throws when the app is not funded', async () => {
      expect(0).toBe(1)
    });
  });

  describe('transitioning to an app commitment', () => {
    beforeEach(() => {
      theirSignature = sign(toHex(app_0), PARTICIPANT_PRIVATE_KEY);
  
      mockFunction(ChannelManagement, "channelExists", returnTrue);
      mockFunction(ChannelManagement, "validTransition", returnTrue);
      mockFunction(ChannelManagement, "validSignature", returnTrue);
      mockFunction(ChannelManagement, "valuePreserved", returnTrue);
    })

    it("should return an allocator channel and a signed commitment", async () => {
      const { allocator_channel, commitment, signature } = await ChannelManagement.updateAllocatorChannel(app_0, theirSignature);
      expect(allocator_channel).toMatchObject(funded_channel_response);
      expect(commitment).toMatchObject(app_1_response);
  
      expect(await ChannelManagement.validSignature(commitment, signature)).toBe(true);
    });
  });

  describe.skip('transitioning to a conclude commitment', () => {
    it('works', () => {
      expect.assertions(1)
    });
  });
});

describe.skip('validTransition', () => {
  it('works', () => {
    expect.assertions(1)
  });
});

describe('validSignature', () => {
  it('returns true when the mover signed the commitment', async () => {
    theirSignature = sign(toHex(pre_fund_setup_0), PARTICIPANT_PRIVATE_KEY);
    hubSignature = sign(toHex(pre_fund_setup_1), HUB_PRIVATE_KEY);

    expect(await ChannelManagement.validSignature(pre_fund_setup_0, theirSignature)).toBe(true);
    expect(await ChannelManagement.validSignature(pre_fund_setup_1, hubSignature)).toBe(true);
  });

  it('returns false when another participant signed the commitment', async () => {
    theirSignature = sign(toHex(pre_fund_setup_1), PARTICIPANT_PRIVATE_KEY);
    expect(await ChannelManagement.validSignature(pre_fund_setup_1, theirSignature)).toBe(false);
  });

  it('returns false when an unrelated participant signed the commitment', async () => {
    theirSignature = sign(toHex(pre_fund_setup_0), OTHER_PRIVATE_KEY);
    expect(await ChannelManagement.validSignature(pre_fund_setup_0, theirSignature)).toBe(false);
  });
});

describe.skip('valuePreserved', () => {
  it('works', () => {
    expect.assertions(1)
  });
});

describe('channelExists', () => {
  it('returns true when a channel exists with the given (nonce, rules_address)', async () => {
    expect(await ChannelManagement.channelExists(post_fund_setup_0)).toBe(true)
  });

  it('returns false when a channel exists with the given rules_address, but a different nonce', async () => {
    const commitment = post_fund_setup_0
    expect(await ChannelManagement.channelExists(commitment)).toBe(true)
    commitment.channel.nonce = 314
    expect(await ChannelManagement.channelExists(commitment)).toBe(false)
  });

  it('returns false when a channel exists with a different rules_address', async () => {
    const commitment = post_fund_setup_0
    commitment.channel.channelType = HUB_ADDRESS;
    expect(await ChannelManagement.channelExists(commitment)).toBe(false)
  });
});

describe.skip('channelFunded', () => {
  it('works', () => {
    expect.assertions(1)
  });
});

describe('nextCommitment', () => {
  it('works on preFundSetup commitments', () => {
    expect(ChannelManagement.nextCommitment(pre_fund_setup_0)).toMatchObject(pre_fund_setup_1);
  });

  it('works on postFundSetup commitments', () => {
    expect(ChannelManagement.nextCommitment(post_fund_setup_0)).toMatchObject(post_fund_setup_1);
  });

  it('works on app commitments', () => {
    expect(ChannelManagement.nextCommitment(app_0)).toMatchObject(app_1);
  });

  it.skip('works on conclude commitments', () => {
    expect.assertions(1)
  });
});
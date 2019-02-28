import { Commitment, sign, Signature, toHex } from 'fmg-core';
import { bytesFromAppAttributes } from 'fmg-nitro-adjudicator';
import {
    constructors as testDataConstructors,
    funded_channel,
} from '../../../../test/test_data';
import {
    HUB_ADDRESS,
    HUB_PRIVATE_KEY,
    OTHER_PRIVATE_KEY,
    PARTICIPANT_PRIVATE_KEY,
} from '../../../constants';
import { seeds } from '../../db/seeds/2_allocator_channels_seed';
import AllocatorChannel from '../../models/allocatorChannel';
import * as ChannelManagement from '../channelManagement';

process.env.NODE_ENV = 'test';

let pre_fund_setup_0: Commitment;
let pre_fund_setup_1: Commitment;
let post_fund_setup_0: Commitment;
let theirSignature: Signature;
let hubSignature: Signature;

beforeEach(() => {
    pre_fund_setup_0 = testDataConstructors.pre_fund_setup(0);
    pre_fund_setup_1 = testDataConstructors.pre_fund_setup(1);

    post_fund_setup_0 = testDataConstructors.post_fund_setup(2);
});

describe('validateCommitment', () => {
    it('returns true when the commitment was signed by the mover', async () => {
        const signature = sign(toHex(pre_fund_setup_1), HUB_PRIVATE_KEY);
        expect(
            ChannelManagement.validSignature(pre_fund_setup_1, signature),
        ).toBe(true);
    });

    it('returns false when the commitment was not signed by the mover', async () => {
        const signature = sign(toHex(pre_fund_setup_0), HUB_PRIVATE_KEY);
        expect(
            ChannelManagement.validSignature(pre_fund_setup_0, signature),
        ).toBe(false);
    });

    it('returns false when the commitment was not signed by the mover', async () => {
        const signature = sign(toHex(pre_fund_setup_0), '0xf00');
        expect(
            ChannelManagement.validSignature(pre_fund_setup_0, signature),
        ).toBe(false);
    });
});

describe('validSignature', () => {
    it('returns true when the mover signed the commitment', async () => {
        theirSignature = sign(toHex(pre_fund_setup_0), PARTICIPANT_PRIVATE_KEY);
        hubSignature = sign(toHex(pre_fund_setup_1), HUB_PRIVATE_KEY);

        expect(
            await ChannelManagement.validSignature(
                pre_fund_setup_0,
                theirSignature,
            ),
        ).toBe(true);
        expect(
            await ChannelManagement.validSignature(
                pre_fund_setup_1,
                hubSignature,
            ),
        ).toBe(true);
    });

    it('returns false when another participant signed the commitment', async () => {
        theirSignature = sign(toHex(pre_fund_setup_1), PARTICIPANT_PRIVATE_KEY);
        expect(
            await ChannelManagement.validSignature(
                pre_fund_setup_1,
                theirSignature,
            ),
        ).toBe(false);
    });

    it('returns false when an unrelated participant signed the commitment', async () => {
        theirSignature = sign(toHex(pre_fund_setup_0), OTHER_PRIVATE_KEY);
        expect(
            await ChannelManagement.validSignature(
                pre_fund_setup_0,
                theirSignature,
            ),
        ).toBe(false);
    });
});

describe('channelExists', () => {
    it('returns true when a channel exists with the given (nonce, rules_address)', async () => {
        expect(await ChannelManagement.channelExists(post_fund_setup_0)).toBe(
            true,
        );
    });

    it('returns false when a channel exists with the given rules_address, but a different nonce', async () => {
        const commitment = post_fund_setup_0;
        expect(await ChannelManagement.channelExists(commitment)).toBe(true);
        commitment.channel.nonce = 314;
        expect(await ChannelManagement.channelExists(commitment)).toBe(false);
    });

    it('returns false when a channel exists with a different rules_address', async () => {
        const commitment = post_fund_setup_0;
        commitment.channel.channelType = HUB_ADDRESS;
        expect(await ChannelManagement.channelExists(commitment)).toBe(false);
    });
});

describe.skip('channelFunded', () => {
    it('works', () => {
        expect.assertions(1);
    });
});

describe('formResponse', () => {
    it('returns a signed core commitment', async () => {
        const { rules_address, nonce } = seeds.funded_channel;
        const channel = await AllocatorChannel.query()
            .where({ rules_address, nonce })
            .eager('commitments')
            .first();
        pre_fund_setup_1.channel = funded_channel;

        const signature = sign(toHex(pre_fund_setup_1), HUB_PRIVATE_KEY);

        expect(
            await ChannelManagement.formResponse(
                channel.id,
                bytesFromAppAttributes,
            ),
        ).toMatchObject({
            commitment: pre_fund_setup_1,
            signature,
        });
    });
});

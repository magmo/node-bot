import { queries } from "../allocator_channels"
import knex from "../../connection";
import { seeds, constructors as seedDataConstructors, } from "../../seeds/2_allocator_channels_seed";
import { constructors as testDataConstructors, created_channel, } from "../../../../../test/test_data";
import { SEEDED_CHANNELS, SEEDED_COMMITMENTS, SEEDED_ALLOCATIONS, SEEDED_PARTICIPANTS } from "../../../../constants";
import AllocatorChannel from "../../../models/allocatorChannel";

process.env.NODE_ENV = 'test';

// Maybe we don't need this
describe.skip("getAllAllocatorChannels", async () => {
  it.skip("should return all allocator channels", async () => {
    const result = await queries.getAllAllocatorChannels();
    expect(result.length).toEqual(Object.keys(seeds).length);
    expect(result[0]).toMatchObject(seeds.channel_1);
    expect(result[1]).toMatchObject(seeds.channel_2);
    // TODO: Make this pass.
    // The issue is that the records are not eagerly fetched
    expect(result[2]).toMatchObject(seeds.funded_channel);
  });
})

// Maybe we don't need this
describe.skip('getSingleAllocatorChannel', () => {
  it('works', async () => {
    expect(await queries.getSingleAllocatorChannel(1)).toMatchObject(seeds.channel_1);
  });
});

describe('openAllocatorChannel', () => {
  it.only('works', async () => {
    const allocator_channel = await queries.openAllocatorChannel(testDataConstructors.pre_fund_setup(0))
    expect.assertions(5)

    expect(allocator_channel).toMatchObject(created_channel)
    expect(
      (await knex('allocator_channels').select("*")).length
    ).toEqual(SEEDED_CHANNELS + 1)
    expect(
      (await knex('allocator_channel_commitments').select("*")).length
    ).toEqual(SEEDED_COMMITMENTS + 2)

    expect(
      (await knex('allocations').select("*")).length
    ).toEqual(SEEDED_ALLOCATIONS + 4)

    expect(
      (await knex('allocator_channel_participants').select("*")).length
    ).toEqual(SEEDED_PARTICIPANTS + 2)
    // done()
  });

  it('throws when the nonce has already been used', async () => {
    const commitment = testDataConstructors.pre_fund_setup(0);
    await queries.openAllocatorChannel(commitment)
    expect.assertions(1)
    // TODO: Figure out how to more nicely test this ...
    await queries.openAllocatorChannel(commitment).catch( err => {
      expect(err.message).toMatch('duplicate key value violates unique constraint "allocator_channels_nonce_unique"');
    })

  });
});

describe('updateAllocatorChannel', () => {
  it('works', async () => {
    const { nonce, channelType } = testDataConstructors.post_fund_setup(2).channel;
    const existing_allocator_channel = await AllocatorChannel.query()
    .where({nonce, rules_address: channelType })
    .eager('[commitments.[allocations,proposed_allocations],participants]')
    .first()

    expect(existing_allocator_channel).toMatchObject(seeds.funded_channel)

    const updated_allocator_channel = await queries.updateAllocatorChannel(
      testDataConstructors.post_fund_setup(2),
      testDataConstructors.post_fund_setup(3),
    )

    expect(updated_allocator_channel).toMatchObject({
      ...seeds.funded_channel,
      commitments: [
        seedDataConstructors.post_fund_setup(2),
        seedDataConstructors.post_fund_setup(3),
      ]
    })

    expect(
      (await knex('allocator_channels').select("*")).length
    ).toEqual(SEEDED_CHANNELS)
    expect(
      (await knex('allocator_channel_commitments').where({ allocator_channel_id: updated_allocator_channel.id }).select("*")).length
    ).toEqual(2)

    expect(
      (await knex('allocations').select("*")).length
    ).toEqual(SEEDED_ALLOCATIONS)

    expect(
      (await knex('allocator_channel_participants').select("*")).length
    ).toEqual(SEEDED_PARTICIPANTS)
  });

  it.skip('throws when the channel doesn\'t exist', async () => {
    expect.assertions(1)
  });
});
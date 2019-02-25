process.env.NODE_ENV = 'test';

import * as supertest from "supertest"
import app from "../../src/app/app"
import knex from '../../src/wallet/db/connection';
import {
  seeds,
} from '../../src/wallet/db/seeds/2_allocator_channels_seed'
import { open_channel_params, created_channel_response, pre_fund_setup_1_response, invalid_open_channel_params } from "../../test/test_data"

const persistedAllocatorChannels = [
  { ...seeds.channel_1, id: 1}
]

const BASE_URL = "/api/v1/allocator_channels"

describe('routes : allocator_channels', () => {
  describe('GET: ', () => {
    it("should respond with all allocator channels", async () => {
        const response = await supertest(app.callback()).get(BASE_URL);
        expect(response.status).toEqual(200);
        expect(response.type).toEqual("application/json");
        expect(response.body.allocatorChannels.length).toEqual(Object.keys(seeds).length)
        expect(response.body.allocatorChannels[0]).toMatchObject(persistedAllocatorChannels[0])
    });

    it("should respond with a single allocator channel when it exists", async () => {
        const response = await supertest(app.callback()).get(`${BASE_URL}/1`);
        expect(response.status).toEqual(200);
        expect(response.type).toEqual("application/json");
        expect(response.body.allocatorChannel).toMatchObject(persistedAllocatorChannels[0]);
    });

    it("should respond with 404 when it doesn't exists", async () => {
        const response = await supertest(app.callback()).get(`${BASE_URL}/3`);
        expect(response.status).toEqual(404);
        expect(response.type).toEqual("application/json");
        expect(response.body.status).toEqual("error");
        expect(response.body.message).toEqual("That channel does not exist.");
    });
  });

  describe('POST: ', () => {
    describe('when the commitment is invalid', () => {
      it('responds with an error', async () => {
          const response = await supertest(app.callback())
            .post(BASE_URL)
            .send(invalid_open_channel_params);

          expect(response.status).toEqual(200);
          expect(response.body.status).toEqual("error");
          expect(response.body.message).toEqual("Commitment not authorized by mover");
      });
    });

    describe('when the channel doesn\'t exist', () => {
      describe('when the number of participants is not 2', () => {
        it('returns 400', () => {
          expect.assertions(1)
        });
      });

      it("should create a new allocator channel and responds with a signed prefund setup commitment", async () => {
          const response = await supertest(app.callback())
            .post(BASE_URL)
            .send(open_channel_params);

          expect(response.status).toEqual(201);
          expect(response.type).toEqual("application/json");

          const { allocator_channel, commitment, signature } = response.body;

          expect(allocator_channel).toMatchObject(created_channel_response);
          expect(commitment.allocator_channel_id).toEqual(allocator_channel.id);
          expect(pre_fund_setup_1_response).toMatchObject(commitment);
      });
    });

    describe('when the channel exists', () => {
      describe('when the commitment type is post-fund setup', () => {
        it("responds with a signed post-fund setup commitment when the channel is funded", async () => {
          expect(1).toBe(0)
        });
      });

      describe('when the commitment type is app', () => {
      });

      describe('when the commitment type is conclude', () => {
      });
    });
  });
});
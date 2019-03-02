process.env.NODE_ENV = 'test';

import * as supertest from 'supertest';
import * as rpsArtifact from '../../contracts/prebuilt_contracts/RockPaperScissorsGame.json';
import app from '../../src/app/app';
import { HUB_ADDRESS } from '../../src/constants';

const BASE_URL = '/api/v1/rps_games';

describe('routes : rps_channels', () => {
  describe('Get: ', () => {
    it('returns a list of games it will play', async () => {
      const response = await supertest(app.callback()).get(BASE_URL);

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        address: HUB_ADDRESS,
        games: [
          {
            rules_address: rpsArtifact.networks['3'].address,
            stake: '0x05',
          },
          {
            rules_address: rpsArtifact.networks['3'].address,
            stake: '0x0fff',
          },
        ],
      });
    });
  });
});

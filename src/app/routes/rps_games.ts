import * as koaBody from 'koa-body';
import * as Router from 'koa-router';

import Wallet from '../../wallet';
export const BASE_URL = `/api/v1/rps_games`;
import { ethers } from 'ethers';
import { Address, Uint256 } from 'fmg-core';
import { HUB_ADDRESS, NAME } from '../../constants';
import * as artifact from '../../contracts/prebuilt_contracts/RockPaperScissorsGame.json';

const router = new Router();

interface Game {
  rules_address: Address;
  stake: Uint256;
  name: string;
}

router.get(`${BASE_URL}`, koaBody(), async ctx => {
  try {
    const applications = await new Wallet('').getApplications();
    const { address } = applications.find(
      a => a.name === artifact.contractName,
    );

    const games: Game[] = [
      {
        rules_address: address,
        stake: ethers.utils.parseEther('0.01').toHexString(),
        name: NAME,
      },
      {
        rules_address: address,
        stake: ethers.utils.parseEther('0.0001').toHexString(),
        name: NAME,
      },
    ];
    let body;
    body = { status: 'success', games, address: HUB_ADDRESS };

    if (body.games) {
      ctx.status = 200;
      ctx.body = body;
    } else {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Something went wrong.',
      };
    }
  } catch (err) {
    switch (err) {
      default:
        throw err;
    }
  }
});

export const rpsGamesRoutes = router.routes();

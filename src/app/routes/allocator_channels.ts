import * as koaBody from 'koa-body';
import * as Router from 'koa-router';

import {
  appAttributesFromBytes,
  bytesFromAppAttributes,
} from '../../../../minimal_viable_force_move_games/packages/fmg-nitro-adjudicator/lib';
import Wallet, { errors } from '../../wallet';
export const BASE_URL = `/api/v1/allocator_channels`;

const router = new Router();

const wallet = new Wallet(x => bytesFromAppAttributes);

router.post(`${BASE_URL}`, koaBody(), async ctx => {
  try {
    let body;
    const {
      commitment: theirCommitment,
      signature: theirSignature,
    } = ctx.request.body;

    const { commitment, signature } = await wallet.updateLedgerChannel(
      {
        ...theirCommitment,
        appAttributes: appAttributesFromBytes(theirCommitment.appAttributes),
      },
      theirSignature,
    );
    body = { status: 'success', commitment, signature };

    if (body.commitment) {
      ctx.status = 201;
      ctx.body = body;
    } else {
      console.log(commitment);
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'Something went wrong.',
      };
    }
  } catch (err) {
    switch (err) {
      case errors.CHANNEL_EXISTS: {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message:
            'Attempted to open existing channel -- use a different nonce',
        };

        return;
      }
      case errors.COMMITMENT_NOT_SIGNED:
      case errors.CHANNEL_MISSING:
      case errors.COMMITMENT_NOT_SIGNED: {
        ctx.status = 400;
        ctx.body = {
          status: 'error',
          message: err.message,
        };

        return;
      }
      default:
        throw err;
    }
  }
});

export const allocatorChannelRoutes = router.routes();

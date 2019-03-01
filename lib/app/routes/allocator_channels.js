"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koaBody = require("koa-body");
const Router = require("koa-router");
const wallet = require("../../wallet");
exports.BASE_URL = `/api/v1/allocator_channels`;
const router = new Router();
router.post(`${exports.BASE_URL}`, koaBody(), async (ctx) => {
    try {
        let body;
        const { commitment: theirCommitment, signature: theirSignature } = ctx.request.body;
        if (await wallet.channelExists(theirCommitment)) {
            const { allocator_channel, commitment, signature } = await wallet.updateLedgerChannel(theirCommitment, theirSignature);
            body = { status: 'success', allocator_channel, commitment, signature };
        }
        else {
            const { allocator_channel, commitment, signature } = await wallet.openLedgerChannel(theirCommitment, theirSignature);
            body = { status: 'success', allocator_channel, commitment, signature };
        }
        if (body.allocator_channel.id) {
            ctx.status = 201;
            ctx.body = body;
        }
        else {
            ctx.status = 400;
            ctx.body = {
                status: 'error',
                message: 'Something went wrong.',
            };
        }
    }
    catch (err) {
        switch (err) {
            case wallet.errors.CHANNEL_EXISTS: {
                ctx.status = 400;
                ctx.body = {
                    status: 'error',
                    message: 'Attempted to open existing channel -- use a different nonce',
                };
                return;
            }
            case wallet.errors.COMMITMENT_NOT_SIGNED: {
                ctx.status = 400;
                ctx.body = {
                    status: 'error',
                    message: wallet.errors.COMMITMENT_NOT_SIGNED.message,
                };
                return;
            }
        }
        console.log(err);
    }
});
exports.allocatorChannelRoutes = router.routes();
//# sourceMappingURL=allocator_channels.js.map
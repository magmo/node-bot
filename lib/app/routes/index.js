"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const BASE_URL = '/';
const router = new Router();
router.get(BASE_URL, async (ctx) => {
    ctx.body = {
        status: "success",
        data: "Welcome to the Nitro hub, where everything happens REALLY fast!",
    };
});
exports.indexRoutes = router.routes();
//# sourceMappingURL=index.js.map
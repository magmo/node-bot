"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
// import { config } from './config';
const logging_1 = require("./logging");
const allocator_channels_1 = require("./routes/allocator_channels");
const index_1 = require("./routes/index");
const app = new Koa();
app.use(logging_1.logger);
app.use(index_1.indexRoutes);
app.use(allocator_channels_1.allocatorChannelRoutes);
exports.default = app;
//# sourceMappingURL=app.js.map
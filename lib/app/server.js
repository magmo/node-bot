"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const connection_1 = require("../wallet/db/connection");
const app_1 = require("./app");
const config_1 = require("./config");
objection_1.Model.knex(connection_1.default);
const server = app_1.default.listen(config_1.config.port).on("error", err => {
    console.error(err);
});
console.log("Application started. Listening on port:" + config_1.config.port);
exports.default = server;
//# sourceMappingURL=server.js.map
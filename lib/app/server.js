"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objection_1 = require("objection");
const connection_1 = require("../wallet/db/connection");
const app_1 = require("./app");
objection_1.Model.knex(connection_1.default);
const server = app_1.default.listen().on("error", err => {
    console.error(err);
});
console.log("Application started.");
exports.default = server;
//# sourceMappingURL=server.js.map
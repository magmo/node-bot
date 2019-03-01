"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../wallet/db/connection");
beforeEach(async () => {
    await connection_1.default.migrate.rollback();
    await connection_1.default.migrate.latest();
    await connection_1.default.seed.run();
});
afterEach(async () => {
    await connection_1.default.migrate.rollback();
});
afterAll(async () => {
    // We need to close the db connection after the test suite has run.
    // Otherwise, jest will not exit within the required one second after the test
    // suite has finished
    await connection_1.default.destroy();
});
//# sourceMappingURL=knexSetupTeardown.js.map
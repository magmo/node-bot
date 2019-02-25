import knex from "../wallet/db/connection";

beforeEach(async () => {
  await knex.migrate.rollback()
  await knex.migrate.latest()
  await knex.seed.run()
});

afterEach(async () => {
  await knex.migrate.rollback()
});

afterAll(async () => {
  // We need to close the db connection after the test suite has run.
  // Otherwise, jest will not exit within the required one second after the test
  // suite has finished
  await knex.destroy()
});
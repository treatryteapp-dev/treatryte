const { MongoMemoryReplSet } = require('mongodb-memory-server');

// A replica set (not a single standalone instance) - wallet.service.js's
// applyImmediate/finalizePendingCredit use session.withTransaction(), which
// MongoDB only supports on a replica set.
module.exports = async function globalSetup() {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await replSet.waitUntilRunning();

  // db.js lazily reads these on its first getClient() call - as long as
  // that happens after this (true for every test file, since globalSetup
  // always runs before any test file is loaded), this is all db.js needs.
  process.env.MONGODB_URI = replSet.getUri();
  process.env.MONGODB_DB_NAME = 'treatryte_test';

  // Stashed on `global` (not module scope) because Jest's globalSetup and
  // globalTeardown run in the same process but are loaded independently -
  // this is the documented way to hand the instance from one to the other.
  global.__MONGO_REPLSET__ = replSet;
};

const { getDb, getClient } = require('../src/db');

async function resetDb() {
  const db = getDb();
  const collections = await db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

async function closeDb() {
  await getClient().close();
}

module.exports = { resetDb, closeDb };

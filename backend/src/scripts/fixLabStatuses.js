require('dotenv').config();
const { getDb, getClient } = require('../db');

async function run() {
  const db = getDb();
  const res = await db.collection('labs').updateMany(
    { status: { $exists: false } },
    { $set: { status: 'pending' } }
  );
  console.log('Fixed lab statuses count:', res.modifiedCount);
}

run()
  .catch(err => console.error(err))
  .finally(() => getClient().close());

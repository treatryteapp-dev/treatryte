require('dotenv').config();
const { getDb, getClient } = require('../../db');

async function main() {
  const db = getDb();

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('wallets').createIndex({ userId: 1 }, { unique: true });
  await db.collection('refresh_tokens').createIndex({ userId: 1 });
  await db.collection('refresh_tokens').createIndex({ tokenHash: 1 }, { unique: true });

  await db.collection('transactions').createIndex({ userId: 1, createdAt: -1 });
  await db
    .collection('transactions')
    .createIndex({ nombaOrderReference: 1 }, { unique: true, sparse: true });
  await db
    .collection('transactions')
    .createIndex({ nombaTransactionId: 1 }, { unique: true, sparse: true });
  await db
    .collection('transactions')
    .createIndex({ nombaTransferRef: 1 }, { unique: true, sparse: true });

  await db.collection('vault_files').createIndex({ userId: 1, category: 1 });
  await db.collection('appointments').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('dose_logs').createIndex({ userId: 1, scheduledFor: 1 });
  await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('activities').createIndex({ userId: 1, createdAt: -1 });

  await db.collection('otps').createIndex({ email: 1, purpose: 1 });
  await db.collection('otps').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  console.log('Indexes created successfully.');
}

main()
  .catch((error) => {
    console.error('Index creation failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });

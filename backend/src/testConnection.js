require('dotenv').config();
const { getClient } = require('./db');

async function main() {
  const client = getClient();
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Pinged your deployment. MongoDB connection successful.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});

const { MongoClient, ServerApiVersion } = require('mongodb');

let client;

function getClient() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not set');
    }
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }
  return client;
}

function getDb() {
  return getClient().db(process.env.MONGODB_DB_NAME || 'treatryte');
}

module.exports = { getClient, getDb };

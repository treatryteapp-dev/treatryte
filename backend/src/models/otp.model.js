const { getDb } = require('../db');

const COLLECTION = 'otps';
const MAX_ATTEMPTS = 5;

function collection() {
  return getDb().collection(COLLECTION);
}

async function create({ email, purpose, codeHash, expiresAt }) {
  const now = new Date();
  const doc = {
    email: email.toLowerCase(),
    purpose,
    codeHash,
    attempts: 0,
    consumedAt: null,
    expiresAt,
    createdAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Most recent unconsumed, unexpired code for this email/purpose - used both
// to verify a submitted code and to throttle resend requests.
function findActiveByEmail(email, purpose) {
  return collection().findOne(
    { email: email.toLowerCase(), purpose, consumedAt: null, expiresAt: { $gt: new Date() } },
    { sort: { createdAt: -1 } },
  );
}

function incrementAttempts(id) {
  return collection().updateOne({ _id: id }, { $inc: { attempts: 1 } });
}

function consume(id) {
  return collection().updateOne({ _id: id }, { $set: { consumedAt: new Date() } });
}

module.exports = { COLLECTION, MAX_ATTEMPTS, collection, create, findActiveByEmail, incrementAttempts, consume };

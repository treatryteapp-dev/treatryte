const { getDb } = require('../db');

const COLLECTION = 'wallets';

function collection() {
  return getDb().collection(COLLECTION);
}

async function createForUser(userId) {
  const now = new Date();
  const doc = {
    userId,
    balance: 0, // kobo
    currency: 'NGN',
    nombaSubAccountId: null,
    // Populated lazily on first "Bank Transfer" fund attempt - see
    // wallet.service.js getOrCreateVirtualAccount().
    virtualAccountNumber: null,
    virtualBankName: null,
    virtualAccountRef: null,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function findByUserId(userId) {
  return collection().findOne({ userId });
}

function findByVirtualAccountRef(virtualAccountRef) {
  return collection().findOne({ virtualAccountRef });
}

function findByVirtualAccountNumber(virtualAccountNumber) {
  return collection().findOne({ virtualAccountNumber });
}

function setVirtualAccount(userId, { virtualAccountNumber, virtualBankName, virtualAccountRef }) {
  return collection().updateOne(
    { userId },
    { $set: { virtualAccountNumber, virtualBankName, virtualAccountRef, updatedAt: new Date() } },
  );
}

module.exports = {
  COLLECTION,
  collection,
  createForUser,
  findByUserId,
  findByVirtualAccountRef,
  findByVirtualAccountNumber,
  setVirtualAccount,
};

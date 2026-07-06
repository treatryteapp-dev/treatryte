const { getDb } = require('../db');
const { signVaultUrl } = require('../cloudfrontSign');

const COLLECTION = 'users';
const AVATAR_URL_TTL_SECONDS = 3600;

function collection() {
  return getDb().collection(COLLECTION);
}

function findByEmail(email) {
  return collection().findOne({ email: email.toLowerCase() });
}

function findById(id) {
  return collection().findOne({ _id: id });
}

async function create({ fullName, dateOfBirth, gender, address, email, passwordHash, role, planId }) {
  const { ObjectId } = require('mongodb');
  const now = new Date();
  const doc = {
    fullName,
    dateOfBirth: new Date(dateOfBirth),
    gender,
    address,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'patient',
    planId: planId ? new ObjectId(planId) : null,
    nombaCustomerId: null,
    medicalProfile: { bloodGroup: null, allergies: [], conditions: [] },
    avatarS3Key: null,
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection().insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

function update(userId, updates) {
  return collection().updateOne(
    { _id: userId },
    { $set: { ...updates, updatedAt: new Date() } },
  );
}

function toPublic(user) {
  if (!user) return null;
  return {
    id: user._id,
    fullName: user.fullName,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    email: user.email,
    role: user.role,
    planId: user.planId ? user.planId.toString() : null,
    medicalProfile: user.medicalProfile || { bloodGroup: null, allergies: [], conditions: [] },
    avatarUrl: null,
  };
}

// Signs a short-lived CloudFront URL for the user's avatar, same private-S3
// + signed-URL pattern the vault uses - avoids needing a public bucket just
// for profile pictures. Callers must await this instead of the sync
// toPublic() whenever the response will actually be sent to a client.
async function toPublicWithAvatar(user) {
  const pub = toPublic(user);
  if (pub && user.avatarS3Key) {
    pub.avatarUrl = signVaultUrl(user.avatarS3Key, { ttlSeconds: AVATAR_URL_TTL_SECONDS });
  }
  return pub;
}

/**
 * Anonymizes and deactivates the account rather than hard-deleting it -
 * wallets, transactions, appointments, and subscriptions reference this
 * userId and must survive for financial/medical audit purposes. The email
 * is scrambled (not just cleared) so the address is freed up for reuse.
 */
function softDelete(userId) {
  return collection().updateOne(
    { _id: userId },
    {
      $set: {
        status: 'deleted',
        email: `deleted-${userId.toString()}@treatryte.invalid`,
        fullName: 'Deleted User',
        passwordHash: '',
        avatarS3Key: null,
        medicalProfile: { bloodGroup: null, allergies: [], conditions: [] },
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}

module.exports = {
  COLLECTION,
  collection,
  findByEmail,
  findById,
  create,
  update,
  toPublic,
  toPublicWithAvatar,
  softDelete,
};

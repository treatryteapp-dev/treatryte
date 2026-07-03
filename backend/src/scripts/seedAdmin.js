require('dotenv').config();
const { getDb, getClient } = require('../db');
const bcrypt = require('bcrypt');

const EMAIL = process.env.ADMIN_EMAIL || 'treatryte.app@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD;
const BCRYPT_COST = 12;

async function main() {
  if (!PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is not set');
  }

  const db = getDb();
  const usersCollection = db.collection('users');

  console.log(`Checking if user ${EMAIL} already exists...`);
  const existingUser = await usersCollection.findOne({ email: EMAIL });

  console.log('Hashing password...');
  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_COST);

  if (existingUser) {
    console.log(`User exists. Updating password and ensuring role is 'admin'...`);
    await usersCollection.updateOne(
      { _id: existingUser._id },
      { 
        $set: { 
          passwordHash,
          role: 'admin',
          updatedAt: new Date()
        } 
      }
    );
    console.log('Admin user updated successfully.');
  } else {
    console.log(`User does not exist. Creating new 'admin' user...`);
    const doc = {
      fullName: 'System Administrator',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'prefer_not_to_say',
      address: 'TreatRyte HQ',
      email: EMAIL,
      passwordHash,
      role: 'admin',
      nombaCustomerId: null,
      biometricLockEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await usersCollection.insertOne(doc);
    console.log('Admin user created successfully.');
  }
}

main()
  .catch((error) => {
    console.error('Seeding admin failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });

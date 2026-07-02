require('dotenv').config();
const { getDb, getClient } = require('../db');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node seedMedications.js <userEmail>');
    process.exit(1);
  }

  const db = getDb();
  const user = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  await db.collection('medications').deleteMany({ userId: user._id });

  await db.collection('medications').insertMany([
    {
      userId: user._id,
      name: 'Vitamin D3',
      dosage: '1000 IU',
      scheduleTimes: ['8:00 AM'],
      planStatus: 'active',
      startDate: new Date(),
      endDate: null,
      createdAt: new Date(),
    },
    {
      userId: user._id,
      name: 'Amoxicillin 500mg',
      dosage: '500mg',
      scheduleTimes: ['2:00 PM'],
      planStatus: 'active',
      startDate: new Date(),
      endDate: null,
      createdAt: new Date(),
    },
    {
      userId: user._id,
      name: 'Loratadine 10mg',
      dosage: '10mg',
      scheduleTimes: ['9:00 PM'],
      planStatus: 'active',
      startDate: new Date(),
      endDate: null,
      createdAt: new Date(),
    },
  ]);

  console.log(`Seeded medications for ${email}.`);
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });

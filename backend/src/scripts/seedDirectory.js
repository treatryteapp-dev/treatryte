require('dotenv').config();
const { getDb, getClient } = require('../db');

async function main() {
  const db = getDb();

  await db.collection('labs').deleteMany({});
  await db.collection('tests').deleteMany({});
  await db.collection('clinics').deleteMany({});

  const { insertedId: careDiagnosticsId } = await db.collection('labs').insertOne({
    name: 'Care Diagnostics Lab',
    distanceKm: 0.2,
    address: 'Admin Avenue',
    hours: 'Open 24/7',
    rating: 4.5,
    reviewCount: 126,
    isFeatured: true,
    createdAt: new Date(),
  });

  await db.collection('tests').insertMany([
    {
      labId: careDiagnosticsId,
      name: 'Full Blood Count',
      price: 750_000, // kobo (₦7,500)
      duration: 'Same-day',
      isTrending: false,
      createdAt: new Date(),
    },
    {
      labId: careDiagnosticsId,
      name: 'Lipid Profile',
      price: 1_200_000, // kobo (₦12,000)
      duration: 'Fasting Required',
      isTrending: false,
      createdAt: new Date(),
    },
    // Trending test chips are shown app-wide, not tied to a specific lab.
    {
      labId: null,
      name: 'Malaria + Typhoid',
      price: null,
      duration: null,
      isTrending: true,
      createdAt: new Date(),
    },
    {
      labId: null,
      name: 'Fasting Blood Sugar',
      price: null,
      duration: null,
      isTrending: true,
      createdAt: new Date(),
    },
  ]);

  await db.collection('clinics').insertOne({
    name: 'Lagos State Eye Clinic',
    type: 'clinic',
    distanceKm: 2.0,
    address: 'Ikeja Ave',
    hours: 'Opens 8:00 AM',
    createdAt: new Date(),
  });

  console.log('Directory seeded successfully.');
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });

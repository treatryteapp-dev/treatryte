require('dotenv').config();
const { getDb, getClient } = require('../db');
const { ROLE_TO_PLAN_TYPE } = require('../utils/planAccess');

// One-off backfill for accounts created before registration started
// defaulting new users onto their role's free plan - without this, those
// accounts show no plan selected at all (see auth.service.js register()).
async function main() {
  const db = getDb();

  const freePlans = await db
    .collection('plans')
    .find({ price: 0, status: 'active' })
    .toArray();
  const freePlanIdByType = new Map(freePlans.map((p) => [p.type, p._id]));

  let updated = 0;
  for (const [role, type] of Object.entries(ROLE_TO_PLAN_TYPE)) {
    const freePlanId = freePlanIdByType.get(type);
    if (!freePlanId) {
      console.warn(`No active free plan found for type "${type}" (role "${role}") - skipping`);
      continue;
    }

    const result = await db
      .collection('users')
      .updateMany(
        { role, planId: null, status: { $ne: 'deleted' } },
        { $set: { planId: freePlanId, updatedAt: new Date() } }
      );
    console.log(`${role}: backfilled ${result.modifiedCount} account(s) onto "${type}" free plan`);
    updated += result.modifiedCount;
  }

  console.log(`\nDone - ${updated} account(s) updated.`);
}

main()
  .catch((error) => {
    console.error('Backfill failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getClient().close();
  });

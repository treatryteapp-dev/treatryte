require('dotenv').config();
const { getDb, getClient } = require('../db');

async function audit() {
  const db = getDb();
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║         TREATRYTE DATABASE AUDIT - REAL vs TEST DATA         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // ─── 1. USERS ────────────────────────────────────────────────────────────
  const users = await db.collection('users').find({}).toArray();
  console.log(`📋 USERS COLLECTION (${users.length} records)`);
  console.log('─'.repeat(60));
  const testUserPatterns = ['example.com', 'test', 'seed', 'demo', 'fake', 'dummy'];
  users.forEach(u => {
    const isTest = testUserPatterns.some(p => u.email?.toLowerCase().includes(p));
    const tag = isTest ? '🔴 TEST' : '🟢 REAL';
    const date = u.createdAt ? new Date(u.createdAt).toDateString() : 'unknown';
    console.log(`  ${tag} | ${u.fullName || u.name || 'No Name'} | ${u.email} | role:${u.role || 'user'} | joined:${date}`);
  });

  // ─── 2. LABS / PARTNERS ──────────────────────────────────────────────────
  console.log('');
  const labs = await db.collection('labs').find({}).toArray();
  console.log(`🏥 LABS/PARTNERS COLLECTION (${labs.length} records)`);
  console.log('─'.repeat(60));
  const testLabPatterns = ['test', 'seed', 'demo', 'fake', 'nomba hq', '0123456789', 'mdcn-12345', 'example'];
  labs.forEach(l => {
    const nameCheck = testLabPatterns.some(p => (l.businessName || '').toLowerCase().includes(p));
    const addrCheck = testLabPatterns.some(p => (l.address || '').toLowerCase().includes(p));
    const acctCheck = testLabPatterns.some(p => (l.accountNumber || '').toLowerCase().includes(p));
    const isTest = nameCheck || addrCheck || acctCheck;
    const tag = isTest ? '🔴 TEST' : '🟢 REAL';
    console.log(`  ${tag} | ${l.businessName} | status:${l.status} | services:${(l.services || []).join(', ')} | addr:${l.address || 'N/A'}`);
  });

  // ─── 3. SUBSCRIPTIONS ────────────────────────────────────────────────────
  console.log('');
  const subs = await db.collection('subscriptions').find({}).toArray();
  console.log(`💳 SUBSCRIPTIONS COLLECTION (${subs.length} records)`);
  console.log('─'.repeat(60));
  // Look up users for each subscription
  for (const s of subs) {
    let userEmail = s.userEmail || 'unknown';
    if (!s.userEmail && s.userId) {
      try {
        const { ObjectId } = require('mongodb');
        const u = await db.collection('users').findOne({ _id: new ObjectId(s.userId.toString()) });
        userEmail = u ? u.email : s.userId.toString();
      } catch(e) { userEmail = s.userId.toString(); }
    }
    const isTest = ['test', 'example.com', 'seed', 'demo'].some(p => userEmail.toLowerCase().includes(p));
    const tag = isTest ? '🔴 TEST' : '🟢 REAL';
    console.log(`  ${tag} | email:${userEmail} | plan:${s.plan || s.tier || 'N/A'} | status:${s.status} | mrr:₦${s.mrr || 0}`);
  }

  // ─── 4. PLANS ────────────────────────────────────────────────────────────
  console.log('');
  const plans = await db.collection('plans').find({}).toArray();
  console.log(`📦 PLANS COLLECTION (${plans.length} records)`);
  console.log('─'.repeat(60));
  plans.forEach(p => {
    console.log(`  ${p.name} | ₦${p.price}/${p.interval} | type:${p.type}`);
  });

  // ─── 5. TRANSACTIONS ─────────────────────────────────────────────────────
  console.log('');
  const transactions = await db.collection('transactions').find({}).toArray();
  console.log(`💰 TRANSACTIONS COLLECTION (${transactions.length} records)`);
  console.log('─'.repeat(60));
  let realRevenue = 0;
  let testRevenue = 0;
  transactions.forEach(t => {
    const isTest = ['test', 'seed', 'demo'].some(p => (t.reference || '').toLowerCase().includes(p));
    const amount = t.amount || 0;
    if (isTest) { testRevenue += amount; }
    else if (t.status === 'success') { realRevenue += amount; }
    const tag = isTest ? '🔴 TEST' : (t.status === 'success' ? '🟢 REAL' : '🟡 PENDING');
    console.log(`  ${tag} | ref:${t.reference || 'N/A'} | ₦${amount} | status:${t.status}`);
  });

  if (transactions.length === 0) {
    console.log('  ℹ️  No transactions recorded yet');
  }

  // ─── 6. COLLECTIONS OVERVIEW ─────────────────────────────────────────────
  console.log('');
  console.log('📊 ALL MONGODB COLLECTIONS OVERVIEW');
  console.log('─'.repeat(60));
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  ${col.name.padEnd(25)} → ${count} document(s)`);
  }

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  const realUsers = users.filter(u => !testUserPatterns.some(p => u.email?.toLowerCase().includes(p))).length;
  const testUsers = users.length - realUsers;
  const realLabs = labs.filter(l => !testLabPatterns.some(p => (l.businessName||'').toLowerCase().includes(p) || (l.address||'').toLowerCase().includes(p))).length;
  const testLabs = labs.length - realLabs;

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                         AUDIT SUMMARY                           ║');
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log(`║  Users:        ${String(users.length).padEnd(3)} total | ${String(realUsers).padEnd(3)} real  | ${String(testUsers).padEnd(3)} test/seeded       ║`);
  console.log(`║  Partners:     ${String(labs.length).padEnd(3)} total | ${String(realLabs).padEnd(3)} real  | ${String(testLabs).padEnd(3)} test/seeded       ║`);
  console.log(`║  Subscriptions:${String(subs.length).padEnd(3)} total                                       ║`);
  console.log(`║  Plans:        ${String(plans.length).padEnd(3)} seeded templates (no live Nomba IDs yet)  ║`);
  console.log(`║  Revenue:      ₦${String(realRevenue.toLocaleString()).padEnd(15)} confirmed from real transactions  ║`);
  console.log('╠══════════════════════════════════════════════════════════════════╣');
  console.log('║  VERDICT:                                                        ║');
  if (testUsers > 0 || testLabs > 0) {
    console.log('║  ⚠️  TEST DATA PRESENT — clean up before go-live                  ║');
  } else {
    console.log('║  ✅ All records appear to be real                                 ║');
  }
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');
}

audit().catch(console.error).finally(() => getClient().close());

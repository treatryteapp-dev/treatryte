const { MongoClient } = require('mongodb');
const uri = process.argv[2];
const email = process.argv[3];
const amountNaira = parseInt(process.argv[4] || '200');

if (!uri || !email) {
  console.log('Usage: node recover.js <MONGODB_URI> <USER_EMAIL> [AMOUNT_NAIRA]');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('treatryte');
    
    const user = await db.collection('users').findOne({ email });
    if (!user) throw new Error('User not found: ' + email);
    
    const wallet = await db.collection('wallets').findOne({ userId: user._id });
    if (!wallet) throw new Error('Wallet not found for user');
    
    const amountKobo = amountNaira * 100;
    
    await db.collection('wallets').updateOne(
      { _id: wallet._id },
      { $inc: { balance: amountKobo } }
    );
    
    await db.collection('transactions').insertOne({
      userId: user._id,
      walletId: wallet._id,
      type: 'credit',
      category: 'wallet_funding',
      amount: amountKobo,
      description: 'Manual recovery of missing bank transfer',
      metadata: { recovered: true },
      refs: {},
      status: 'success',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('Successfully credited ' + amountNaira + ' NGN to wallet for ' + email);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}
run();

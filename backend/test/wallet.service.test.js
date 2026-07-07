const { ObjectId } = require('mongodb');

// Must be mocked before wallet.service.js (or anything it requires) ever
// loads - NOMBA_ENV is 'live' in the real environment, so tests must never
// be able to reach the real Nomba API even by accident.
jest.mock('../src/nomba');

const nomba = require('../src/nomba');
const walletService = require('../src/services/wallet.service');
const walletModel = require('../src/models/wallet.model');
const userModel = require('../src/models/user.model');
const transactionModel = require('../src/models/transaction.model');
const { resetDb, closeDb } = require('./helpers');

async function makeUserWithWallet(overrides = {}) {
  const user = await userModel.create({
    fullName: 'Test User',
    dateOfBirth: '2000-01-01',
    gender: 'prefer_not_to_say',
    address: '1 Test Street',
    email: `test-${new ObjectId().toString()}@example.com`,
    passwordHash: 'not-a-real-hash',
    role: 'patient',
    ...overrides,
  });
  const wallet = await walletModel.createForUser(user._id);
  return { user, wallet };
}

beforeEach(async () => {
  await resetDb();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeDb();
});

describe('creditImmediate / debitImmediate', () => {
  test('creditImmediate increases balance by the kobo amount and records a matching ledger row', async () => {
    const { user, wallet } = await makeUserWithWallet();

    const tx = await walletService.creditImmediate(user._id, {
      amountKobo: 5000,
      category: 'wallet_funding',
      description: 'test credit',
      metadata: {},
      refs: {},
    });

    expect(tx.balanceAfter).toBe(5000);
    const updated = await walletModel.findByUserId(user._id);
    expect(updated.balance).toBe(5000);
    expect(wallet.balance).toBe(0); // sanity: original snapshot untouched
  });

  test('debitImmediate decreases balance by the kobo amount', async () => {
    const { user } = await makeUserWithWallet();
    await walletService.creditImmediate(user._id, {
      amountKobo: 10000,
      category: 'wallet_funding',
      description: 'seed',
      metadata: {},
      refs: {},
    });

    const tx = await walletService.debitImmediate(user._id, {
      amountKobo: 4000,
      category: 'service_payment',
      description: 'test debit',
      metadata: {},
      refs: {},
    });

    expect(tx.balanceAfter).toBe(6000);
    const updated = await walletModel.findByUserId(user._id);
    expect(updated.balance).toBe(6000);
  });

  test('debitImmediate throws INSUFFICIENT_FUNDS and leaves the balance unchanged', async () => {
    const { user } = await makeUserWithWallet();
    await walletService.creditImmediate(user._id, {
      amountKobo: 1000,
      category: 'wallet_funding',
      description: 'seed',
      metadata: {},
      refs: {},
    });

    await expect(
      walletService.debitImmediate(user._id, {
        amountKobo: 5000,
        category: 'service_payment',
        description: 'over-limit debit',
        metadata: {},
        refs: {},
      })
    ).rejects.toMatchObject({ statusCode: 422, code: 'INSUFFICIENT_FUNDS' });

    const updated = await walletModel.findByUserId(user._id);
    expect(updated.balance).toBe(1000);
  });
});

describe('finalizePendingCredit idempotency', () => {
  test('calling it twice for the same pending transaction only credits the balance once', async () => {
    const { user, wallet } = await makeUserWithWallet();
    const pending = await transactionModel.recordPending({
      userId: user._id,
      walletId: wallet._id,
      type: 'credit',
      category: 'wallet_funding',
      amount: 7000,
      description: 'pending funding',
      metadata: {},
      refs: {},
    });

    const first = await transactionModel.finalizePendingCredit(pending._id, 'nomba-tx-1');
    const second = await transactionModel.finalizePendingCredit(pending._id, 'nomba-tx-1');

    expect(first.balanceAfter).toBe(7000);
    expect(second).toBeNull(); // already finalized - idempotent no-op

    const updated = await walletModel.findByUserId(user._id);
    expect(updated.balance).toBe(7000);
  });
});

describe('withdrawToBank refund-on-failure', () => {
  test('refunds the reserved amount when Nomba rejects the transfer outright, leaving balance unchanged', async () => {
    const { user } = await makeUserWithWallet();
    await walletService.creditImmediate(user._id, {
      amountKobo: 20000,
      category: 'wallet_funding',
      description: 'seed',
      metadata: {},
      refs: {},
    });

    nomba.transferToBank.mockRejectedValue(new Error('Nomba rejected the transfer'));

    await expect(
      walletService.withdrawToBank(user._id, {
        amountKobo: 15000,
        accountNumber: '0123456789',
        bankCode: '044',
        accountName: 'Test Recipient',
        narration: 'test withdrawal',
      })
    ).rejects.toMatchObject({ statusCode: 502, code: 'WITHDRAWAL_FAILED' });

    expect(nomba.transferToBank).toHaveBeenCalledTimes(1);

    const updated = await walletModel.findByUserId(user._id);
    expect(updated.balance).toBe(20000); // debit then equal-amount refund nets out

    const transactions = await transactionModel.list(user._id, {});
    const categories = transactions.map((t) => t.category).sort();
    expect(categories).toEqual(['refund', 'withdrawal', 'wallet_funding'].sort());
  });
});

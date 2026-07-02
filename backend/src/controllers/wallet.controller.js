const { z } = require('zod');

const walletService = require('../services/wallet.service');
const { asyncHandler } = require('../middleware/asyncHandler');

const devCreditSchema = z.object({
  amountKobo: z.number().int().positive(),
  description: z.string().optional(),
});

const fundSchema = z.object({
  amountKobo: z.number().int().positive(),
  method: z.enum(['bank_transfer', 'card']),
});

const withdrawSchema = z.object({
  amountKobo: z.number().int().positive(),
  accountNumber: z.string().length(10),
  bankCode: z.string().min(1),
  accountName: z.string().min(1),
  narration: z.string().optional(),
});

const lookupAccountSchema = z.object({
  accountNumber: z.string().length(10),
  bankCode: z.string().min(1),
});

const payProviderSchema = z.object({
  amountKobo: z.number().int().positive(),
  providerCode: z.string().min(1),
  narration: z.string().optional(),
});

const getBalance = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.userId);
  res.json({ balanceKobo: wallet.balance, currency: wallet.currency });
});

const listTransactions = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const { category } = req.query;
  const transactions = await walletService.listTransactions(req.userId, { page, limit, category });
  res.json({ transactions });
});

const devCredit = asyncHandler(async (req, res) => {
  const transaction = await walletService.creditImmediate(req.userId, {
    amountKobo: req.body.amountKobo,
    category: 'wallet_funding',
    description: req.body.description || 'Dev credit (development only)',
    metadata: { source: 'dev-credit' },
    refs: {},
  });
  res.status(201).json({ transaction });
});

const fund = asyncHandler(async (req, res) => {
  const result = await walletService.fundWallet(req.userId, {
    amountKobo: req.body.amountKobo,
    callbackUrl: `treatryte://wallet/fund/callback`,
  });
  res.status(201).json(result);
});

const withdraw = asyncHandler(async (req, res) => {
  const transaction = await walletService.withdrawToBank(req.userId, req.body);
  res.status(201).json({ transaction });
});

const banks = asyncHandler(async (req, res) => {
  const results = await walletService.listBanks();
  res.json({ banks: results });
});

const lookupAccount = asyncHandler(async (req, res) => {
  const result = await walletService.lookupAccount(req.body);
  res.json(result);
});

const payProvider = asyncHandler(async (req, res) => {
  const transaction = await walletService.payProvider(req.userId, req.body);
  res.status(201).json({ transaction });
});

module.exports = {
  devCreditSchema,
  fundSchema,
  withdrawSchema,
  lookupAccountSchema,
  payProviderSchema,
  getBalance,
  listTransactions,
  devCredit,
  fund,
  withdraw,
  banks,
  lookupAccount,
  payProvider,
};

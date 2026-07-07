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
  platform: z.enum(['web', 'mobile']).optional().default('mobile'),
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

const verifyFundingSchema = z.object({
  orderReference: z.string().min(1),
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
  // Custom app schemes have no meaning to a browser - a web checkout must
  // redirect to a real https page, while the native app intercepts its own
  // scheme from inside the embedded webview before it ever tries to resolve.
  const callbackUrl =
    req.body.platform === 'web'
      ? `${req.protocol}://${req.get('host')}/api/wallet/fund/complete`
      : 'treatryte://wallet/fund/callback';

  const result = await walletService.fundWallet(req.userId, {
    amountKobo: req.body.amountKobo,
    callbackUrl,
  });
  res.status(201).json(result);
});

// Called by the client right after a checkout completes, instead of waiting
// entirely on the Nomba webhook - checks Nomba directly and settles the
// order if it already succeeded there.
const verifyFunding = asyncHandler(async (req, res) => {
  const result = await walletService.reconcileFunding(req.userId, req.body.orderReference);
  res.json(result);
});

const fundComplete = (req, res) => {
  res
    .status(200)
    .type('html')
    .send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Payment received</title>
    <style>
      body { font-family: -apple-system, Arial, sans-serif; background: #0b1c30; color: #fff;
             display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
      .card { max-width: 360px; padding: 24px; }
      h1 { font-size: 20px; color: #004E47; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Payment received</h1>
      <p>You can close this tab and return to the TreatRyte app to see your updated balance.</p>
    </div>
  </body>
</html>`);
};

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

module.exports = {
  devCreditSchema,
  fundSchema,
  verifyFundingSchema,
  withdrawSchema,
  lookupAccountSchema,
  getBalance,
  listTransactions,
  devCredit,
  fund,
  fundComplete,
  verifyFunding,
  withdraw,
  banks,
  lookupAccount,
};

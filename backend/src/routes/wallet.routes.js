const express = require('express');

const controller = require('../controllers/wallet.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const env = require('../config/env');

const router = express.Router();

// Public: the browser lands here after a web checkout redirect, before any
// app session exists. Wallet crediting itself happens via the Nomba
// webhook, not this route - it only needs to render something valid.
router.get('/fund/complete', controller.fundComplete);

router.use(requireAuth);

router.get('/', controller.getBalance);
router.get('/transactions', controller.listTransactions);
router.get('/banks', controller.banks);
router.post('/lookup-account', validateBody(controller.lookupAccountSchema), controller.lookupAccount);
router.post('/fund', validateBody(controller.fundSchema), controller.fund);
router.post('/fund/verify', validateBody(controller.verifyFundingSchema), controller.verifyFunding);
router.post('/withdraw', validateBody(controller.withdrawSchema), controller.withdraw);
router.post('/pay-provider', validateBody(controller.payProviderSchema), controller.payProvider);

// Dev-only shortcut to credit a wallet without going through Nomba.
if (!env.isProduction) {
  router.post('/dev-credit', validateBody(controller.devCreditSchema), controller.devCredit);
}

module.exports = router;

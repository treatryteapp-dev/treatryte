const express = require('express');

const controller = require('../controllers/wallet.controller');
const { requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const env = require('../config/env');

const router = express.Router();


router.use(requireAuth);

router.get('/', controller.getBalance);
router.get('/transactions', controller.listTransactions);
router.get('/banks', controller.banks);
router.post('/lookup-account', validateBody(controller.lookupAccountSchema), controller.lookupAccount);

router.get('/virtual-account', controller.virtualAccount);
router.post('/withdraw', validateBody(controller.withdrawSchema), controller.withdraw);

// Dev-only shortcut to credit a wallet without going through Nomba.
if (!env.isProduction) {
  router.post('/dev-credit', validateBody(controller.devCreditSchema), controller.devCredit);
}

module.exports = router;

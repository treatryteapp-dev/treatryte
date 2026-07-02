const express = require('express');

const controller = require('../controllers/webhooks.controller');

const router = express.Router();

router.post('/nomba', express.json(), controller.handleNombaWebhook);

module.exports = router;

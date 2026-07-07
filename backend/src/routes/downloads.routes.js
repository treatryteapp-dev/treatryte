const express = require('express');

const controller = require('../controllers/downloads.controller');

const router = express.Router();

router.get('/app-latest.apk', controller.latestApk);

module.exports = router;

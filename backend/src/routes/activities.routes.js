const express = require('express');

const controller = require('../controllers/activities.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.list);

module.exports = router;

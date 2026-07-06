const express = require('express');

const controller = require('../controllers/directory.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/labs', controller.labs);
router.get('/labs/:labId/tests', controller.labTests);
router.get('/tests/trending', controller.trendingTests);

module.exports = router;

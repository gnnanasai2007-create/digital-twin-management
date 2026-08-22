const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/overview', analyticsController.getOverviewAnalytics);
router.get('/health', analyticsController.getHealthTrends);

module.exports = router;

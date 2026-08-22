const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

router.get('/assets', verifyToken, reportController.getAssetHealthReport);
router.get('/maintenance', verifyToken, reportController.getMaintenanceReport);
router.get('/sensors', verifyToken, reportController.getSensorReport);
router.get('/alerts', verifyToken, reportController.getAlertReport);

module.exports = router;

const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/asset/:assetId', sensorController.getSensorsByAsset);
router.get('/:id/history', sensorController.getSensorHistory);
router.put('/:id/thresholds', verifyToken, requireRole('ADMIN', 'MANAGER'), sensorController.updateSensorThresholds);

module.exports = router;

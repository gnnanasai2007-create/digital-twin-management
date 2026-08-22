const express = require('express');
const router = express.Router();
const twinController = require('../controllers/twinController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', twinController.getTwins);
router.get('/:assetId', twinController.getTwinByAsset);
router.get('/:assetId/history', twinController.getTwinTelemetryHistory);
router.post('/:assetId/sync', verifyToken, twinController.syncTwin);
router.post('/:assetId/simulate-failure', twinController.triggerFailure);
router.post('/:assetId/reset-simulation', twinController.resetFailure);

module.exports = router;

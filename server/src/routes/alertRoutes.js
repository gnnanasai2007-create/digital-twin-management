const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', alertController.getAlerts);
router.put('/:id/acknowledge', verifyToken, requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'), alertController.acknowledgeAlert);
router.put('/:id/resolve', verifyToken, requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'), alertController.resolveAlert);

module.exports = router;

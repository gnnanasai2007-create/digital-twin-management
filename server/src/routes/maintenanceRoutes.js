const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', maintenanceController.getMaintenances);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', verifyToken, requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'), maintenanceController.createMaintenance);
router.put('/:id', verifyToken, requireRole('ADMIN', 'MANAGER', 'TECHNICIAN'), maintenanceController.updateMaintenance);
router.delete('/:id', verifyToken, requireRole('ADMIN', 'MANAGER'), maintenanceController.deleteMaintenance);

module.exports = router;

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/', settingsController.getSettings);
router.put('/', verifyToken, requireRole('ADMIN'), settingsController.updateSettings);

module.exports = router;

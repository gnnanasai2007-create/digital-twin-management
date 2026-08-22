const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.get('/stats', assetController.getAssetStats);
router.get('/', assetController.getAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', verifyToken, requireRole('ADMIN', 'MANAGER'), assetController.createAsset);
router.put('/:id', verifyToken, requireRole('ADMIN', 'MANAGER'), assetController.updateAsset);
router.delete('/:id', verifyToken, requireRole('ADMIN'), assetController.deleteAsset);

module.exports = router;

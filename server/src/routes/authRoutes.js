const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRole } = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', verifyToken, authController.getProfile);
router.get('/users', verifyToken, requireRole('ADMIN', 'MANAGER'), authController.getAllUsers);

module.exports = router;

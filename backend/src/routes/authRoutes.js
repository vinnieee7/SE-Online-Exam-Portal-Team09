const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password/request', authController.requestPasswordReset);
router.post('/reset-password/verify', authController.verifyPasswordReset);

// Authenticated user profile
router.get('/me', authenticateToken, authController.getMe);

// Admin-only user management (OEP-F-004)
router.get('/users', authenticateToken, requireRole('Admin'), authController.getAllUsers);
router.patch('/users/:id', authenticateToken, requireRole('Admin'), authController.updateUserStatus);

module.exports = router;

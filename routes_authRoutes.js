const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/update-fcm-token', verifyToken, authController.updateFCMToken);

module.exports = router;
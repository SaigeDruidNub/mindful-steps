const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Google OAuth callback
router.post('/google/callback', [
  body('code').notEmpty().withMessage('Authorization code is required'),
  body('redirectUri').isURL().withMessage('Valid redirect URI is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const result = await authController.googleCallback(req.body);
    res.json(result);
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Apple Sign In callback
router.post('/apple/callback', [
  body('code').notEmpty().withMessage('Authorization code is required'),
  body('redirectUri').isURL().withMessage('Valid redirect URI is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const result = await authController.appleCallback(req.body);
    res.json(result);
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authController.getCurrentUser(req.user.userId);
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'User not found' });
  }
});

// Refresh token
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const result = await authController.refreshToken(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await authController.logout(req.user.userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
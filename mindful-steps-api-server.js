require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
app.use(express.json());

// In-memory user store (replace with database in production)
const users = new Map();

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/callback'
);

// Google OAuth callback
app.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    console.log('Received OAuth code, exchanging for tokens...');

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('Tokens received, getting user info...');

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    console.log('User info retrieved:', data.email);

    // Create or find user
    let user = users.get(data.email);
    if (!user) {
      user = {
        id: 'user_' + Date.now(),
        email: data.email,
        name: data.name,
        avatar: data.picture,
        provider: 'google',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      users.set(data.email, user);
      console.log('New user created:', user.email);
    } else {
      user.lastLogin = new Date().toISOString();
      users.set(data.email, user);
      console.log('Existing user logged in:', user.email);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('Authentication successful for:', user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(400).json({ error: 'Authentication failed: ' + error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: Date.now(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OAuth Server running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:3001/health');
  
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('❌ GOOGLE_CLIENT_ID not set in environment variables');
  }
  if (!process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ GOOGLE_CLIENT_SECRET not set in environment variables');
  }
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not set in environment variables');
  }
});
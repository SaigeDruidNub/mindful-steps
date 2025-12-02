const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

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
  'http://localhost:3000/auth/callback' // Your redirect URI
);

// Google OAuth callback
app.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

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
    } else {
      user.lastLogin = new Date().toISOString();
      users.set(data.email, user);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
    res.status(400).json({ error: 'Authentication failed' });
  }
});

// Get current user
app.get('/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
app.post('/auth/logout', (req, res) => {
  res.json({ success: true });
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
});
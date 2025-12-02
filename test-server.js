const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Simple test endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: Date.now(),
    message: 'Test server is running'
  });
});

// Mock Google OAuth callback for testing
app.post('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Received mock OAuth code:', code ? 'present' : 'missing');
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Create a mock user for testing
    const mockUser = {
      id: 'user_' + Date.now(),
      email: 'testuser@gmail.com',
      name: 'Test User',
      avatar: 'https://lh3.googleusercontent.com/a/default-user',
      provider: 'google',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Generate a mock JWT token
    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email },
      'test-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Mock authentication successful for:', mockUser.email);

    res.json({
      success: true,
      token,
      user: mockUser
    });

  } catch (error) {
    console.error('Mock auth error:', error);
    res.status(400).json({ error: 'Authentication failed: ' + error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test OAuth Server running on http://localhost:${PORT}`);
  console.log('📊 Health check: http://localhost:3001/health`);
  console.log('🔑 This is a TEST server for development');
});
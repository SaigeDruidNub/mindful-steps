const express = require('express');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Vultr Object Storage Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.VULTR_ACCESS_KEY,
  secretAccessKey: process.env.VULTR_SECRET_KEY,
  endpoint: process.env.VULTR_ENDPOINT,
  region: process.env.VULTR_REGION,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.VULTR_BUCKET || 'mindful-steps';

// In-memory storage for development (replace with database in production)
let users = new Map();
let walkLogs = new Map();
let goals = new Map();
let streaks = new Map();
let photos = new Map();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Authentication middleware (simple token-based)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // In production, verify the JWT token
  // For now, we'll just check if it exists
  next();
};

// Walk Logs endpoints
app.get('/walk-logs', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    
    // Try to load from Vultr first
    try {
      const key = `data/${deviceId}/walk-logs.json`;
      const result = await s3.getObject({
        Bucket: BUCKET_NAME,
        Key: key,
      }).promise();
      
      const vultrLogs = JSON.parse(result.Body.toString());
      console.log('✅ Loaded walk logs from Vultr:', vultrLogs.length, 'logs');
      return res.json({ success: true, data: vultrLogs });
    } catch (s3Error) {
      if (s3Error.code !== 'NoSuchKey') {
        console.warn('⚠️ Error loading from Vultr:', s3Error.message);
      }
    }
    
    // Fallback to memory
    const userLogs = Array.from(walkLogs.values()).filter(log => log.deviceId === deviceId);
    res.json({ success: true, data: userLogs });
  } catch (error) {
    console.error('Error getting walk logs:', error);
    res.status(500).json({ success: false, error: 'Failed to get walk logs' });
  }
});

app.post('/walk-logs', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const logData = { ...req.body, deviceId, timestamp: Date.now() };
    
    // Save to memory
    walkLogs.set(logData.id, logData);
    
    // Save all device logs to Vultr
    try {
      const userLogs = Array.from(walkLogs.values()).filter(log => log.deviceId === deviceId);
      const key = `data/${deviceId}/walk-logs.json`;
      
      await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(userLogs, null, 2),
        ContentType: 'application/json',
        ACL: 'private',
      }).promise();
      
      console.log('✅ Walk logs saved to Vultr:', userLogs.length, 'logs');
    } catch (s3Error) {
      console.error('⚠️ Failed to save to Vultr:', s3Error);
      // Continue even if Vultr fails
    }
    
    res.json({ success: true, data: logData });
  } catch (error) {
    console.error('Error saving walk log:', error);
    res.status(500).json({ success: false, error: 'Failed to save walk log' });
  }
});

app.delete('/walk-logs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deviceId = req.headers['x-device-id'];
    
    if (!walkLogs.has(id)) {
      return res.status(404).json({ success: false, error: 'Walk log not found' });
    }
    
    walkLogs.delete(id);
    
    // Update Vultr
    try {
      const userLogs = Array.from(walkLogs.values()).filter(log => log.deviceId === deviceId);
      const key = `data/${deviceId}/walk-logs.json`;
      
      await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(userLogs, null, 2),
        ContentType: 'application/json',
        ACL: 'private',
      }).promise();
      
      console.log('✅ Walk log deleted from Vultr');
    } catch (s3Error) {
      console.error('⚠️ Failed to delete from Vultr:', s3Error);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting walk log:', error);
    res.status(500).json({ success: false, error: 'Failed to delete walk log' });
  }
});

// Goals endpoints
app.get('/goals', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    
    // Try to load from Vultr first
    try {
      const key = `data/${deviceId}/goals.json`;
      const result = await s3.getObject({
        Bucket: BUCKET_NAME,
        Key: key,
      }).promise();
      
      const vultrGoals = JSON.parse(result.Body.toString());
      console.log('✅ Loaded goals from Vultr');
      return res.json({ success: true, data: vultrGoals });
    } catch (s3Error) {
      if (s3Error.code !== 'NoSuchKey') {
        console.warn('⚠️ Error loading goals from Vultr:', s3Error.message);
      }
    }
    
    // Fallback to memory or defaults
    const userGoals = goals.get(deviceId) || { daily: 5000, weekly: 35000, monthly: 150000 };
    res.json({ success: true, data: userGoals });
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ success: false, error: 'Failed to get goals' });
  }
});

app.put('/goals', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const goalsData = req.body;
    
    // Save to memory
    goals.set(deviceId, goalsData);
    
    // Save to Vultr
    try {
      const key = `data/${deviceId}/goals.json`;
      
      await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(goalsData, null, 2),
        ContentType: 'application/json',
        ACL: 'private',
      }).promise();
      
      console.log('✅ Goals saved to Vultr');
    } catch (s3Error) {
      console.error('⚠️ Failed to save goals to Vultr:', s3Error);
    }
    
    res.json({ success: true, data: goalsData });
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).json({ success: false, error: 'Failed to save goals' });
  }
});

// Streak endpoints
app.get('/streak', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    
    // Try to load from Vultr first
    try {
      const key = `data/${deviceId}/streak.json`;
      const result = await s3.getObject({
        Bucket: BUCKET_NAME,
        Key: key,
      }).promise();
      
      const vultrStreak = JSON.parse(result.Body.toString());
      console.log('✅ Loaded streak from Vultr');
      return res.json({ success: true, data: vultrStreak });
    } catch (s3Error) {
      if (s3Error.code !== 'NoSuchKey') {
        console.warn('⚠️ Error loading streak from Vultr:', s3Error.message);
      }
    }
    
    // Fallback to memory or defaults
    const userStreak = streaks.get(deviceId) || { current: 0, longest: 0, lastWalkDate: '' };
    res.json({ success: true, data: userStreak });
  } catch (error) {
    console.error('Error getting streak:', error);
    res.status(500).json({ success: false, error: 'Failed to get streak' });
  }
});

app.post('/streak', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const { walkDate } = req.body;
    let userStreak = streaks.get(deviceId) || { current: 0, longest: 0, lastWalkDate: '' };

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (walkDate === userStreak.lastWalkDate) {
      // Same day, no change
    } else if (walkDate === yesterday || walkDate === today) {
      // Consecutive day
      userStreak.current++;
      if (userStreak.current > userStreak.longest) {
        userStreak.longest = userStreak.current;
      }
    } else {
      // Streak broken
      userStreak.current = 1;
    }
    
    userStreak.lastWalkDate = walkDate;
    streaks.set(deviceId, userStreak);
    
    // Save to Vultr
    try {
      const key = `data/${deviceId}/streak.json`;
      
      await s3.putObject({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: JSON.stringify(userStreak, null, 2),
        ContentType: 'application/json',
        ACL: 'private',
      }).promise();
      
      console.log('✅ Streak saved to Vultr');
    } catch (s3Error) {
      console.error('⚠️ Failed to save streak to Vultr:', s3Error);
    }
    
    res.json({ success: true, data: userStreak });
  } catch (error) {
    console.error('Error saving streak:', error);
    res.status(500).json({ success: false, error: 'Failed to save streak' });
  }
});

// Photo endpoints
app.get('/photos', authenticateToken, (req, res) => {
  const deviceId = req.headers['x-device-id'];
  const userPhotos = Array.from(photos.values()).filter(photo => photo.deviceId === deviceId);
  res.json({ success: true, data: userPhotos });
});

app.post('/photos', authenticateToken, async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const photoData = { ...req.body, deviceId, timestamp: Date.now() };
    
    // If photo has base64 imageUrl, upload to Vultr
    if (photoData.imageUrl && photoData.imageUrl.startsWith('data:image/')) {
      try {
        // Extract base64 data
        const base64Data = photoData.imageUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Determine file extension from mime type
        const mimeType = photoData.imageUrl.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        
        // Generate unique filename
        const fileName = `photos/${deviceId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;

        // Upload to Vultr Object Storage
        const params = {
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'public-read', // Make photos publicly accessible
        };

        const result = await s3.upload(params).promise();
        console.log('✅ Photo uploaded to Vultr:', result.Location);
        
        // Replace base64 data with Vultr URL
        photoData.imageUrl = result.Location;
      } catch (uploadError) {
        console.error('⚠️ Failed to upload to Vultr, keeping base64:', uploadError);
        // Keep base64 data if upload fails
      }
    }
    
    photos.set(photoData.id, photoData);
    res.json({ success: true, data: photoData });
  } catch (error) {
    console.error('Error saving photo:', error);
    res.status(500).json({ success: false, error: 'Failed to save photo' });
  }
});

app.delete('/photos/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const photo = photos.get(id);
    
    if (!photo) {
      return res.status(404).json({ success: false, error: 'Photo not found' });
    }
    
    // If photo is stored in Vultr, delete it
    if (photo.imageUrl && photo.imageUrl.includes('vultrobjects.com')) {
      try {
        const url = new URL(photo.imageUrl);
        const key = url.pathname.substring(1); // Remove leading slash
        
        await s3.deleteObject({
          Bucket: BUCKET_NAME,
          Key: key,
        }).promise();
        
        console.log('✅ Photo deleted from Vultr:', key);
      } catch (deleteError) {
        console.error('⚠️ Failed to delete from Vultr:', deleteError);
      }
    }
    
    photos.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ success: false, error: 'Failed to delete photo' });
  }
});

// Object Storage Upload endpoint
app.post('/storage/upload', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const deviceId = req.headers['x-device-id'];
    const metadata = JSON.parse(req.body.metadata);
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${deviceId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}${fileExtension}`;

    // Upload to Vultr Object Storage
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: metadata,
    };

    const result = await s3.upload(params).promise();
    
    // Save photo metadata
    const photoData = {
      id: `photo-${Date.now()}`,
      deviceId,
      imageUrl: result.Location,
      ...metadata,
      timestamp: Date.now(),
    };
    
    photos.set(photoData.id, photoData);
    
    res.json({ 
      success: true, 
      data: { url: result.Location, photoId: photoData.id } 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload photo' 
    });
  }
});

// Migration endpoints
app.post('/migration/backup', authenticateToken, (req, res) => {
  const backupData = req.body;
  // In production, save to database or file system
  console.log('Backup data received:', backupData);
  res.json({ success: true, message: 'Backup saved' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ 
    success: false, 
    error: error.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mindful Steps API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Object Storage: ${BUCKET_NAME}`);
});

module.exports = app;
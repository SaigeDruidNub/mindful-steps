# 🌧️ Raindrop Deployment Guide for Mindful Steps

## Overview

Your Mindful Steps app will use a hybrid deployment:
- **Frontend**: Next.js PWA on Vercel (keeps device APIs, PWA features)
- **Backend**: Raindrop services for data persistence, storage, and processing

## 🚀 Deployment Steps

### 1. Install Raindrop CLI & Dependencies

```bash
# Install Raindrop CLI globally (correct package name)
npm install -g @liquidmetal-ai/raindrop

# Install Raindrop framework
npm install --save-dev @liquidmetal-ai/raindrop-framework

# Generate TypeScript bindings
raindrop build generate
```

### 2. Project Structure Setup

Your project should now have:
```
mindful-steps/
├── raindrop.manifest          # ✅ Created
├── src/
│   └── raindrop/
│       ├── api.ts             # ✅ Created - Main API service
│       ├── photo-processor.ts # ✅ Created - Photo upload handler
│       ├── walk-analyzer.ts   # ✅ Created - Walk data processor
│       └── schema.sql         # ✅ Created - Database schema
├── src/                       # Your existing Next.js app
├── public/
└── package.json
```

### 3. Database Setup

The schema will be automatically applied when you deploy. It includes:
- `walk_logs` - Store walking sessions
- `user_photos` - Photo metadata
- `achievements` - User achievements
- `daily_stats` - Daily step totals

### 4. Deploy to Raindrop

```bash
# Deploy backend services
raindrop build deploy
```

This will deploy:
- API service at `https://mindful-steps.raindrop.app`
- SQL database for data storage
- Bucket for photo uploads
- Queue and observers for async processing

### 5. Configure Frontend for Raindrop

Create `src/config/raindrop.ts`:

```typescript
export const RAINDROP_CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_RAINDROP_API_URL || 'https://mindful-steps.raindrop.app',
  bucketUrl: 'https://user-photos.mindful-steps.raindrop.app'
};

export const apiClient = {
  async saveWalkLog(walkData: any) {
    const response = await fetch(`${RAINDROP_CONFIG.apiUrl}/api/walk-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(walkData)
    });
    return response.json();
  },

  async getWalkLogs(userId: string) {
    const response = await fetch(`${RAINDROP_CONFIG.apiUrl}/api/walk-logs?userId=${userId}`);
    return response.json();
  },

  async getUserStats(userId: string) {
    const response = await fetch(`${RAINDROP_CONFIG.apiUrl}/api/user-stats?userId=${userId}`);
    return response.json();
  }
};
```

### 6. Update Environment Variables

Add to your `.env.local`:
```
NEXT_PUBLIC_RAINDROP_API_URL=https://mindful-steps.raindrop.app
```

### 7. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

## 🔄 Integration Points

### 1. Walk Log Saving
```typescript
// In your step counting component
import { apiClient } from '../config/raindrop';

const completeWalk = async () => {
  const walkData = {
    userId: 'user-123', // You'll need auth for this
    steps: currentSteps,
    distance: calculateDistance(steps),
    duration: walkDuration
  };
  
  await apiClient.saveWalkLog(walkData);
};
```

### 2. Photo Uploads
```typescript
const uploadPhoto = async (file: File) => {
  // Get presigned URL from your Raindrop API
  const response = await fetch(`${RAINDROP_CONFIG.apiUrl}/api/presigned-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      userId: 'user-123',
      fileName: file.name 
    })
  });
  
  const { url, key } = await response.json();
  
  // Upload directly to Raindrop bucket
  await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type }
  });
};
```

### 3. Loading User Data
```typescript
const loadUserStats = async () => {
  const stats = await apiClient.getUserStats('user-123');
  setUserStats(stats);
};
```

## 🎯 What Stays on Frontend

These features remain in your Next.js app:
- ✅ Step counting (Device Motion API)
- ✅ Camera access for photos
- ✅ Local storage for temporary data
- ✅ PWA features (offline, installable)
- ✅ Real-time UI updates
- ✅ Location services (if added)

## 🗄️ What Moves to Raindrop

These features now use Raindrop:
- ✅ Persistent walk log storage
- ✅ Photo storage and processing
- ✅ User statistics and analytics
- ✅ Achievement system
- ✅ Cross-device data sync

## 🔧 Next Steps

1. **Authentication**: Add user identification (JWT/OAuth)
2. **Photo Upload**: Implement presigned URL generation
3. **Real-time Sync**: Add WebSocket or polling for live updates
4. **Analytics**: Enhance with more detailed tracking
5. **Backup**: Export/import functionality

## 🐛 Troubleshooting

### Common Issues:

**CORS Errors**: Ensure your API service has proper CORS headers (included in api.ts)

**Database Connection**: Verify database schema is applied after deployment

**Photo Upload Fails**: Check bucket permissions and presigned URL generation

**Steps Not Saving**: Verify API endpoint URLs and data format

### Debug Commands:

```bash
# Check Raindrop deployment status
raindrop status

# View logs
raindrop logs api

# Test API endpoints
curl -X POST https://mindful-steps.raindrop.app/api/walk-logs \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","steps":1000}'
```

## 📱 Mobile Considerations

Your PWA features work exactly the same:
- Device motion sensors
- Camera access
- Offline functionality
- Home screen installation

The only difference is data now syncs to the cloud!

---

**Ready to deploy!** 🚀

1. Install Raindrop CLI
2. Deploy backend: `raindrop deploy`
3. Deploy frontend: `vercel --prod`
4. Update environment variables
5. Test the integration

Your mindful walking app now has cloud persistence while keeping all its mobile features!
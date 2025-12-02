# Mindful Steps API Server

## Setup Instructions

### Prerequisites
- Node.js 14+ installed
- Vultr account with Object Storage bucket created
- Google OAuth credentials (optional for full functionality)

### Installation

1. Navigate to the api directory:
```bash
cd api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=3001

# Vultr Object Storage Configuration
VULTR_ACCESS_KEY=your_vultr_access_key
VULTR_SECRET_KEY=your_vultr_secret_key
VULTR_BUCKET=mindful-steps
VULTR_REGION=your_bucket_region
VULTR_ENDPOINT=https://your-region.vultrobjects.com

# Optional: JWT Secret for authentication
JWT_SECRET=your_jwt_secret_here
```

### Vultr Object Storage Setup

1. Create a Vultr Object Storage bucket:
   - Log in to your Vultr account
   - Navigate to Object Storage
   - Create a new bucket
   - Note your access keys and bucket details

2. Configure CORS on your bucket (if needed):
   - Add your domain to CORS configuration
   - Allow necessary HTTP methods (GET, POST, PUT, DELETE)

### Running the Server

Development mode with auto-restart:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

### API Endpoints

#### Health Check
- `GET /health` - Server health status

#### Authentication
All endpoints (except health) require an `Authorization: Bearer <token>` header.

#### Walk Logs
- `GET /walk-logs` - Get all walk logs for user
- `POST /walk-logs` - Save a new walk log
- `DELETE /walk-logs/:id` - Delete a walk log

#### Goals
- `GET /goals` - Get user's step goals
- `PUT /goals` - Update user's step goals

#### Streak
- `GET /streak` - Get user's walking streak
- `POST /streak` - Update walking streak

#### Photos
- `GET /photos` - Get all photos for user
- `POST /photos` - Save photo metadata
- `DELETE /photos/:id` - Delete a photo

#### Object Storage
- `POST /storage/upload` - Upload photo to Vultr Object Storage
  - Requires `multipart/form-data` with `photo` field
  - Requires `metadata` field as JSON string

#### Migration
- `POST /migration/backup` - Backup user data during migration

### Data Storage

Currently uses in-memory storage for development. For production, replace with:
- PostgreSQL or MongoDB database
- Redis for caching
- Proper JWT authentication

### Integration with Frontend

The frontend will automatically:
1. Use localStorage when API is unavailable
2. Queue data for sync when offline
3. Sync data when API becomes available
4. Fall back gracefully on errors

### Security Notes

- Implement proper JWT validation
- Add rate limiting
- Validate file uploads
- Sanitize all inputs
- Use HTTPS in production
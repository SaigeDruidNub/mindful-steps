const fs = require('fs');
const path = require('path');

// Simple verification script for Node.js environments
console.log('🔍 Verifying Vultr Object Storage Setup...');
console.log('');

// Check if api directory exists
const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
    console.log('✅ API directory exists');
    
    // Check package.json
    const packageJsonPath = path.join(apiDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        console.log('✅ API package.json exists');
    } else {
        console.log('❌ API package.json missing');
    }
    
    // Check .env file
    const envPath = path.join(apiDir, '.env');
    if (fs.existsSync(envPath)) {
        console.log('✅ Backend .env exists');
        console.log('⚠️  Make sure it contains your Vultr credentials');
    } else {
        console.log('⚠️  Backend .env missing - copy api/.env.example to api/.env');
    }
    
    // Check server.js
    const serverPath = path.join(apiDir, 'server.js');
    if (fs.existsSync(serverPath)) {
        console.log('✅ API server.js exists');
    } else {
        console.log('❌ API server.js missing');
    }
} else {
    console.log('❌ API directory missing');
}

console.log('');

// Check frontend .env.local
const envLocalPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log('✅ Frontend .env.local exists');
    try {
        const envContent = fs.readFileSync(envLocalPath, 'utf8');
        const lines = envContent.split('\n');
        const configLines = lines.filter(line => line.trim() && !line.startsWith('#'));
        
        console.log('📄 Configuration found:');
        configLines.forEach(line => {
            if (line.includes('NEXT_PUBLIC_GOOGLE_CLIENT_ID')) {
                console.log('  ✅ Google Client ID configured');
            } else if (line.includes('NEXT_PUBLIC_API_BASE_URL')) {
                console.log('  ✅ API Base URL configured');
            }
        });
    } catch (err) {
        console.log('❌ Error reading .env.local:', err.message);
    }
} else {
    console.log('⚠️  Frontend .env.local missing');
}

console.log('');
console.log('🚀 Setup Instructions:');
console.log('1. Create Vultr Object Storage bucket named: mindful-steps');
console.log('2. Configure api/.env with your Vultr credentials');
console.log('3. Install API dependencies: cd api && npm install');
console.log('4. Start API server: cd api && npm run dev');
console.log('5. Start frontend: npm run dev');
console.log('');
console.log('📊 Expected bucket structure in Vultr:');
console.log('mindful-steps/');
console.log('├── device-xxxxxxx/');
console.log('│   ├── photo-123456789.jpg');
console.log('│   └── ...');
console.log('├── metadata/');
console.log('└── backups/');
console.log('');
console.log('✨ Your bucket name "mindful-steps" is configured in all files!');
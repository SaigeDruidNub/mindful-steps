#!/bin/bash

# Vultr Storage Setup Verification Script
# Run this to verify your configuration is correct

echo "🔍 Verifying Vultr Object Storage Setup..."
echo ""

# Check if .env.local exists in frontend
if [ -f ".env.local" ]; then
    echo "✅ Frontend .env.local exists"
    echo "📄 Contents:"
    cat .env.local | grep -v "^#" | grep -v "^$"
else
    echo "❌ Frontend .env.local missing"
    echo "Please create .env.local with your configuration"
fi

echo ""

# Check if .env exists in api folder
if [ -f "api/.env" ]; then
    echo "✅ Backend api/.env exists"
    echo "📄 Contents (sensitive info hidden):"
    cat api/.env | grep -v "^#" | grep -v "^$" | sed 's/=.*/=***HIDDEN***/'
else
    echo "❌ Backend api/.env missing"
    echo "Please copy api/.env.example to api/.env and configure it"
fi

echo ""
echo "🚀 Next Steps:"
echo "1. Make sure your Vultr Object Storage bucket 'mindful-steps' exists"
echo "2. Start the API server: cd api && npm run dev"
echo "3. Start the frontend: npm run dev"
echo "4. Test photo upload functionality"
echo ""
echo "📊 Expected bucket structure:"
echo "mindful-steps/"
echo "├── device-xxxxxxx/"
echo "│   ├── photo-123456789.jpg"
echo "│   └── ..."
echo "├── metadata/"
echo "└── backups/"
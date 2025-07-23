#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the client
echo "🔨 Building client..."
cd client && npm run build && cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app should be available at the URL shown above"
echo ""
echo "📝 Don't forget to:"
echo "1. Set your MONGODB_URI environment variable in Vercel dashboard"
echo "2. Update the API URL in your client code if needed"
echo "3. Test all functionality after deployment"

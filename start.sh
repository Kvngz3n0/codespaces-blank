#!/bin/bash

# Web Scraper - Quick Start Script

echo "🕷️  Web Scraper - Quick Start"
echo "================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
    echo ""
fi

# Check development mode
if [ "$1" == "--build" ]; then
    echo "🏗️  Building for production..."
    npm run build
    echo "✅ Build complete!"
    echo ""
    echo "To start production server:"
    echo "  npm run start:server"
    exit 0
fi

# Check production mode
if [ "$1" == "--prod" ]; then
    echo "📦 Building..."
    npm run build > /dev/null 2>&1
    echo "🚀 Starting production server on http://localhost:5000"
    npm run start:server
    exit 0
fi

# Default: development mode
echo "🚀 Starting development servers..."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "⚙️  Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev


#!/bin/bash

# Start script for RoleVault - Single Server Implementation with PM2
# Backend serves frontend on same port
# Usage: ./start-app.sh [--seed]

set -e

# Check for seed flag
SEED_DATA=false
if [[ "$1" == "--seed" ]]; then
    SEED_DATA=true
    echo "🌱 Seed flag detected - will seed database after startup"
fi

echo "🚀 Starting RoleVault with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 not found. Installing PM2..."
    npm install -g pm2
fi

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Build frontend
echo "🔨 Building frontend..."
cd frontend && npm run build && cd ..

# Start backend with PM2 (serves frontend)
echo "🚀 Starting server with PM2..."
cd backend
pm2 start server.js --name rolevault-app
cd ..

# Save PM2 process list
pm2 save

# Seed database if flag was provided
if [[ "$SEED_DATA" == "true" ]]; then
    echo "🌱 Seeding database..."
    cd backend
    npm run seed
    cd ..
    echo "✅ Database seeded successfully!"
fi

echo "✅ RoleVault started successfully!"
APP_PORT=${PORT:-5000}
echo "🌐 App: http://localhost:$APP_PORT"
echo "📋 PM2 status: pm2 status"
echo "📋 Logs: pm2 logs rolevault-app"
echo "🛑 Stop: ./stop-app.sh"

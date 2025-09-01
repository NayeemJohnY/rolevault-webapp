#!/bin/bash

# Start the app using background processes (no PM2)
# This script will:
# - install dependencies for backend and frontend
# - start backend and frontend in background
# - save process IDs for easy stopping

set -e

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "📁 Project root: $APP_ROOT"

echo "🚀 Starting RoleVault with background processes..."

echo "📦 Checking backend dependencies..."
cd "$APP_ROOT/backend"
if [ ! -d "node_modules" ]; then
	echo "📥 node_modules not found in backend — installing..."
	npm ci || npm install
else
	echo "✅ backend node_modules present — running npm update"
	npm update
fi

echo "📦 Checking frontend dependencies..."
cd "$APP_ROOT/frontend"
if [ ! -d "node_modules" ]; then
	echo "📥 node_modules not found in frontend — installing..."
	npm ci || npm install
else
	echo "✅ frontend node_modules present — running npm update"
	npm update
fi

echo "✅ Dependency check complete."

# Stop any existing processes
echo "⏹️ Stopping existing processes (if any)"
pkill -f "npm run dev" >/dev/null 2>&1 || true
pkill -f "npm start" >/dev/null 2>&1 || true
pkill -f "react-scripts start" >/dev/null 2>&1 || true

echo "🌐 Starting backend in background"
cd "$APP_ROOT/backend"
nohup npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo "  Backend PID: $BACKEND_PID"

echo "⚛️ Starting frontend in background"
cd "$APP_ROOT/frontend"
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
echo "  Frontend PID: $FRONTEND_PID"

echo "✅ Applications started in background"
echo "  - Backend: http://localhost:5000 (PID: $BACKEND_PID)"
echo "  - Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo "  - Backend logs: $APP_ROOT/backend/backend.log"
echo "  - Frontend logs: $APP_ROOT/frontend/frontend.log"
echo "To stop: run ./stop-app.sh"

# Wait a moment and check if processes are running
sleep 3
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start - check backend.log"
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start - check frontend.log"
fi

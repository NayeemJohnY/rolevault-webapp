#!/bin/bash

# Simple script to install dependencies and start the role-based webapp

echo "🚀 Starting Role-Based Web Application..."

# Install backend dependencies
echo "📦 Installing and upgrading backend dependencies..."
cd backend
npm update
npm install

# Install frontend dependencies  
echo "📦 Installing and upgrading frontend dependencies..."
cd ../frontend
npm update
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "🔥 Starting applications..."
echo "📍 Backend will run on: http://localhost:5000"
echo "📍 Frontend will run on: http://localhost:3000"
echo ""
echo "🛑 Press Ctrl+C to stop both servers"
echo ""

# Start both applications in parallel
echo "🌐 Starting backend server..."
cd ../backend
npm run dev &
BACKEND_PID=$!

echo "⚛️ Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

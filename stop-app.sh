#!/bin/bash

# Stop RoleVault background processes
set -e

APP_ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "📁 Project root: $APP_ROOT"

echo "⏹️ Stopping RoleVault processes..."

# Stop using PID files if they exist
if [ -f "$APP_ROOT/backend/backend.pid" ]; then
    BACKEND_PID=$(cat "$APP_ROOT/backend/backend.pid")
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "🌐 Stopping backend (PID: $BACKEND_PID)"
        kill $BACKEND_PID
    fi
    rm -f "$APP_ROOT/backend/backend.pid"
fi

if [ -f "$APP_ROOT/frontend/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$APP_ROOT/frontend/frontend.pid")
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "⚛️ Stopping frontend (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID
    fi
    rm -f "$APP_ROOT/frontend/frontend.pid"
fi

# Fallback: kill by process name
echo "🔍 Killing any remaining processes..."
pkill -f "npm run dev" >/dev/null 2>&1 || true
pkill -f "npm start" >/dev/null 2>&1 || true
pkill -f "react-scripts start" >/dev/null 2>&1 || true
pkill -f "nodemon server.js" >/dev/null 2>&1 || true

echo "✅ Stopped all RoleVault processes"
echo "Logs are preserved in:"
echo "  - Backend: $APP_ROOT/backend/backend.log"
echo "  - Frontend: $APP_ROOT/frontend/frontend.log"

exit 0

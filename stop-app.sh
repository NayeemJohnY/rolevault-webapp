#!/bin/bash

# Stop script for RoleVault with PM2

echo "🛑 Stopping RoleVault..."

# Stop and delete PM2 process
pm2 stop rolevault-app 2>/dev/null || echo "App not running in PM2"
pm2 delete rolevault-app 2>/dev/null || echo "App process not found in PM2"

echo "✅ RoleVault stopped successfully!"
echo "📋 View PM2 status: pm2 status"

#!/bin/bash

# Entrypoint script for RoleVault Docker container
# This script starts services and keeps the container running for GitHub Actions

set -e

echo "🔧 Container entrypoint starting..."

# Ensure data directory exists
mkdir -p /data/db

# Start MongoDB
echo "🍃 Starting MongoDB..."
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db

# Wait a moment for MongoDB to be ready
sleep 5

# Start RoleVault application (this will keep running)
echo "🚀 Starting RoleVault application..."
cd /app
exec ./start-app.sh --seed
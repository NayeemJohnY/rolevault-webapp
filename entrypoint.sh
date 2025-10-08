#!/bin/bash

# Entrypoint script for RoleVault Docker container
# This script starts services and keeps the container running for GitHub Actions

set -e

echo "🔧 Container entrypoint starting..."

# Ensure data directory exists
mkdir -p /data/db

# Start MongoDB
echo "🍃 Starting MongoDB..."
# Start MongoDB as daemon
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db --bind_ip 0.0.0.0

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
    if mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        echo "✅ MongoDB is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MongoDB failed to start within 30 seconds"
        cat /var/log/mongodb.log
        exit 1
    fi
    sleep 1
done

# Start RoleVault application (this will keep running)
echo "🚀 Starting RoleVault application..."
cd /app
exec ./start-app.sh --seed
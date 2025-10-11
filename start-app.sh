#!/bin/bash

# Start script for RoleVault - Single Server Implementation
# Backend serves frontend on same port
# Usage: ./start-app.sh [--seed] [--dev]

set -e

MODE="prod"
SEED_DATA=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --dev)
            MODE="dev"
            ;;
        --seed)
            SEED_DATA=true
            ;;
    esac
done

echo "🚀 Starting RoleVault in $MODE mode..."

# Set PORT based on MODE/TESTENV
if [[ "$MODE" == "dev" ]]; then
    export PORT=3000
    echo "🔧 Setting PORT to 3000 for development mode"
else
    echo "🔍 TESTENV is set to: ${TESTENV:-prod}"
    if [[ "${TESTENV:-prod}" == "staging" ]]; then
        export PORT=5001
        echo "🔧 Setting PORT to 5001 for staging environment"
    else
        export PORT=5000
        echo "🔧 Setting PORT to 5000 for production environment"
    fi
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


# Seed database if flag was provided
if [[ "$SEED_DATA" == "true" ]]; then
    echo "🌱 Seeding database..."
    cd backend
    npm run seed;
    cd ..
fi


if [[ "$MODE" == "dev" ]]; then
    echo "🛠 Starting in development mode..."

    cd backend && npm run dev &
    cd frontend && npm start

else
    echo "🔨 Building frontend..."
    cd frontend && npm run build && cd ..

    echo "🚀 Starting production server..."
    cd backend && npm start
fi

#!/bin/bash

SEED_DATA=false
if [[ "$1" == "--seed" ]]; then
    SEED_DATA=true
    echo "🌱 Seed flag detected - will seed database after startup"
fi

cd backend && npm run dev &
cd frontend && npm start &
if [[ "$SEED_DATA" == "true" ]]; then
    echo "🌱 Seeding database..."
    cd backend
    npm run seed
    cd ..
    echo "✅ Database seeded successfully!"
fi
wait

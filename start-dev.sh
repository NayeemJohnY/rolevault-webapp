#!/bin/bash
# Start backend and frontend in development mode
cd backend && npm run dev &
cd frontend && npm start &
wait

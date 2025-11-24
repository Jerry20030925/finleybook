#!/bin/bash

# Kill any existing processes on ports 3000-3002
echo "Stopping any existing development processes..."
for port in 3000 3001 3002; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

# Wait a moment
sleep 2

# Start the development server on port 3001
echo "Starting FinleyBook development server on port 3001..."
echo "🚀 Access your app at: http://localhost:3001"
npm run dev
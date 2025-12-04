#!/bin/bash

echo "🚀 Starting RideShare Demo..."

# Kill any existing processes
echo "Cleaning up old processes..."
pkill -f uvicorn 2>/dev/null
pkill -f vite 2>/dev/null  
pkill -f "npm.*dev" 2>/dev/null
sleep 2

# Set paths
PROJECT_ROOT="/Users/monish/Documents/GitHub/csds341-final"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

# Start backend
echo "Starting Backend..."
cd "$BACKEND_DIR"
PYTHONPATH="$BACKEND_DIR" "$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"

# Wait a moment
sleep 3

# Start frontend  
echo "Starting Frontend..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"

# Wait for startup
sleep 5

# Test and show URLs
echo ""
echo "🧪 Testing servers..."
BACKEND_TEST=$(curl -s http://localhost:8000/ 2>/dev/null | grep -q "Carpool" && echo "✅" || echo "❌")
echo "Backend (8000): $BACKEND_TEST"

# Check which port frontend is using
if curl -s http://localhost:3000/ >/dev/null 2>&1; then
    FRONTEND_PORT=3000
elif curl -s http://localhost:3001/ >/dev/null 2>&1; then  
    FRONTEND_PORT=3001
else
    FRONTEND_PORT="unknown"
fi

echo "Frontend ($FRONTEND_PORT): $([ "$FRONTEND_PORT" != "unknown" ] && echo "✅" || echo "❌")"

echo ""
echo "🌐 DEMO READY!"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📋 Your Login:"
echo "   Email: mxs1938@case.edu"  
echo "   Password: monish101"
echo ""
echo "💡 Press CTRL+C to stop servers"

# Keep running until interrupted
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait

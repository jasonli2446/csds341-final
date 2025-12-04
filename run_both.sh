#!/bin/bash

# Kill any existing processes
pkill -f "uvicorn.*app.main:app" 2>/dev/null
pkill -f "vite.*dev" 2>/dev/null
pkill -f "npm.*run.*dev" 2>/dev/null
sleep 2

PROJECT_ROOT="/Users/monish/Documents/GitHub/csds341-final"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

# Start backend in background (no reload to avoid interruptions)
echo "🚀 Starting Backend..."
cd "$PROJECT_ROOT/backend"
PYTHONPATH="$PROJECT_ROOT/backend" "$VENV_PYTHON" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 > /dev/null 2>&1 &
BACKEND_PID=$!

# Start frontend in background
echo "🚀 Starting Frontend..."
cd "$PROJECT_ROOT/frontend"
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!

# Wait for startup
sleep 4

# Test if both are running
echo "🧪 Testing servers..."
BACKEND_OK=$(curl -s http://localhost:8000/ 2>/dev/null | grep -q "Carpool" && echo "✅" || echo "❌")
FRONTEND_OK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200" && echo "✅" || echo "❌")

echo ""
echo "================================"
echo "Backend (8000): $BACKEND_OK"
echo "Frontend (3000): $FRONTEND_OK" 
echo "================================"
echo ""
echo "🌐 DEMO IS READY!"
echo "   Frontend: http://localhost:3000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "💡 Both servers running silently in background"
echo "💡 Press CTRL+C to stop both servers"

# Keep script running and handle cleanup
trap "echo ''; echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; sleep 1; exit 0" INT

# Wait for any process to exit
wait
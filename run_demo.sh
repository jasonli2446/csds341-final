#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/monish/Documents/GitHub/csds341-final"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

echo -e "${YELLOW}🚀 RideShare Demo Launcher${NC}"
echo "================================"

# Kill any existing processes on ports 8000 and 5173
echo -e "${YELLOW}Cleaning up old processes...${NC}"
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2

# Start Backend
echo -e "${YELLOW}Starting Backend (FastAPI on port 8000)...${NC}"
cd "$BACKEND_DIR"
PYTHONPATH="$BACKEND_DIR" "$VENV_PYTHON" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}Backend PID: $BACKEND_PID${NC}"
sleep 3

# Check if backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Backend failed to start. Check logs:${NC}"
    cat /tmp/backend.log
    exit 1
fi

echo -e "${GREEN}✓ Backend running${NC}"

# Start Frontend
echo -e "${YELLOW}Starting Frontend (Vite on port 5173)...${NC}"
cd "$FRONTEND_DIR"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend PID: $FRONTEND_PID${NC}"
sleep 5

# Check if frontend started
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}Frontend failed to start. Check logs:${NC}"
    cat /tmp/frontend.log
    exit 1
fi

echo -e "${GREEN}✓ Frontend running${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✓ Demo is ready!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${YELLOW}Backend API:${NC}  http://localhost:8000"
echo -e "${YELLOW}API Docs:${NC}     http://localhost:8000/docs"
echo -e "${YELLOW}Frontend:${NC}     http://localhost:5173"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo -e "${YELLOW}To stop, press CTRL+C${NC}"
echo ""

# Trap CTRL+C to clean up
trap "echo ''; echo -e '${YELLOW}Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT

# Keep script running
wait

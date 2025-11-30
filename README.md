# Campus Carpool

A full-stack carpooling application for university students. CSDS 341 Final Project.

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Auth**: JWT tokens with bcrypt password hashing

## Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 15+

## Setup

### 1. Database

```bash
# Start PostgreSQL (macOS)
brew services start postgresql@15

# Create database
createdb carpool
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# Run migrations
alembic upgrade head

# Seed sample data (optional)
python -m app.seed_data

# Start server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app runs at http://localhost:3000 (frontend) and http://localhost:8000 (API).

## Demo Accounts

After seeding, you can log in with:

| Email | Password | Notes |
|-------|----------|-------|
| alice@student.edu | alice123 | Has vehicles and rides |
| bob@student.edu | bob123 | Has vehicles and rides |
| charlie@student.edu | charlie123 | Passenger only |

## CLI Tool

A command-line interface for database queries:

```bash
cd backend
python cli.py
```

Options:
1. List available future rides
2. Search rides by origin & destination
3. Show rides for a specific driver
4. Show bookings for a specific passenger
5. List all users
6. Show ride details

## API Endpoints

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Current user info

### Rides
- `GET /rides/search` - Search available rides
- `GET /rides/mine` - Your rides as driver
- `GET /rides/{id}` - Ride details
- `POST /rides` - Create ride

### Bookings
- `POST /rides/{id}/book` - Book a ride
- `GET /bookings/mine` - Your bookings
- `DELETE /bookings/{id}` - Cancel booking

### Vehicles
- `GET /vehicles/mine` - Your vehicles
- `POST /vehicles` - Register vehicle
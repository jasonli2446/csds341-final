"""
Seed data script for the Carpool database.

Creates sample users, vehicles, rides, and bookings for testing/demo purposes.
Safe to run multiple times (idempotent - checks for existing data before inserting).

Usage:
    cd backend
    python -m app.seed_data
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.auth.hashing import hash_password
from app.db import SessionLocal
from app.models import Booking, Ride, User, Vehicle


def get_or_create_user(db, email: str, name: str, password: str, role: str = "student") -> User:
    """Get existing user by email or create a new one."""
    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"  User '{email}' already exists.")
        return user

    user = User(
        name=name,
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.flush()
    print(f"  Created user '{email}'.")
    return user


def get_or_create_vehicle(
    db, owner: User, make: str, model: str, license_plate: str, seats_total: int, color: str = None, year: int = None
) -> Vehicle:
    """Get existing vehicle by license plate or create a new one."""
    vehicle = db.query(Vehicle).filter(Vehicle.license_plate == license_plate).first()
    if vehicle:
        print(f"  Vehicle '{license_plate}' already exists.")
        return vehicle

    vehicle = Vehicle(
        owner_id=owner.user_id,
        make=make,
        model=model,
        color=color,
        license_plate=license_plate,
        seats_total=seats_total,
        year=year,
    )
    db.add(vehicle)
    db.flush()
    print(f"  Created vehicle '{license_plate}'.")
    return vehicle


def create_ride_if_not_exists(
    db,
    driver: User,
    vehicle: Vehicle,
    origin: str,
    destination: str,
    departure_time: datetime,
    seats_available: int,
    price_per_seat: Decimal,
) -> Ride | None:
    """Create a ride if a similar one doesn't already exist."""
    # Check for existing ride with same driver, origin, destination, and departure time
    existing = (
        db.query(Ride)
        .filter(
            Ride.driver_id == driver.user_id,
            Ride.origin_location == origin,
            Ride.destination_location == destination,
            Ride.departure_time == departure_time,
        )
        .first()
    )
    if existing:
        print(f"  Ride '{origin} -> {destination}' at {departure_time} already exists.")
        return existing

    ride = Ride(
        driver_id=driver.user_id,
        vehicle_id=vehicle.vehicle_id,
        origin_location=origin,
        destination_location=destination,
        departure_time=departure_time,
        seats_available=seats_available,
        price_per_seat=price_per_seat,
        status="scheduled",
    )
    db.add(ride)
    db.flush()
    print(f"  Created ride '{origin} -> {destination}'.")
    return ride


def create_booking_if_not_exists(db, ride: Ride, passenger: User) -> Booking | None:
    """Create a booking if it doesn't already exist and business rules are satisfied."""
    # Check if booking already exists
    existing = (
        db.query(Booking)
        .filter(
            Booking.ride_id == ride.ride_id,
            Booking.passenger_id == passenger.user_id,
        )
        .first()
    )
    if existing:
        print(f"  Booking for passenger '{passenger.email}' on ride already exists.")
        return existing

    # Business rule: passenger cannot be the driver
    if ride.driver_id == passenger.user_id:
        print(f"  Skipping: {passenger.email} cannot book their own ride.")
        return None

    # Business rule: check seats available
    if ride.seats_available <= 0:
        print(f"  Skipping: No seats available for ride.")
        return None

    booking = Booking(
        ride_id=ride.ride_id,
        passenger_id=passenger.user_id,
        status="confirmed",
    )
    ride.seats_available -= 1
    db.add(booking)
    db.flush()
    print(f"  Created booking for '{passenger.email}'.")
    return booking


def seed_database():
    """Main seed function."""
    print("Starting database seed...")
    db = SessionLocal()

    try:
        # 1. Create users
        print("\n[1] Creating users...")
        alice = get_or_create_user(db, "alice@student.edu", "Alice Johnson", "alice123", "student")
        bob = get_or_create_user(db, "bob@student.edu", "Bob Smith", "bob123", "student")
        admin = get_or_create_user(db, "admin@carpool.edu", "Admin User", "admin123", "admin")
        charlie = get_or_create_user(db, "charlie@student.edu", "Charlie Brown", "charlie123", "student")

        # 2. Create vehicles
        print("\n[2] Creating vehicles...")
        alice_car = get_or_create_vehicle(
            db, alice, "Toyota", "Camry", "ABC-1234", seats_total=4, color="Silver", year=2020
        )
        alice_suv = get_or_create_vehicle(
            db, alice, "Honda", "CR-V", "XYZ-5678", seats_total=5, color="Blue", year=2022
        )
        bob_car = get_or_create_vehicle(
            db, bob, "Ford", "Focus", "DEF-9012", seats_total=4, color="Red", year=2019
        )

        # 3. Create rides (in the future)
        print("\n[3] Creating rides...")
        now = datetime.now(timezone.utc)
        base_date = now + timedelta(days=1)

        rides_data = [
            # Alice's rides
            (alice, alice_car, "Campus Library", "Downtown Mall", base_date.replace(hour=9, minute=0), 3, Decimal("5.00")),
            (alice, alice_car, "Student Center", "Airport", base_date.replace(hour=14, minute=30), 3, Decimal("15.00")),
            (alice, alice_suv, "Dormitory A", "Train Station", (base_date + timedelta(days=1)).replace(hour=10, minute=0), 4, Decimal("8.00")),
            (alice, alice_suv, "Campus Library", "Shopping Center", (base_date + timedelta(days=2)).replace(hour=11, minute=0), 4, Decimal("6.00")),
            # Bob's rides
            (bob, bob_car, "Gym", "Downtown Mall", base_date.replace(hour=10, minute=30), 3, Decimal("4.50")),
            (bob, bob_car, "Student Center", "Beach", (base_date + timedelta(days=1)).replace(hour=8, minute=0), 3, Decimal("12.00")),
            (bob, bob_car, "Campus Library", "Airport", (base_date + timedelta(days=3)).replace(hour=6, minute=0), 3, Decimal("18.00")),
            (bob, bob_car, "Dormitory B", "Concert Hall", (base_date + timedelta(days=2)).replace(hour=18, minute=0), 3, Decimal("7.00")),
        ]

        rides = []
        for driver, vehicle, origin, dest, dep_time, seats, price in rides_data:
            ride = create_ride_if_not_exists(db, driver, vehicle, origin, dest, dep_time, seats, price)
            if ride:
                rides.append(ride)

        # 4. Create bookings
        print("\n[4] Creating bookings...")
        # Refresh rides to get current seats_available
        db.flush()

        # Bob books Alice's rides
        if len(rides) > 0:
            create_booking_if_not_exists(db, rides[0], bob)  # Bob on Alice's ride 1
        if len(rides) > 1:
            create_booking_if_not_exists(db, rides[1], bob)  # Bob on Alice's ride 2
        if len(rides) > 2:
            create_booking_if_not_exists(db, rides[2], bob)  # Bob on Alice's ride 3

        # Charlie books various rides
        if len(rides) > 0:
            create_booking_if_not_exists(db, rides[0], charlie)  # Charlie on Alice's ride 1
        if len(rides) > 2:
            create_booking_if_not_exists(db, rides[2], charlie)  # Charlie on Alice's ride 3
        if len(rides) > 4:
            create_booking_if_not_exists(db, rides[4], charlie)  # Charlie on Bob's ride 1
        if len(rides) > 5:
            create_booking_if_not_exists(db, rides[5], charlie)  # Charlie on Bob's ride 2

        # Alice books Bob's rides
        if len(rides) > 4:
            create_booking_if_not_exists(db, rides[4], alice)  # Alice on Bob's ride 1
        if len(rides) > 5:
            create_booking_if_not_exists(db, rides[5], alice)  # Alice on Bob's ride 2
        if len(rides) > 6:
            create_booking_if_not_exists(db, rides[6], alice)  # Alice on Bob's ride 3
        if len(rides) > 7:
            create_booking_if_not_exists(db, rides[7], alice)  # Alice on Bob's ride 4

        # Admin books a ride
        if len(rides) > 3:
            create_booking_if_not_exists(db, rides[3], admin)  # Admin on Alice's ride 4

        db.commit()
        print("\nSeed completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"\nError during seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

"""
Command-Line Interface for the Carpool Database.

A simple text-based menu for querying the database directly.
This is an admin/debug tool - no authentication required.

Usage:
    cd backend
    python cli.py
"""

from datetime import datetime, timezone

from app.db import SessionLocal
from app.models import Booking, Ride, User, Vehicle


def get_db():
    """Create a database session."""
    return SessionLocal()


def print_header(title: str):
    """Print a formatted header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def print_ride(ride: Ride, index: int = None):
    """Print a single ride's details."""
    prefix = f"[{index}] " if index is not None else ""
    print(f"{prefix}Ride ID: {ride.ride_id}")
    print(f"    From: {ride.origin_location} -> To: {ride.destination_location}")
    print(f"    Departure: {ride.departure_time.strftime('%Y-%m-%d %H:%M')}")
    print(f"    Seats Available: {ride.seats_available} | Price: ${ride.price_per_seat}")
    print(f"    Status: {ride.status}")
    print()


def print_booking(booking: Booking, index: int = None):
    """Print a single booking's details."""
    prefix = f"[{index}] " if index is not None else ""
    print(f"{prefix}Booking ID: {booking.booking_id}")
    print(f"    Ride ID: {booking.ride_id}")
    print(f"    Booked at: {booking.booking_time.strftime('%Y-%m-%d %H:%M')}")
    print(f"    Status: {booking.status}")
    if booking.ride:
        print(f"    Route: {booking.ride.origin_location} -> {booking.ride.destination_location}")
        print(f"    Departure: {booking.ride.departure_time.strftime('%Y-%m-%d %H:%M')}")
    print()


def list_available_rides(db):
    """List all available future rides."""
    print_header("Available Future Rides")

    now = datetime.now(timezone.utc)
    rides = (
        db.query(Ride)
        .filter(Ride.status == "scheduled", Ride.departure_time >= now)
        .order_by(Ride.departure_time)
        .all()
    )

    if not rides:
        print("No available rides found.")
        return

    print(f"Found {len(rides)} ride(s):\n")
    for i, ride in enumerate(rides, 1):
        print_ride(ride, i)


def search_rides(db):
    """Search rides by origin and/or destination."""
    print_header("Search Rides")

    origin = input("Enter origin (or press Enter to skip): ").strip()
    destination = input("Enter destination (or press Enter to skip): ").strip()

    if not origin and not destination:
        print("Please provide at least one search term.")
        return

    now = datetime.now(timezone.utc)
    query = db.query(Ride).filter(Ride.status == "scheduled", Ride.departure_time >= now)

    if origin:
        query = query.filter(Ride.origin_location.ilike(f"%{origin}%"))
    if destination:
        query = query.filter(Ride.destination_location.ilike(f"%{destination}%"))

    rides = query.order_by(Ride.departure_time).all()

    if not rides:
        print("\nNo matching rides found.")
        return

    print(f"\nFound {len(rides)} matching ride(s):\n")
    for i, ride in enumerate(rides, 1):
        print_ride(ride, i)


def show_driver_rides(db):
    """Show all rides for a specific driver."""
    print_header("Rides by Driver")

    email = input("Enter driver email: ").strip()
    if not email:
        print("Email is required.")
        return

    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"\nNo user found with email '{email}'.")
        return

    rides = (
        db.query(Ride)
        .filter(Ride.driver_id == user.user_id)
        .order_by(Ride.departure_time.desc())
        .all()
    )

    if not rides:
        print(f"\nNo rides found for driver '{user.name}' ({email}).")
        return

    print(f"\nFound {len(rides)} ride(s) for '{user.name}':\n")
    for i, ride in enumerate(rides, 1):
        print_ride(ride, i)


def show_passenger_bookings(db):
    """Show all bookings for a specific passenger."""
    print_header("Bookings by Passenger")

    email = input("Enter passenger email: ").strip()
    if not email:
        print("Email is required.")
        return

    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"\nNo user found with email '{email}'.")
        return

    bookings = (
        db.query(Booking)
        .filter(Booking.passenger_id == user.user_id)
        .order_by(Booking.booking_time.desc())
        .all()
    )

    if not bookings:
        print(f"\nNo bookings found for '{user.name}' ({email}).")
        return

    print(f"\nFound {len(bookings)} booking(s) for '{user.name}':\n")
    for i, booking in enumerate(bookings, 1):
        print_booking(booking, i)


def list_all_users(db):
    """List all users in the system."""
    print_header("All Users")

    users = db.query(User).order_by(User.created_at).all()

    if not users:
        print("No users found.")
        return

    print(f"Found {len(users)} user(s):\n")
    for i, user in enumerate(users, 1):
        print(f"[{i}] {user.name}")
        print(f"    Email: {user.email}")
        print(f"    Role: {user.role}")
        print(f"    Joined: {user.created_at.strftime('%Y-%m-%d')}")
        print()


def show_ride_details(db):
    """Show detailed info about a specific ride including bookings."""
    print_header("Ride Details")

    ride_id = input("Enter ride ID (UUID): ").strip()
    if not ride_id:
        print("Ride ID is required.")
        return

    try:
        ride = db.query(Ride).filter(Ride.ride_id == ride_id).first()
    except Exception:
        print("Invalid ride ID format.")
        return

    if not ride:
        print(f"\nNo ride found with ID '{ride_id}'.")
        return

    driver = db.query(User).filter(User.user_id == ride.driver_id).first()
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == ride.vehicle_id).first()

    print(f"\nRide ID: {ride.ride_id}")
    print(f"Route: {ride.origin_location} -> {ride.destination_location}")
    print(f"Departure: {ride.departure_time.strftime('%Y-%m-%d %H:%M')}")
    if ride.arrival_time:
        print(f"Arrival: {ride.arrival_time.strftime('%Y-%m-%d %H:%M')}")
    print(f"Status: {ride.status}")
    print(f"Price per seat: ${ride.price_per_seat}")
    print(f"Seats available: {ride.seats_available}")

    if driver:
        print(f"\nDriver: {driver.name} ({driver.email})")
    if vehicle:
        print(f"Vehicle: {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})")

    # Show bookings for this ride
    bookings = db.query(Booking).filter(Booking.ride_id == ride.ride_id).all()
    if bookings:
        print(f"\nBookings ({len(bookings)}):")
        for booking in bookings:
            passenger = db.query(User).filter(User.user_id == booking.passenger_id).first()
            passenger_name = passenger.name if passenger else "Unknown"
            print(f"  - {passenger_name}: {booking.status}")


def main_menu():
    """Display the main menu and handle user input."""
    db = get_db()

    while True:
        print("\n" + "=" * 60)
        print("  CARPOOL DATABASE CLI")
        print("=" * 60)
        print("1) List available future rides")
        print("2) Search rides by origin & destination")
        print("3) Show rides for a specific driver (by email)")
        print("4) Show bookings for a specific passenger (by email)")
        print("5) List all users")
        print("6) Show ride details (by ride ID)")
        print("0) Exit")
        print("-" * 60)

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            list_available_rides(db)
        elif choice == "2":
            search_rides(db)
        elif choice == "3":
            show_driver_rides(db)
        elif choice == "4":
            show_passenger_bookings(db)
        elif choice == "5":
            list_all_users(db)
        elif choice == "6":
            show_ride_details(db)
        elif choice == "0":
            print("\nGoodbye!")
            break
        else:
            print("\nInvalid choice. Please try again.")

    db.close()


if __name__ == "__main__":
    main_menu()

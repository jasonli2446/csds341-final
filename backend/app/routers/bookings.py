from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db import get_db
from app.models import Booking, Ride, User
from app.schemas.booking import BookingRead

router = APIRouter(tags=["bookings"])


@router.post("/rides/{ride_id}/book", response_model=BookingRead, status_code=status.HTTP_201_CREATED)
def book_ride(
    ride_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Book a ride as a passenger.
    Business rules enforced:
    - Cannot book your own ride
    - Cannot book the same ride twice
    - Ride must be in the future
    - Ride must be scheduled (not cancelled/completed)
    - seats_available must be > 0
    """
    ride = db.query(Ride).filter(Ride.ride_id == ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )

    # Rule 1: Cannot book your own ride
    if ride.driver_id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book your own ride",
        )

    # Rule 2: Cannot book if ride is cancelled or completed
    if ride.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot book a ride that is {ride.status}",
        )

    # Rule 3: Cannot book a ride in the past
    if ride.departure_time < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book a ride that has already departed",
        )

    # Rule 4: Cannot book if already booked (and not cancelled)
    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.ride_id == ride_id,
            Booking.passenger_id == current_user.user_id,
            Booking.status != "cancelled",
        )
        .first()
    )
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already booked this ride",
        )

    # Rule 5: Check seats available
    if ride.seats_available <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No seats available for this ride",
        )

    # Create booking
    new_booking = Booking(
        ride_id=ride_id,
        passenger_id=current_user.user_id,
        status="confirmed",
    )

    # Decrement seats_available
    ride.seats_available -= 1

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking


@router.get("/bookings/mine", response_model=list[BookingRead])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all bookings where current user is the passenger."""
    bookings = (
        db.query(Booking)
        .filter(Booking.passenger_id == current_user.user_id)
        .order_by(Booking.booking_time.desc())
        .all()
    )
    return bookings


@router.delete("/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel a booking.
    Only the passenger who made the booking can cancel it.
    If the booking was confirmed, increment the ride's seats_available.
    """
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )

    if booking.passenger_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only cancel your own bookings",
        )

    if booking.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled",
        )

    # If booking was confirmed, restore the seat
    if booking.status == "confirmed":
        ride = db.query(Ride).filter(Ride.ride_id == booking.ride_id).first()
        if ride:
            ride.seats_available += 1

    booking.status = "cancelled"
    db.commit()

    return None

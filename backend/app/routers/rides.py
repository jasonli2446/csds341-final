from datetime import date, datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db import get_db
from app.models import Ride, User, Vehicle
from app.schemas.ride import RideCreate, RideRead, RideUpdate

router = APIRouter(prefix="/rides", tags=["rides"])


@router.post("", response_model=RideRead, status_code=status.HTTP_201_CREATED)
def create_ride(
    ride_data: RideCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new ride. The current user becomes the driver."""
    # Validate that user owns the vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == ride_data.vehicle_id).first()
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found",
        )

    if vehicle.owner_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not own this vehicle",
        )

    # Validate seats_available doesn't exceed vehicle capacity
    if ride_data.seats_available > vehicle.seats_total:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"seats_available cannot exceed vehicle capacity ({vehicle.seats_total})",
        )

    new_ride = Ride(
        driver_id=current_user.user_id,
        vehicle_id=ride_data.vehicle_id,
        origin_location=ride_data.origin_location,
        destination_location=ride_data.destination_location,
        departure_time=ride_data.departure_time,
        arrival_time=ride_data.arrival_time,
        seats_available=ride_data.seats_available,
        price_per_seat=ride_data.price_per_seat,
        status="scheduled",
    )

    db.add(new_ride)
    db.commit()
    db.refresh(new_ride)

    return new_ride


@router.get("/search", response_model=list[RideRead])
def search_rides(
    origin: str | None = Query(None),
    destination: str | None = Query(None),
    date: date | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Search for available rides.
    Filters: origin, destination, date (optional).
    Only returns scheduled rides with departure >= now.
    """
    query = db.query(Ride).filter(
        Ride.status == "scheduled",
        Ride.departure_time >= datetime.now(timezone.utc),
    )

    if origin:
        query = query.filter(Ride.origin_location.ilike(f"%{origin}%"))

    if destination:
        query = query.filter(Ride.destination_location.ilike(f"%{destination}%"))

    if date:
        # Filter rides on the specified date
        start_of_day = datetime.combine(date, datetime.min.time()).replace(tzinfo=timezone.utc)
        end_of_day = datetime.combine(date, datetime.max.time()).replace(tzinfo=timezone.utc)
        query = query.filter(
            Ride.departure_time >= start_of_day,
            Ride.departure_time <= end_of_day,
        )

    rides = query.order_by(Ride.departure_time).all()
    return rides


@router.get("/mine", response_model=list[RideRead])
def get_my_rides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all rides where current user is the driver."""
    rides = (
        db.query(Ride)
        .filter(Ride.driver_id == current_user.user_id)
        .order_by(Ride.departure_time.desc())
        .all()
    )
    return rides


@router.get("/{ride_id}", response_model=RideRead)
def get_ride(
    ride_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific ride."""
    ride = db.query(Ride).filter(Ride.ride_id == ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )
    return ride


@router.patch("/{ride_id}", response_model=RideRead)
def update_ride(
    ride_id: UUID,
    ride_update: RideUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a ride. Only the driver can update."""
    ride = db.query(Ride).filter(Ride.ride_id == ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )

    if ride.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the driver can update this ride",
        )

    # Validate status if provided
    if ride_update.status is not None:
        if ride_update.status not in ("scheduled", "completed", "cancelled"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status. Must be 'scheduled', 'completed', or 'cancelled'",
            )

    # Apply updates
    update_data = ride_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ride, field, value)

    db.commit()
    db.refresh(ride)

    return ride


@router.delete("/{ride_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancel_ride(
    ride_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a ride. Only the driver can cancel. Sets status to 'cancelled'."""
    ride = db.query(Ride).filter(Ride.ride_id == ride_id).first()
    if not ride:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ride not found",
        )

    if ride.driver_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the driver can cancel this ride",
        )

    ride.status = "cancelled"
    db.commit()

    return None

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.ride import RideRead


class BookingCreate(BaseModel):
    ride_id: UUID


class BookingRead(BaseModel):
    booking_id: UUID
    ride_id: UUID
    passenger_id: UUID
    booking_time: datetime
    status: str

    model_config = {"from_attributes": True}


class BookingWithRide(BookingRead):
    """Booking with nested ride data for the /mine endpoint."""
    ride: RideRead | None = None

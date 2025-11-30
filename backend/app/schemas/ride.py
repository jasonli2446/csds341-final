from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class RideBase(BaseModel):
    origin_location: str
    destination_location: str
    departure_time: datetime
    arrival_time: datetime | None = None
    price_per_seat: Decimal = Field(default=Decimal("0"), ge=0)


class RideCreate(RideBase):
    vehicle_id: UUID
    seats_available: int = Field(gt=0)


class RideUpdate(BaseModel):
    origin_location: str | None = None
    destination_location: str | None = None
    departure_time: datetime | None = None
    arrival_time: datetime | None = None
    price_per_seat: Decimal | None = None
    status: str | None = None


class RideRead(BaseModel):
    ride_id: UUID
    driver_id: UUID
    vehicle_id: UUID
    origin_location: str
    destination_location: str
    departure_time: datetime
    arrival_time: datetime | None
    price_per_seat: Decimal
    seats_available: int
    status: str

    model_config = {"from_attributes": True}

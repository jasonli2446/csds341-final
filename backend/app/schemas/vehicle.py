from uuid import UUID

from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    make: str
    model: str
    color: str | None = None
    license_plate: str
    seats_total: int = Field(gt=0)
    year: int | None = None
    notes: str | None = None


class VehicleCreate(VehicleBase):
    pass


class VehicleRead(VehicleBase):
    vehicle_id: UUID
    owner_id: UUID

    model_config = {"from_attributes": True}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db import get_db
from app.models import User, Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleRead

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleRead, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new vehicle owned by the current user."""
    # Check if license plate already exists
    existing = db.query(Vehicle).filter(Vehicle.license_plate == vehicle_data.license_plate).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="License plate already registered",
        )

    new_vehicle = Vehicle(
        owner_id=current_user.user_id,
        make=vehicle_data.make,
        model=vehicle_data.model,
        color=vehicle_data.color,
        license_plate=vehicle_data.license_plate,
        seats_total=vehicle_data.seats_total,
        year=vehicle_data.year,
        notes=vehicle_data.notes,
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return new_vehicle


@router.get("/mine", response_model=list[VehicleRead])
def get_my_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all vehicles owned by the current user."""
    vehicles = db.query(Vehicle).filter(Vehicle.owner_id == current_user.user_id).all()
    return vehicles

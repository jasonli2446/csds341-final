import uuid

from sqlalchemy import Column, Text, Integer, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship

from app.db import Base


class Ride(Base):
    __tablename__ = "rides"

    ride_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    driver_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.vehicle_id"), nullable=False)
    origin_location = Column(Text, nullable=False)
    destination_location = Column(Text, nullable=False)
    departure_time = Column(TIMESTAMP(timezone=True), nullable=False)
    arrival_time = Column(TIMESTAMP(timezone=True), nullable=True)
    seats_available = Column(Integer, nullable=False)
    price_per_seat = Column(Numeric(6, 2), nullable=False, default=0)
    status = Column(Text, nullable=False, default="scheduled")

    __table_args__ = (
        CheckConstraint("seats_available >= 0", name="check_seats_available_non_negative"),
        CheckConstraint(
            "status IN ('scheduled', 'completed', 'cancelled')",
            name="check_ride_status",
        ),
    )

    # Relationships
    driver = relationship("User", back_populates="rides")
    vehicle = relationship("Vehicle", back_populates="rides")
    bookings = relationship("Booking", back_populates="ride", cascade="all, delete-orphan")

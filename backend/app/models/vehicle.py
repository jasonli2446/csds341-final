import uuid

from sqlalchemy import Column, String, Text, Integer, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    make = Column(Text, nullable=False)
    model = Column(Text, nullable=False)
    color = Column(Text, nullable=True)
    license_plate = Column(Text, unique=True, nullable=False)
    seats_total = Column(Integer, nullable=False)
    year = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("seats_total > 0", name="check_seats_total_positive"),
    )

    # Relationships
    owner = relationship("User", back_populates="vehicles")
    rides = relationship("Ride", back_populates="vehicle", cascade="all, delete-orphan")

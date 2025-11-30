import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Text, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship

from app.db import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ride_id = Column(UUID(as_uuid=True), ForeignKey("rides.ride_id"), nullable=False)
    passenger_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    booking_time = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    status = Column(Text, nullable=False, default="confirmed")

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'confirmed', 'cancelled')",
            name="check_booking_status",
        ),
        UniqueConstraint("ride_id", "passenger_id", name="unique_ride_passenger"),
    )

    # Relationships
    ride = relationship("Ride", back_populates="bookings")
    passenger = relationship("User", back_populates="bookings")

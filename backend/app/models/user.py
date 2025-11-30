import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.orm import relationship

from app.db import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    email = Column(Text, unique=True, nullable=False)
    hashed_password = Column(Text, nullable=False)
    phone = Column(Text, nullable=True)
    role = Column(Text, nullable=False, default="student")
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        CheckConstraint("role IN ('student', 'admin')", name="check_user_role"),
    )

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner", cascade="all, delete-orphan")
    rides = relationship("Ride", back_populates="driver", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="passenger", cascade="all, delete-orphan")

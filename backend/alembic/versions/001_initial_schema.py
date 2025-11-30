"""Initial schema - create all tables

Revision ID: 001_initial_schema
Revises:
Create Date: 2025-11-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("hashed_password", sa.Text(), nullable=False),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("role", sa.Text(), nullable=False, server_default="student"),
        sa.Column(
            "created_at",
            postgresql.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.UniqueConstraint("email", name="uq_users_email"),
        sa.CheckConstraint("role IN ('student', 'admin')", name="check_user_role"),
    )

    # Create vehicles table
    op.create_table(
        "vehicles",
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("make", sa.Text(), nullable=False),
        sa.Column("model", sa.Text(), nullable=False),
        sa.Column("color", sa.Text(), nullable=True),
        sa.Column("license_plate", sa.Text(), nullable=False),
        sa.Column("seats_total", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["owner_id"], ["users.user_id"], name="fk_vehicles_owner"),
        sa.UniqueConstraint("license_plate", name="uq_vehicles_license_plate"),
        sa.CheckConstraint("seats_total > 0", name="check_seats_total_positive"),
    )

    # Create rides table
    op.create_table(
        "rides",
        sa.Column("ride_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("driver_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("origin_location", sa.Text(), nullable=False),
        sa.Column("destination_location", sa.Text(), nullable=False),
        sa.Column("departure_time", postgresql.TIMESTAMP(timezone=True), nullable=False),
        sa.Column("arrival_time", postgresql.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("seats_available", sa.Integer(), nullable=False),
        sa.Column(
            "price_per_seat", sa.Numeric(precision=6, scale=2), nullable=False, server_default="0"
        ),
        sa.Column("status", sa.Text(), nullable=False, server_default="scheduled"),
        sa.ForeignKeyConstraint(["driver_id"], ["users.user_id"], name="fk_rides_driver"),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.vehicle_id"], name="fk_rides_vehicle"),
        sa.CheckConstraint("seats_available >= 0", name="check_seats_available_non_negative"),
        sa.CheckConstraint(
            "status IN ('scheduled', 'completed', 'cancelled')", name="check_ride_status"
        ),
    )

    # Create bookings table
    op.create_table(
        "bookings",
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("ride_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("passenger_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "booking_time",
            postgresql.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("NOW()"),
        ),
        sa.Column("status", sa.Text(), nullable=False, server_default="confirmed"),
        sa.ForeignKeyConstraint(["ride_id"], ["rides.ride_id"], name="fk_bookings_ride"),
        sa.ForeignKeyConstraint(["passenger_id"], ["users.user_id"], name="fk_bookings_passenger"),
        sa.UniqueConstraint("ride_id", "passenger_id", name="unique_ride_passenger"),
        sa.CheckConstraint(
            "status IN ('pending', 'confirmed', 'cancelled')", name="check_booking_status"
        ),
    )


def downgrade() -> None:
    op.drop_table("bookings")
    op.drop_table("rides")
    op.drop_table("vehicles")
    op.drop_table("users")

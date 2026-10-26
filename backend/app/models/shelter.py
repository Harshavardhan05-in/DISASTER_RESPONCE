import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, Enum as SAEnum, DateTime, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, BaseModel


class ShelterStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    at_capacity = "at_capacity"
    unknown = "unknown"


class Shelter(BaseModel, Base):
    __tablename__ = "shelters"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    shelter_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    total_capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    current_occupancy: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_accessible: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    amenities: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    contact_person: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    official_designation: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    designation_authority: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[ShelterStatus] = mapped_column(
        SAEnum(ShelterStatus, name="shelter_status"), default=ShelterStatus.unknown, nullable=False
    )
    data_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

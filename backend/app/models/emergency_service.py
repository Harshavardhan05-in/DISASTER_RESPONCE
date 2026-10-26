import uuid
import enum
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Boolean, Enum as SAEnum, DateTime, Text
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, BaseModel


class ServiceType(str, enum.Enum):
    police = "police"
    fire = "fire"
    hospital = "hospital"
    ambulance = "ambulance"
    disaster_mgmt = "disaster_mgmt"
    civil_defense = "civil_defense"
    other = "other"


class EmergencyService(BaseModel, Base):
    __tablename__ = "emergency_services"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    service_type: Mapped[ServiceType] = mapped_column(
        SAEnum(ServiceType, name="service_type"), nullable=False
    )
    phone_primary: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone_secondary: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    phone_emergency: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    state: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    operating_hours: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_24_7: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    data_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

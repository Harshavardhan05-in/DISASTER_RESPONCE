from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

from app.models.emergency_service import ServiceType


class EmergencyServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    service_type: ServiceType
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    phone_emergency: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    operating_hours: Optional[str] = None
    is_24_7: bool = True
    website: Optional[str] = None
    email: Optional[str] = None


class EmergencyServiceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    service_type: ServiceType
    phone_primary: Optional[str] = None
    phone_secondary: Optional[str] = None
    phone_emergency: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    operating_hours: Optional[str] = None
    is_24_7: bool
    is_active: bool
    website: Optional[str] = None
    email: Optional[str] = None
    created_at: datetime
    updated_at: datetime

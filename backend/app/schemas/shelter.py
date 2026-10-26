from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

from app.models.shelter import ShelterStatus


class ShelterCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    shelter_type: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    total_capacity: Optional[int] = Field(None, ge=0)
    is_accessible: bool = False
    amenities: Optional[List[str]] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    official_designation: Optional[str] = None
    designation_authority: Optional[str] = None


class ShelterStatusUpdate(BaseModel):
    status: ShelterStatus
    current_occupancy: Optional[int] = Field(None, ge=0)


class ShelterResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    shelter_type: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    total_capacity: Optional[int] = None
    current_occupancy: int
    is_accessible: bool
    amenities: Optional[list] = None
    contact_person: Optional[str] = None
    contact_phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    status: ShelterStatus
    created_at: datetime
    updated_at: datetime

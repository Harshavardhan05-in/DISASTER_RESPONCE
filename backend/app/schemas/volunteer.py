from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid


class VolunteerCreate(BaseModel):
    skills: Optional[List[str]] = None
    certifications: Optional[str] = None
    service_areas: Optional[List[str]] = None
    is_available: bool = True
    availability_notes: Optional[str] = None
    emergency_contact: Optional[str] = None


class VolunteerUpdate(BaseModel):
    skills: Optional[List[str]] = None
    certifications: Optional[str] = None
    service_areas: Optional[List[str]] = None
    is_available: Optional[bool] = None
    availability_notes: Optional[str] = None
    emergency_contact: Optional[str] = None


class VolunteerResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    user_id: uuid.UUID
    skills: Optional[list] = None
    certifications: Optional[str] = None
    service_areas: Optional[list] = None
    is_available: bool
    availability_notes: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

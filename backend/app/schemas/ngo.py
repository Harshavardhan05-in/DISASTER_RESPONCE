from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid


class NGOCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    registration_number: Optional[str] = None
    description: Optional[str] = None
    mission: Optional[str] = None
    service_areas: Optional[List[str]] = None
    hazard_specialties: Optional[List[str]] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None


class NGOResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    registration_number: Optional[str] = None
    description: Optional[str] = None
    mission: Optional[str] = None
    service_areas: Optional[list] = None
    hazard_specialties: Optional[list] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    website: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

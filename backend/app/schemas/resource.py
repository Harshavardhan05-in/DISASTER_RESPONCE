from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid


class ResourceCategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: Optional[str] = None
    unit: str = Field(default="units", max_length=50)


class ResourceInventoryCreate(BaseModel):
    category_id: uuid.UUID
    location_name: str = Field(min_length=2, max_length=255)
    location_type: str = Field(default="depot", max_length=50)
    quantity_available: int = Field(ge=0)
    quantity_reserved: int = Field(default=0, ge=0)
    quantity_total: int = Field(ge=0)
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


class ResourceCategoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    description: Optional[str] = None
    unit: str
    created_at: datetime


class ResourceInventoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    category_id: uuid.UUID
    location_name: str
    location_type: str
    quantity_available: int
    quantity_reserved: int
    quantity_total: int
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_updated_at: datetime
    created_at: datetime

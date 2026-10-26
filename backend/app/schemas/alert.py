from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
import uuid

from app.models.alert import AlertSource, AlertSeverity


class AlertCreate(BaseModel):
    source: AlertSource = AlertSource.manual
    title: str = Field(min_length=5, max_length=500)
    description: str = Field(min_length=10)
    category: str
    severity: AlertSeverity
    affected_area: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    issuing_authority: Optional[str] = None
    issued_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    source_url: Optional[str] = None
    external_id: Optional[str] = None
    raw_data: Optional[dict] = None


class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[AlertSeverity] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None
    affected_area: Optional[str] = None


class AlertResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    source: AlertSource
    title: str
    description: str
    category: str
    severity: AlertSeverity
    affected_area: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    issuing_authority: Optional[str] = None
    issued_at: datetime
    expires_at: Optional[datetime] = None
    source_url: Optional[str] = None
    is_active: bool
    is_expired: bool
    created_at: datetime
    updated_at: datetime

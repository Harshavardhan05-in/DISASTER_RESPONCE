from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

from app.models.incident import IncidentCategory, IncidentSeverity, IncidentStatus


class IncidentCreate(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=10)
    category: IncidentCategory
    severity: IncidentSeverity = IncidentSeverity.medium
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    address: Optional[str] = None
    district: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    incident_date: Optional[datetime] = None
    reporter_name: Optional[str] = Field(None, max_length=255)
    reporter_contact: Optional[str] = Field(None, max_length=255)
    contact_public: bool = False
    idempotency_key: Optional[str] = Field(None, max_length=128)


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatus
    reason: Optional[str] = None


class EvidenceResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    file_path: str
    file_type: str
    file_size: int
    original_filename: str
    created_at: datetime


class StatusHistoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    old_status: Optional[str] = None
    new_status: str
    reason: Optional[str] = None
    changed_at: datetime


class IncidentResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    reference_number: str
    title: str
    description: str
    category: IncidentCategory
    severity: IncidentSeverity
    status: IncidentStatus
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    reported_at: datetime
    incident_date: Optional[datetime] = None
    reporter_id: Optional[uuid.UUID] = None
    reporter_name: Optional[str] = None
    contact_public: bool
    created_at: datetime
    updated_at: datetime
    evidence: List[EvidenceResponse] = []
    status_history: List[StatusHistoryResponse] = []


class IncidentListResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    reference_number: str
    title: str
    category: IncidentCategory
    severity: IncidentSeverity
    status: IncidentStatus
    district: Optional[str] = None
    state: Optional[str] = None
    reported_at: datetime
    created_at: datetime

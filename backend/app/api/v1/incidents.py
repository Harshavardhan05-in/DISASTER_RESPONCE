from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user, get_optional_current_user, get_current_active_user, require_roles
from app.models.user import User, UserRole
from app.models.incident import IncidentCategory, IncidentSeverity, IncidentStatus
from app.schemas.incident import (
    IncidentCreate, IncidentResponse, IncidentListResponse,
    IncidentStatusUpdate, EvidenceResponse, StatusHistoryResponse
)
from app.services.incident_service import IncidentService
from app.integrations.storage import storage_manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    data: IncidentCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit a disaster report. Can be citizen authenticated or anonymous."""
    service = IncidentService(db)
    return await service.create_report(data, reporter=current_user)


@router.get("", response_model=List[IncidentListResponse])
async def list_incidents(
    category: Optional[IncidentCategory] = None,
    severity: Optional[IncidentSeverity] = None,
    incident_status: Optional[IncidentStatus] = Query(None, alias="status"),
    district: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List incidents with multi-faceted filtering and pagination."""
    service = IncidentService(db)
    items, _ = await service.list_incidents(
        category=category,
        severity=severity,
        status=incident_status,
        district=district,
        page=page,
        page_size=page_size,
    )
    return items


@router.get("/track/{reference_number}", response_model=IncidentResponse)
async def track_incident_by_reference(
    reference_number: str,
    db: AsyncSession = Depends(get_db),
):
    """Public tracking endpoint: Look up an incident by reference number."""
    service = IncidentService(db)
    return await service.get_by_reference(reference_number)


@router.get("/{id}", response_model=IncidentResponse)
async def get_incident(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get full incident report details including status history and evidence."""
    service = IncidentService(db)
    return await service.get_by_id(id)


@router.patch("/{id}/status", response_model=IncidentResponse)
async def update_incident_status(
    id: UUID,
    update: IncidentStatusUpdate,
    current_user: User = Depends(require_roles(
        UserRole.dept_operator,
        UserRole.dept_admin,
        UserRole.platform_admin,
        UserRole.field_responder,
    )),
    db: AsyncSession = Depends(get_db),
):
    """Update incident status. Restricted to authorized responders and operators."""
    service = IncidentService(db)
    return await service.update_status(id, update, actor=current_user)


@router.get("/{id}/history", response_model=List[StatusHistoryResponse])
async def get_incident_history(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get chronological status transitions and action notes for an incident."""
    service = IncidentService(db)
    incident = await service.get_by_id(id)
    return incident.status_history


@router.post("/{id}/evidence", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence(
    id: UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload photo, video, or document evidence attached to an incident report."""
    service = IncidentService(db)
    upload_result = await storage_manager.save_upload(file)
    evidence = await service.add_evidence(
        incident_id=id,
        file_path=upload_result["file_url"],
        file_type=upload_result["file_type"],
        file_size=upload_result["file_size"],
        original_filename=upload_result["original_filename"],
    )
    return evidence

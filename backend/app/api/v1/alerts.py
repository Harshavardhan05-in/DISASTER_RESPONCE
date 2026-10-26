from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.models.alert import AlertSeverity
from app.schemas.alert import AlertCreate, AlertUpdate, AlertResponse
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Official Alerts"])


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    severity: Optional[AlertSeverity] = None,
    state: Optional[str] = None,
    district: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """List active official alerts from IMD, NDMA, State Disaster Management, or manual entries."""
    service = AlertService(db)
    items, _ = await service.list_alerts(
        page=page,
        page_size=page_size,
        severity=severity,
        state=state,
        district=district,
    )
    return items


@router.get("/{id}", response_model=AlertResponse)
async def get_alert(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get single alert details."""
    service = AlertService(db)
    return await service.get_alert(id)


@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    data: AlertCreate,
    current_user: User = Depends(require_roles(UserRole.dept_admin, UserRole.platform_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Publish an official alert. Restricted to administrators."""
    service = AlertService(db)
    return await service.create_alert(data, actor=current_user)


@router.patch("/{id}", response_model=AlertResponse)
async def update_alert(
    id: UUID,
    data: AlertUpdate,
    current_user: User = Depends(require_roles(UserRole.dept_admin, UserRole.platform_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing alert. Restricted to administrators."""
    service = AlertService(db)
    return await service.update_alert(id, data, actor=current_user)

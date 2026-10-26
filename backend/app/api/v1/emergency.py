from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_roles
from app.core.exceptions import NotFoundError
from app.models.user import User, UserRole
from app.models.emergency_service import EmergencyService, ServiceType
from app.schemas.emergency_service import EmergencyServiceCreate, EmergencyServiceResponse

router = APIRouter(prefix="/emergency", tags=["Emergency Services"])


@router.get("/services", response_model=List[EmergencyServiceResponse])
async def list_emergency_services(
    service_type: Optional[ServiceType] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List verified emergency contacts and stations with optional type and location filters."""
    query = select(EmergencyService).where(EmergencyService.is_active == True)
    if service_type:
        query = query.where(EmergencyService.service_type == service_type)
    if district:
        query = query.where(EmergencyService.district.ilike(f"%{district}%"))
    if state:
        query = query.where(EmergencyService.state.ilike(f"%{state}%"))
    if search:
        query = query.where(EmergencyService.name.ilike(f"%{search}%"))

    query = query.order_by(EmergencyService.name.asc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/services/{id}", response_model=EmergencyServiceResponse)
async def get_emergency_service(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get single emergency service entry details."""
    service = await db.get(EmergencyService, id)
    if not service:
        raise NotFoundError("EmergencyService", str(id))
    return service


@router.post("/services", response_model=EmergencyServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_emergency_service(
    data: EmergencyServiceCreate,
    current_user: User = Depends(require_roles(UserRole.dept_admin, UserRole.platform_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Register an emergency service agency or facility. Restricted to administrators."""
    service = EmergencyService(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service

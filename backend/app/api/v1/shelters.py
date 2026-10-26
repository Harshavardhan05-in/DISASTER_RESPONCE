from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_roles
from app.core.exceptions import NotFoundError
from app.models.user import User, UserRole
from app.models.shelter import Shelter, ShelterStatus
from app.schemas.shelter import ShelterCreate, ShelterStatusUpdate, ShelterResponse

router = APIRouter(prefix="/shelters", tags=["Shelters & Evacuation"])


@router.get("", response_model=List[ShelterResponse])
async def list_shelters(
    shelter_status: Optional[ShelterStatus] = Query(None, alias="status"),
    district: Optional[str] = None,
    accessible_only: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """List designated relief shelters with occupancy and accessibility filters."""
    query = select(Shelter).where(Shelter.is_active == True)
    if shelter_status:
        query = query.where(Shelter.status == shelter_status)
    if district:
        query = query.where(Shelter.district.ilike(f"%{district}%"))
    if accessible_only:
        query = query.where(Shelter.is_accessible == True)

    query = query.order_by(Shelter.name.asc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{id}", response_model=ShelterResponse)
async def get_shelter(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get single relief shelter details and capacity."""
    shelter = await db.get(Shelter, id)
    if not shelter:
        raise NotFoundError("Shelter", str(id))
    return shelter


@router.post("", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
async def create_shelter(
    data: ShelterCreate,
    current_user: User = Depends(require_roles(UserRole.dept_admin, UserRole.platform_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Register a new relief shelter. Restricted to administrators."""
    shelter = Shelter(
        **data.model_dump(),
        status=ShelterStatus.open,
        current_occupancy=0,
        is_active=True,
        is_verified=True,
    )
    db.add(shelter)
    await db.commit()
    await db.refresh(shelter)
    return shelter


@router.patch("/{id}/status", response_model=ShelterResponse)
async def update_shelter_status(
    id: UUID,
    data: ShelterStatusUpdate,
    current_user: User = Depends(require_roles(
        UserRole.dept_operator,
        UserRole.dept_admin,
        UserRole.platform_admin,
    )),
    db: AsyncSession = Depends(get_db),
):
    """Update shelter operational status and current occupancy."""
    shelter = await db.get(Shelter, id)
    if not shelter:
        raise NotFoundError("Shelter", str(id))

    shelter.status = data.status
    if data.current_occupancy is not None:
        shelter.current_occupancy = data.current_occupancy

    await db.commit()
    await db.refresh(shelter)
    return shelter

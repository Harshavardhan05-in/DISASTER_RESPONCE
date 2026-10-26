from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError, ConflictError
from app.models.user import User, UserRole
from app.models.volunteer import Volunteer
from app.schemas.volunteer import VolunteerCreate, VolunteerUpdate, VolunteerResponse

router = APIRouter(prefix="/volunteers", tags=["Volunteer Management"])


@router.get("", response_model=List[VolunteerResponse])
async def list_volunteers(
    available_only: bool = False,
    current_user: User = Depends(require_roles(
        UserRole.dept_operator,
        UserRole.dept_admin,
        UserRole.platform_admin,
    )),
    db: AsyncSession = Depends(get_db),
):
    """List registered volunteers with skills and availability (Responders/Admin only)."""
    query = select(Volunteer).where(Volunteer.is_active == True)
    if available_only:
        query = query.where(Volunteer.is_available == True)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/register", response_model=VolunteerResponse, status_code=status.HTTP_201_CREATED)
async def register_volunteer(
    data: VolunteerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register current user as an emergency volunteer."""
    existing = await db.scalar(select(Volunteer).where(Volunteer.user_id == current_user.id))
    if existing:
        raise ConflictError("You are already registered as a volunteer")

    volunteer = Volunteer(
        user_id=current_user.id,
        skills=data.skills or [],
        certifications=data.certifications,
        service_areas=data.service_areas or [],
        is_available=data.is_available,
        availability_notes=data.availability_notes,
        emergency_contact=data.emergency_contact,
        is_verified=False,
        is_active=True,
    )
    db.add(volunteer)
    current_user.role = UserRole.volunteer
    await db.commit()
    await db.refresh(volunteer)
    return volunteer


@router.patch("/me", response_model=VolunteerResponse)
async def update_my_volunteer_status(
    data: VolunteerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user's volunteer availability and skills."""
    volunteer = await db.scalar(select(Volunteer).where(Volunteer.user_id == current_user.id))
    if not volunteer:
        raise NotFoundError("Volunteer profile", "current user")

    update_fields = data.model_dump(exclude_none=True)
    for key, val in update_fields.items():
        setattr(volunteer, key, val)

    await db.commit()
    await db.refresh(volunteer)
    return volunteer

from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user, require_roles
from app.core.exceptions import NotFoundError
from app.models.user import User, UserRole
from app.models.ngo import NGO
from app.schemas.ngo import NGOCreate, NGOResponse

router = APIRouter(prefix="/ngos", tags=["NGO Coordination"])


@router.get("", response_model=List[NGOResponse])
async def list_ngos(
    verified_only: bool = True,
    district: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List disaster relief organizations and humanitarian NGOs."""
    query = select(NGO).where(NGO.is_active == True)
    if verified_only:
        query = query.where(NGO.is_verified == True)
    query = query.order_by(NGO.name.asc())
    result = await db.execute(query)
    ngos = result.scalars().all()

    if district:
        ngos = [ngo for ngo in ngos if not ngo.service_areas or district.lower() in [d.lower() for d in (ngo.service_areas or [])]]

    return ngos


@router.get("/{id}", response_model=NGOResponse)
async def get_ngo(
    id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get single NGO profile."""
    ngo = await db.get(NGO, id)
    if not ngo:
        raise NotFoundError("NGO", str(id))
    return ngo


@router.post("", response_model=NGOResponse, status_code=status.HTTP_201_CREATED)
async def register_ngo(
    data: NGOCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register an NGO partner on the platform."""
    ngo = NGO(
        **data.model_dump(),
        is_verified=False,
        is_active=True,
    )
    db.add(ngo)
    await db.commit()
    await db.refresh(ngo)
    return ngo


@router.patch("/{id}/verify", response_model=NGOResponse)
async def verify_ngo(
    id: UUID,
    current_user: User = Depends(require_roles(UserRole.platform_admin, UserRole.dept_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Approve and verify an NGO partner (admin only)."""
    ngo = await db.get(NGO, id)
    if not ngo:
        raise NotFoundError("NGO", str(id))

    ngo.is_verified = True
    ngo.verified_at = datetime.now(timezone.utc)
    ngo.verified_by_id = current_user.id
    await db.commit()
    await db.refresh(ngo)
    return ngo

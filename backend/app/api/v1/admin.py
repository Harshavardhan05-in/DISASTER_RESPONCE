from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_roles
from app.core.exceptions import NotFoundError
from app.models.user import User, UserRole
from app.models.audit import AuditEvent
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Administration & Audit"])


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(require_roles(UserRole.platform_admin, UserRole.dept_admin)),
    db: AsyncSession = Depends(get_db),
):
    """List system users with role and account state filters."""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    query = query.order_by(User.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/users/{id}/role", response_model=UserResponse)
async def update_user_role(
    id: UUID,
    new_role: UserRole = Query(...),
    current_user: User = Depends(require_roles(UserRole.platform_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Assign or modify user access role (Platform Admin only)."""
    user = await db.get(User, id)
    if not user:
        raise NotFoundError("User", str(id))

    user.role = new_role
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_roles(UserRole.platform_admin, UserRole.auditor)),
    db: AsyncSession = Depends(get_db),
):
    """Read-only audit trail of sensitive administrative actions and status updates."""
    query = (
        select(AuditEvent)
        .order_by(AuditEvent.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    result = await db.execute(query)
    events = result.scalars().all()

    total = await db.scalar(select(func.count(AuditEvent.id))) or 0

    return {
        "items": [
            {
                "id": str(e.id),
                "action": e.action,
                "resource_type": e.resource_type,
                "resource_id": e.resource_id,
                "actor_id": str(e.actor_id) if e.actor_id else None,
                "ip_address": e.ip_address,
                "created_at": e.created_at.isoformat(),
            }
            for e in events
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }

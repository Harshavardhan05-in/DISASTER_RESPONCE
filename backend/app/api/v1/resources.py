from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_roles
from app.core.exceptions import NotFoundError
from app.models.user import User, UserRole
from app.models.resource import ResourceCategory, ResourceInventory
from app.schemas.resource import (
    ResourceCategoryCreate, ResourceCategoryResponse,
    ResourceInventoryCreate, ResourceInventoryResponse
)

router = APIRouter(prefix="/resources", tags=["Relief Inventory & Logistics"])


@router.get("/categories", response_model=List[ResourceCategoryResponse])
async def list_resource_categories(db: AsyncSession = Depends(get_db)):
    """List resource classification categories (Food, Water, Medical, Rescue Equipment, etc.)."""
    result = await db.execute(select(ResourceCategory).order_by(ResourceCategory.name.asc()))
    return result.scalars().all()


@router.post("/categories", response_model=ResourceCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_resource_category(
    data: ResourceCategoryCreate,
    current_user: User = Depends(require_roles(UserRole.dept_admin, UserRole.platform_admin)),
    db: AsyncSession = Depends(get_db),
):
    """Add a relief supply category. Admin only."""
    cat = ResourceCategory(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return cat


@router.get("/inventory", response_model=List[ResourceInventoryResponse])
async def list_inventory(
    district: Optional[str] = None,
    category_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    """List relief supplies across warehouses, depots, and response hubs."""
    query = select(ResourceInventory)
    if district:
        query = query.where(ResourceInventory.district.ilike(f"%{district}%"))
    if category_id:
        query = query.where(ResourceInventory.category_id == category_id)

    query = query.order_by(ResourceInventory.location_name.asc())
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/inventory", response_model=ResourceInventoryResponse, status_code=status.HTTP_201_CREATED)
async def add_inventory(
    data: ResourceInventoryCreate,
    current_user: User = Depends(require_roles(
        UserRole.dept_operator,
        UserRole.dept_admin,
        UserRole.platform_admin,
    )),
    db: AsyncSession = Depends(get_db),
):
    """Record relief inventory batch."""
    inv = ResourceInventory(
        **data.model_dump(),
        last_updated_at=datetime.now(timezone.utc),
    )
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    return inv

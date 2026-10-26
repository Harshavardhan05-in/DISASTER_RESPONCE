from typing import Optional, List, Tuple
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, and_

from app.models.incident import IncidentReport, IncidentStatus, IncidentCategory, IncidentSeverity
from app.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[IncidentReport]):
    def __init__(self, db: AsyncSession):
        super().__init__(IncidentReport, db)

    async def get_by_reference(self, reference_number: str) -> Optional[IncidentReport]:
        result = await self.db.execute(
            select(IncidentReport).where(IncidentReport.reference_number == reference_number)
        )
        return result.scalar_one_or_none()

    async def get_by_idempotency_key(self, key: str) -> Optional[IncidentReport]:
        result = await self.db.execute(
            select(IncidentReport).where(IncidentReport.idempotency_key == key)
        )
        return result.scalar_one_or_none()

    async def list_with_filters(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[IncidentStatus] = None,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        reporter_id: Optional[UUID] = None,
    ) -> Tuple[List[IncidentReport], int]:
        filters = []
        if status:
            filters.append(IncidentReport.status == status)
        if category:
            filters.append(IncidentReport.category == category)
        if severity:
            filters.append(IncidentReport.severity == severity)
        if district:
            filters.append(IncidentReport.district.ilike(f"%{district}%"))
        if state:
            filters.append(IncidentReport.state.ilike(f"%{state}%"))
        if reporter_id:
            filters.append(IncidentReport.reporter_id == reporter_id)

        base_query = select(IncidentReport)
        if filters:
            base_query = base_query.where(and_(*filters))

        count_query = select(func.count()).select_from(base_query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar_one()

        offset = (page - 1) * page_size
        data_query = base_query.order_by(IncidentReport.reported_at.desc()).offset(offset).limit(page_size)
        data_result = await self.db.execute(data_query)
        items = list(data_result.scalars().all())

        return items, total

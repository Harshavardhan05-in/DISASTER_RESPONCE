from typing import Optional, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.models.alert import OfficialAlert, AlertSeverity
from app.repositories.base import BaseRepository


class AlertRepository(BaseRepository[OfficialAlert]):
    def __init__(self, db: AsyncSession):
        super().__init__(OfficialAlert, db)

    async def get_by_external_id(self, external_id: str) -> Optional[OfficialAlert]:
        result = await self.db.execute(
            select(OfficialAlert).where(OfficialAlert.external_id == external_id)
        )
        return result.scalar_one_or_none()

    async def list_active(
        self,
        page: int = 1,
        page_size: int = 20,
        severity: Optional[AlertSeverity] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
    ) -> Tuple[List[OfficialAlert], int]:
        now = datetime.now(timezone.utc)
        filters = [OfficialAlert.is_active == True]

        if severity:
            filters.append(OfficialAlert.severity == severity)
        if state:
            filters.append(OfficialAlert.state.ilike(f"%{state}%"))
        if district:
            filters.append(OfficialAlert.district.ilike(f"%{district}%"))

        base_query = select(OfficialAlert).where(and_(*filters))

        count_result = await self.db.execute(select(func.count()).select_from(base_query.subquery()))
        total = count_result.scalar_one()

        offset = (page - 1) * page_size
        data_result = await self.db.execute(
            base_query.order_by(OfficialAlert.issued_at.desc()).offset(offset).limit(page_size)
        )
        items = list(data_result.scalars().all())

        return items, total

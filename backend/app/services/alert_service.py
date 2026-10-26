from datetime import datetime, timezone
from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, PermissionDeniedError
from app.models.alert import OfficialAlert, AlertSource, AlertSeverity
from app.models.user import User, UserRole
from app.repositories.alert_repo import AlertRepository
from app.schemas.alert import AlertCreate, AlertUpdate

ADMIN_ROLES = [UserRole.dept_admin, UserRole.platform_admin]


class AlertService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AlertRepository(db)

    async def create_alert(self, data: AlertCreate, actor: User) -> OfficialAlert:
        if actor.role not in ADMIN_ROLES:
            raise PermissionDeniedError("Only administrators can create alerts")

        alert = OfficialAlert(
            source=data.source,
            external_id=data.external_id,
            title=data.title,
            description=data.description,
            category=data.category,
            severity=data.severity,
            affected_area=data.affected_area,
            state=data.state,
            district=data.district,
            latitude=data.latitude,
            longitude=data.longitude,
            issuing_authority=data.issuing_authority,
            issued_at=data.issued_at or datetime.now(timezone.utc),
            expires_at=data.expires_at,
            source_url=data.source_url,
            raw_data=data.raw_data,
            is_active=True,
            is_expired=False,
            last_fetched_at=datetime.now(timezone.utc),
        )
        await self.repo.create(alert)
        return alert

    async def update_alert(self, alert_id: UUID, data: AlertUpdate, actor: User) -> OfficialAlert:
        if actor.role not in ADMIN_ROLES:
            raise PermissionDeniedError("Only administrators can update alerts")

        alert = await self.repo.get(alert_id)
        if not alert:
            raise NotFoundError("Alert", str(alert_id))

        update_fields = data.model_dump(exclude_none=True)
        for key, val in update_fields.items():
            setattr(alert, key, val)
        await self.db.flush()
        await self.db.refresh(alert)
        return alert

    async def list_alerts(
        self,
        page: int = 1,
        page_size: int = 20,
        severity: Optional[AlertSeverity] = None,
        state: Optional[str] = None,
        district: Optional[str] = None,
    ) -> Tuple[List[OfficialAlert], int]:
        return await self.repo.list_active(
            page=page,
            page_size=page_size,
            severity=severity,
            state=state,
            district=district,
        )

    async def get_alert(self, alert_id: UUID) -> OfficialAlert:
        alert = await self.repo.get(alert_id)
        if not alert:
            raise NotFoundError("Alert", str(alert_id))
        return alert

import random
import string
from datetime import datetime, timezone
from typing import Optional, Tuple, List
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ConflictError, PermissionDeniedError, ValidationError
from app.models.incident import (
    IncidentReport, IncidentStatus, IncidentStatusHistory, IncidentEvidence,
    IncidentCategory, IncidentSeverity
)
from app.models.user import User, UserRole
from app.repositories.incident_repo import IncidentRepository
from app.schemas.incident import IncidentCreate, IncidentStatusUpdate


VALID_TRANSITIONS = {
    IncidentStatus.draft: [IncidentStatus.submitted],
    IncidentStatus.submitted: [IncidentStatus.pending_review, IncidentStatus.acknowledged, IncidentStatus.rejected],
    IncidentStatus.pending_review: [IncidentStatus.acknowledged, IncidentStatus.rejected],
    IncidentStatus.acknowledged: [IncidentStatus.assigned, IncidentStatus.in_progress, IncidentStatus.rejected],
    IncidentStatus.assigned: [IncidentStatus.in_progress, IncidentStatus.rejected],
    IncidentStatus.in_progress: [IncidentStatus.resolved],
    IncidentStatus.resolved: [IncidentStatus.closed],
    IncidentStatus.closed: [],
    IncidentStatus.rejected: [],
}

OPERATOR_ROLES = [
    UserRole.dept_operator,
    UserRole.dept_admin,
    UserRole.platform_admin,
    UserRole.field_responder,
]


def _generate_reference_number() -> str:
    """Generate a human-readable reference like DR360-2024-AB12C."""
    year = datetime.now(timezone.utc).year
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"DR360-{year}-{suffix}"


class IncidentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = IncidentRepository(db)

    async def create_report(self, data: IncidentCreate, reporter: Optional[User] = None) -> IncidentReport:
        """Create a new incident report with idempotency support."""
        # Check idempotency
        if data.idempotency_key:
            existing = await self.repo.get_by_idempotency_key(data.idempotency_key)
            if existing:
                return existing

        # Generate unique reference number
        for _ in range(10):
            ref = _generate_reference_number()
            if not await self.repo.get_by_reference(ref):
                break

        incident = IncidentReport(
            reference_number=ref,
            title=data.title,
            description=data.description,
            category=data.category,
            severity=data.severity,
            latitude=data.latitude,
            longitude=data.longitude,
            address=data.address,
            district=data.district,
            state=data.state,
            reported_at=datetime.now(timezone.utc),
            incident_date=data.incident_date,
            reporter_id=reporter.id if reporter else None,
            reporter_name=data.reporter_name,
            reporter_contact=data.reporter_contact,
            contact_public=data.contact_public,
            idempotency_key=data.idempotency_key,
            status=IncidentStatus.submitted,
        )
        await self.repo.create(incident)

        # Log initial status
        history = IncidentStatusHistory(
            incident_id=incident.id,
            old_status=None,
            new_status=IncidentStatus.submitted.value,
            changed_by_id=reporter.id if reporter else None,
            reason="Incident submitted",
            changed_at=datetime.now(timezone.utc),
        )
        self.db.add(history)
        await self.db.flush()

        return incident

    async def update_status(
        self,
        incident_id: UUID,
        update: IncidentStatusUpdate,
        actor: User,
    ) -> IncidentReport:
        """Update incident status with role-gating and transition validation."""
        incident = await self.repo.get(incident_id)
        if not incident:
            raise NotFoundError("Incident", str(incident_id))

        # Only operators+ can update status
        if actor.role not in OPERATOR_ROLES and actor.role != UserRole.platform_admin:
            # Citizens can only move draft -> submitted
            if not (actor.id == incident.reporter_id and
                    incident.status == IncidentStatus.draft and
                    update.status == IncidentStatus.submitted):
                raise PermissionDeniedError("Insufficient role to update incident status")

        allowed = VALID_TRANSITIONS.get(incident.status, [])
        if update.status not in allowed:
            raise ValidationError(
                f"Cannot transition from '{incident.status.value}' to '{update.status.value}'. "
                f"Allowed: {[s.value for s in allowed]}"
            )

        old_status = incident.status
        incident.status = update.status
        await self.db.flush()

        history = IncidentStatusHistory(
            incident_id=incident.id,
            old_status=old_status.value,
            new_status=update.status.value,
            changed_by_id=actor.id,
            reason=update.reason,
            changed_at=datetime.now(timezone.utc),
        )
        self.db.add(history)
        await self.db.flush()
        await self.db.refresh(incident)

        return incident

    async def get_incidents(
        self,
        page: int,
        page_size: int,
        actor: Optional[User],
        status: Optional[IncidentStatus] = None,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
    ) -> Tuple[List[IncidentReport], int]:
        """Get incidents with role-based filtering."""
        reporter_id = None
        # Citizens can only see their own reports
        if actor and actor.role == UserRole.citizen:
            reporter_id = actor.id

        return await self.repo.list_with_filters(
            page=page,
            page_size=page_size,
            status=status,
            category=category,
            severity=severity,
            district=district,
            state=state,
            reporter_id=reporter_id,
        )

    async def get_by_reference(self, reference_number: str) -> IncidentReport:
        """Public tracking endpoint — fetch by reference number."""
        incident = await self.repo.get_by_reference(reference_number)
        if not incident:
            raise NotFoundError("Incident", reference_number)
        return incident

    async def get_by_id(self, incident_id: UUID) -> IncidentReport:
        incident = await self.repo.get(incident_id)
        if not incident:
            raise NotFoundError("Incident", str(incident_id))
        return incident

    async def list_incidents(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[IncidentStatus] = None,
        category: Optional[IncidentCategory] = None,
        severity: Optional[IncidentSeverity] = None,
        district: Optional[str] = None,
        state: Optional[str] = None,
        actor: Optional[User] = None,
    ) -> Tuple[List[IncidentReport], int]:
        return await self.get_incidents(
            page=page,
            page_size=page_size,
            actor=actor,
            status=status,
            category=category,
            severity=severity,
            district=district,
            state=state,
        )

    async def add_evidence(
        self,
        incident_id: UUID,
        file_path: str,
        file_type: str,
        file_size: int,
        original_filename: str,
    ) -> IncidentEvidence:
        incident = await self.get_by_id(incident_id)
        evidence = IncidentEvidence(
            incident_id=incident.id,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            original_filename=original_filename,
            created_at=datetime.now(timezone.utc),
        )
        self.db.add(evidence)
        await self.db.commit()
        await self.db.refresh(evidence)
        return evidence

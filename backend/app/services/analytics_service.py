from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.incident import IncidentReport, IncidentCategory, IncidentSeverity, IncidentStatus
from app.models.alert import OfficialAlert
from app.models.user import User
from app.models.shelter import Shelter
from app.models.emergency_service import EmergencyService


class AnalyticsService:
    @staticmethod
    async def get_overview(db: AsyncSession) -> Dict[str, Any]:
        """Aggregate platform metrics for dashboard."""
        total_incidents = await db.scalar(select(func.count(IncidentReport.id))) or 0
        resolved_incidents = await db.scalar(
            select(func.count(IncidentReport.id)).where(IncidentReport.status == IncidentStatus.resolved)
        ) or 0
        active_incidents = await db.scalar(
            select(func.count(IncidentReport.id)).where(
                IncidentReport.status.in_([
                    IncidentStatus.submitted,
                    IncidentStatus.pending_review,
                    IncidentStatus.acknowledged,
                    IncidentStatus.assigned,
                    IncidentStatus.in_progress,
                ])
            )
        ) or 0

        # Incidents by category
        cat_query = select(IncidentReport.category, func.count(IncidentReport.id)).group_by(IncidentReport.category)
        cat_result = await db.execute(cat_query)
        by_category = {str(cat.value if hasattr(cat, 'value') else cat): count for cat, count in cat_result.all()}

        # Incidents by status
        status_query = select(IncidentReport.status, func.count(IncidentReport.id)).group_by(IncidentReport.status)
        status_result = await db.execute(status_query)
        by_status = {str(st.value if hasattr(st, 'value') else st): count for st, count in status_result.all()}

        # Incidents by severity
        sev_query = select(IncidentReport.severity, func.count(IncidentReport.id)).group_by(IncidentReport.severity)
        sev_result = await db.execute(sev_query)
        by_severity = {str(sev.value if hasattr(sev, 'value') else sev): count for sev, count in sev_result.all()}

        # Alerts count
        active_alerts = await db.scalar(
            select(func.count(OfficialAlert.id)).where(OfficialAlert.is_active == True)
        ) or 0

        # Shelters and Services count
        total_shelters = await db.scalar(select(func.count(Shelter.id))) or 0
        total_services = await db.scalar(select(func.count(EmergencyService.id))) or 0
        total_users = await db.scalar(select(func.count(User.id))) or 0

        # Response rate calculation
        resolution_rate = round((resolved_incidents / total_incidents * 100), 1) if total_incidents > 0 else 0.0

        return {
            "total_incidents": total_incidents,
            "active_incidents": active_incidents,
            "resolved_incidents": resolved_incidents,
            "resolution_rate_percent": resolution_rate,
            "active_alerts": active_alerts,
            "total_shelters": total_shelters,
            "total_services": total_services,
            "total_registered_users": total_users,
            "by_category": by_category,
            "by_status": by_status,
            "by_severity": by_severity,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    @staticmethod
    async def get_trends(db: AsyncSession, days: int = 7) -> List[Dict[str, Any]]:
        """Calculate daily incident trends over the last N days."""
        trends = []
        now = datetime.now(timezone.utc)
        for i in range(days - 1, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            q_reported = select(func.count(IncidentReport.id)).where(
                IncidentReport.created_at >= day_start,
                IncidentReport.created_at < day_end
            )
            reported = await db.scalar(q_reported) or 0

            q_resolved = select(func.count(IncidentReport.id)).where(
                IncidentReport.status == IncidentStatus.resolved,
                IncidentReport.updated_at >= day_start,
                IncidentReport.updated_at < day_end
            )
            resolved = await db.scalar(q_resolved) or 0

            trends.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "label": day_start.strftime("%b %d"),
                "reported": reported,
                "resolved": resolved,
            })
        return trends

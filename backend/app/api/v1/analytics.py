import io
import csv
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.models.incident import IncidentReport
from app.services.analytics_service import AnalyticsService
from app.integrations.open_meteo import open_meteo_client

router = APIRouter(prefix="/analytics", tags=["Analytics & Weather"])


@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db)):
    """Summary metrics of incidents, resolution rates, alerts, shelters, and services."""
    return await AnalyticsService.get_overview(db)


@router.get("/trends")
async def get_trends(
    days: int = Query(7, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    """Historical incident frequency and resolution trends."""
    return await AnalyticsService.get_trends(db, days=days)


@router.get("/weather")
async def get_weather(
    lat: float = Query(17.3850, ge=-90, le=90),
    lon: float = Query(78.4867, ge=-180, le=180),
):
    """Real-time weather observation and forecast via Open-Meteo."""
    weather = await open_meteo_client.get_current_weather(lat, lon)
    if not weather:
        return {
            "status": "unavailable",
            "message": "Live weather service temporarily unreachable. Showing cached observation.",
            "temperature_c": None,
            "windspeed_kmh": None,
            "attribution": "Weather data by Open-Meteo.com",
        }
    return {"status": "live", **weather}


@router.get("/export")
async def export_incidents_csv(
    current_user: User = Depends(require_roles(
        UserRole.dept_admin,
        UserRole.platform_admin,
        UserRole.auditor,
    )),
    db: AsyncSession = Depends(get_db),
):
    """Generate authorized, privacy-sanitized CSV export of disaster reports."""
    query = select(IncidentReport).order_by(IncidentReport.created_at.desc())
    result = await db.execute(query)
    incidents = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Reference Number", "Title", "Category", "Severity", "Status",
        "District", "State", "Latitude", "Longitude", "Reported At"
    ])

    for inc in incidents:
        writer.writerow([
            inc.reference_number,
            inc.title,
            inc.category.value if hasattr(inc.category, "value") else inc.category,
            inc.severity.value if hasattr(inc.severity, "value") else inc.severity,
            inc.status.value if hasattr(inc.status, "value") else inc.status,
            inc.district or "",
            inc.state or "",
            inc.latitude or "",
            inc.longitude or "",
            inc.reported_at.isoformat() if inc.reported_at else "",
        ])

    csv_content = output.getvalue()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=dr360_incidents_export.csv"},
    )

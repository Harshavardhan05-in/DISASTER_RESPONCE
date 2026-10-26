from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.emergency import router as emergency_router
from app.api.v1.shelters import router as shelters_router
from app.api.v1.ngos import router as ngos_router
from app.api.v1.volunteers import router as volunteers_router
from app.api.v1.resources import router as resources_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.admin import router as admin_router
from app.api.v1.notifications import router as notifications_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(incidents_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(emergency_router)
api_v1_router.include_router(shelters_router)
api_v1_router.include_router(ngos_router)
api_v1_router.include_router(volunteers_router)
api_v1_router.include_router(resources_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(notifications_router)

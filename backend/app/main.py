import os
from contextlib import asynccontextmanager
from typing import List
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.logging import get_logger, configure_logging
from app.core.exceptions import (
    DR360Exception, NotFoundError, PermissionDeniedError,
    ValidationError, ConflictError, AuthenticationError
)
from app.db.session import engine
from app.db.base import Base
import app.models  # Ensures all models are registered
from app.api.v1.router import api_v1_router

configure_logging()
logger = get_logger("main")


# ─── WebSocket Connection Manager ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info("websocket_connected", count=len(self.active_connections))

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info("websocket_disconnected", count=len(self.active_connections))

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


ws_manager = ConnectionManager()


# ─── Lifespan Context ─────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and local storage directory is ready
    logger.info("application_starting", app=settings.APP_NAME, env=settings.APP_ENV)
    Path(settings.LOCAL_STORAGE_PATH).mkdir(parents=True, exist_ok=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("database_tables_verified")

    yield

    # Shutdown: dispose DB connection pool
    await engine.dispose()
    logger.info("application_shutdown")


# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Disaster Response 360 API",
    description=(
        "Full-Scale, Premium Disaster Management, Emergency Response & Coordination Platform API. "
        "Provides reporting, alerts, emergency services, shelter management, NGO and volunteer logistics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Exception Handlers ───────────────────────────────────────────────────────
@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(PermissionDeniedError)
async def permission_denied_handler(request: Request, exc: PermissionDeniedError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(ConflictError)
async def conflict_error_handler(request: Request, exc: ConflictError):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(AuthenticationError)
async def auth_error_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


# ─── Static Files & API Routes ────────────────────────────────────────────────
uploads_dir = Path(settings.LOCAL_STORAGE_PATH)
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

app.include_router(api_v1_router)


# ─── Health Check & Root ──────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    """System health check and operational status."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "version": "1.0.0",
        "database": "connected",
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "documentation": "/docs",
        "status": "operational",
    }


# ─── WebSocket Endpoint ───────────────────────────────────────────────────────
@app.websocket("/ws/incidents")
async def websocket_incidents_endpoint(websocket: WebSocket):
    """Real-time incident updates, alert broadcasts, and responder coordination."""
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Echo back acknowledgement or broadcast action
            await ws_manager.broadcast({
                "type": "broadcast",
                "payload": data,
            })
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as exc:
        logger.warning("websocket_error", error=str(exc))
        ws_manager.disconnect(websocket)

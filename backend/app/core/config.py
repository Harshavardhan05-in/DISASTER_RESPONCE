from pathlib import Path
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(BASE_DIR / ".env"), ".env", "backend/.env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # App
    APP_NAME: str = "Disaster Response 360"
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database: Supports PostgreSQL (PostGIS) in production / Docker, and SQLite for dev
    DATABASE_URL: str = "sqlite+aiosqlite:///./dr360.db"

    # Security
    SECRET_KEY: str = "94c8651f8a7e02d6b38c1a792e3a1f945a0e9d6c7b8a1f2e3d4c5b6a7b8c9d0e"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Storage
    STORAGE_BACKEND: str = "local"
    LOCAL_STORAGE_PATH: str = "./uploads"
    S3_BUCKET: Optional[str] = None
    S3_REGION: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None

    # Redis
    REDIS_URL: Optional[str] = None

    # Weather
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"

    # Limits
    MAX_UPLOAD_SIZE_MB: int = 50
    MAX_UPLOADS_PER_REPORT: int = 10


settings = Settings()

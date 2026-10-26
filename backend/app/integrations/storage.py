import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.core.config import settings
from app.core.exceptions import ValidationError

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "application/pdf": ".pdf",
}

MAX_FILE_BYTES = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024


class StorageManager:
    def __init__(self):
        self.upload_dir = Path(settings.LOCAL_STORAGE_PATH)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_upload(self, file: UploadFile) -> dict:
        """Validate, sanitize, and save an uploaded file locally."""
        content_type = file.content_type or ""
        if content_type not in ALLOWED_MIME_TYPES:
            raise ValidationError(
                f"Unsupported file type '{content_type}'. Allowed types: JPEG, PNG, WebP, MP4, MOV, PDF"
            )

        contents = await file.read()
        file_size = len(contents)
        if file_size > MAX_FILE_BYTES:
            raise ValidationError(
                f"File size ({file_size / 1024 / 1024:.1f}MB) exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        ext = ALLOWED_MIME_TYPES[content_type]
        unique_name = f"{uuid.uuid4()}{ext}"
        target_path = self.upload_dir / unique_name

        with open(target_path, "wb") as f:
            f.write(contents)

        return {
            "file_path": str(target_path),
            "file_url": f"/uploads/{unique_name}",
            "file_type": content_type,
            "file_size": file_size,
            "original_filename": file.filename or "unknown",
        }


storage_manager = StorageManager()

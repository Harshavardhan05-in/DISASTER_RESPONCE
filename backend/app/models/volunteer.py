import uuid
from typing import Optional

from sqlalchemy import String, Boolean, Text, JSON, ForeignKey
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, BaseModel


class Volunteer(BaseModel, Base):
    __tablename__ = "volunteers"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    skills: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    certifications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    service_areas: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    availability_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])

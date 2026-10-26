from datetime import datetime, timedelta, timezone
from typing import Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_refresh_token,
)
from app.core.exceptions import AuthenticationError, ConflictError
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository
from app.schemas.user import UserCreate, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def register(self, data: UserCreate) -> Tuple[User, TokenResponse]:
        """Register a new user and return tokens."""
        existing = await self.user_repo.get_by_email(data.email)
        if existing:
            raise ConflictError("An account with this email already exists")

        user = User(
            email=data.email.lower(),
            full_name=data.full_name,
            phone=data.phone,
            hashed_password=get_password_hash(data.password),
            role=UserRole.citizen,
            preferred_language=data.preferred_language,
        )
        await self.user_repo.create(user)
        tokens = await self._issue_tokens(user)
        return user, tokens

    async def login(self, email: str, password: str) -> Tuple[User, TokenResponse]:
        """Authenticate a user and return tokens."""
        user = await self.user_repo.get_active_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        # Update last login
        user.last_login_at = datetime.now(timezone.utc)
        await self.db.flush()

        tokens = await self._issue_tokens(user)
        return user, tokens

    async def refresh_tokens(self, refresh_token_plain: str) -> TokenResponse:
        """Exchange a valid refresh token for a new pair."""
        from sqlalchemy import select
        from app.models.user import RefreshToken

        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
            )
        )
        active_tokens = result.scalars().all()

        matched_rt = None
        for rt in active_tokens:
            if verify_refresh_token(refresh_token_plain, rt.token_hash):
                matched_rt = rt
                break

        if not matched_rt:
            raise AuthenticationError("Invalid or expired refresh token")

        # Rotate token — revoke old
        matched_rt.revoked_at = now
        await self.db.flush()

        user = await self.user_repo.get(matched_rt.user_id)
        if not user or not user.is_active:
            raise AuthenticationError("User account not available")

        return await self._issue_tokens(user)

    async def logout(self, refresh_token_plain: str) -> None:
        """Revoke a refresh token."""
        from sqlalchemy import select
        from app.models.user import RefreshToken

        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
            )
        )
        for rt in result.scalars().all():
            if verify_refresh_token(refresh_token_plain, rt.token_hash):
                rt.revoked_at = now
                await self.db.flush()
                return

    async def _issue_tokens(self, user: User) -> TokenResponse:
        """Generate and persist a new access + refresh token pair."""
        access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
        refresh_token_plain = create_refresh_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        token_hash = hash_refresh_token(refresh_token_plain)

        await self.user_repo.create_refresh_token(user.id, token_hash, expires_at)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token_plain,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

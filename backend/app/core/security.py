import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from jose import jwt, JWTError

from app.core.config import settings

# Argon2id password hasher with secure defaults
_ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)


def get_password_hash(password: str) -> str:
    """Hash a password using Argon2id."""
    return _ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against an Argon2id hash."""
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check if the password hash needs to be rehashed (parameters changed)."""
    return _ph.check_needs_rehash(hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token() -> str:
    """Generate a cryptographically secure random refresh token."""
    return secrets.token_urlsafe(64)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and verify a JWT access token. Returns payload or None on failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def hash_refresh_token(token: str) -> str:
    """Hash a refresh token for secure storage (uses Argon2id)."""
    return _ph.hash(token)


def verify_refresh_token(plain_token: str, hashed_token: str) -> bool:
    """Verify a refresh token against its stored hash."""
    try:
        return _ph.verify(hashed_token, plain_token)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.user import UserCreate, LoginRequest, UserResponse, TokenResponse, RefreshRequest, UserUpdate
from app.services.auth_service import AuthService
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account and return JWT access and refresh tokens."""
    service = AuthService(db)
    _, tokens = await service.register(data)
    return tokens


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with email and password to receive access and refresh tokens."""
    service = AuthService(db)
    _, tokens = await service.login(data.email, data.password)
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new token pair."""
    service = AuthService(db)
    return await service.refresh_tokens(data.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Revoke a refresh token on user logout."""
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update profile preferences (name, phone, preferred language)."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.preferred_language is not None:
        current_user.preferred_language = data.preferred_language

    await db.commit()
    await db.refresh(current_user)
    return current_user

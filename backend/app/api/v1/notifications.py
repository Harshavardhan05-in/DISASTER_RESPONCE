from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[Dict[str, Any]])
async def list_notifications(current_user: User = Depends(get_current_user)):
    """List in-app alert notifications for the authenticated user."""
    return [
        {
            "id": "notif-1",
            "title": "Welcome to Disaster Response 360",
            "message": "Your emergency reporting profile is active. Stay safe and monitor local alerts.",
            "category": "system",
            "is_read": True,
            "created_at": current_user.created_at.isoformat() if hasattr(current_user, "created_at") else None,
        }
    ]

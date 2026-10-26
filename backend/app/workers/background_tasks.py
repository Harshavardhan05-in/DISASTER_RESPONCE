import asyncio
from app.core.logging import get_logger

logger = get_logger("workers.background")


async def log_audit_event_task(action: str, resource_type: str, resource_id: str, actor_id: str = None, details: dict = None):
    """Asynchronous background worker task for audit logging."""
    logger.info("audit_event_logged", action=action, resource=resource_type, id=resource_id, actor=actor_id)


async def send_notification_task(recipient_email: str, subject: str, message: str):
    """Simulated notification delivery task with provider status."""
    logger.info("notification_dispatched", recipient=recipient_email, subject=subject)
    await asyncio.sleep(0.05)

from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse


class DR360Exception(Exception):
    """Base exception for Disaster Response 360."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(DR360Exception):
    def __init__(self, resource: str, identifier: str = ""):
        msg = f"{resource} not found"
        if identifier:
            msg = f"{resource} '{identifier}' not found"
        super().__init__(msg, "NOT_FOUND")


class PermissionDeniedError(DR360Exception):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(message, "PERMISSION_DENIED")


class ValidationError(DR360Exception):
    def __init__(self, message: str):
        super().__init__(message, "VALIDATION_ERROR")


class ConflictError(DR360Exception):
    def __init__(self, message: str):
        super().__init__(message, "CONFLICT")


class AuthenticationError(DR360Exception):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, "AUTHENTICATION_FAILED")


class RateLimitError(DR360Exception):
    def __init__(self, message: str = "Too many requests"):
        super().__init__(message, "RATE_LIMIT_EXCEEDED")


# FastAPI exception handlers

async def dr360_exception_handler(request: Request, exc: DR360Exception) -> JSONResponse:
    """Handle all custom DR360 exceptions."""
    status_code_map = {
        "NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "PERMISSION_DENIED": status.HTTP_403_FORBIDDEN,
        "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "CONFLICT": status.HTTP_409_CONFLICT,
        "AUTHENTICATION_FAILED": status.HTTP_401_UNAUTHORIZED,
        "RATE_LIMIT_EXCEEDED": status.HTTP_429_TOO_MANY_REQUESTS,
        "INTERNAL_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
    }
    http_status = status_code_map.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    return JSONResponse(
        status_code=http_status,
        content={"error": exc.code, "message": exc.message},
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions with consistent format."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": "HTTP_ERROR", "message": exc.detail},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unexpected exceptions."""
    import structlog
    log = structlog.get_logger("exceptions")
    log.exception("Unhandled exception", path=request.url.path, exc=str(exc))
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "INTERNAL_ERROR", "message": "An unexpected error occurred"},
    )

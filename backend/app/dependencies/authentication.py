from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.models.admin import Admin

security_bearer = HTTPBearer(auto_error=False)

async def get_current_admin(
    request: Request,
    bearer_auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> Admin:
    """
    Extracts and authenticates the current admin using HttpOnly cookie or Authorization Bearer token.
    Enforces CSRF protection on state-changing requests when cookie authentication is active.
    """
    token: Optional[str] = None
    is_cookie_auth = False

    # 1. Try HttpOnly Cookie
    cookie_token = request.cookies.get(settings.AUTH_COOKIE_NAME)
    if cookie_token:
        token = cookie_token
        is_cookie_auth = True
    elif bearer_auth:
        # Fallback to Authorization Header
        token = bearer_auth.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in as an administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. CSRF Validation for state-changing cookie requests
    if is_cookie_auth and request.method in ("POST", "PUT", "DELETE", "PATCH"):
        csrf_header = request.headers.get("X-CSRF-Token")
        csrf_cookie = request.cookies.get(settings.CSRF_COOKIE_NAME)
        # If CSRF cookie was set, the header must match
        if csrf_cookie and (not csrf_header or csrf_header != csrf_cookie):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token validation failed. State-changing request rejected."
            )

    # 3. Decode JWT
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin_id_str = payload.get("sub")
    if not admin_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session subject is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        admin_id = int(admin_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed session subject.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrator account not found or deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return admin

def get_current_super_admin(
    current_admin: Admin = Depends(get_current_admin)
) -> Admin:
    """Validates that current admin has superadmin / chief role."""
    if current_admin.role not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient administrative privileges."
        )
    return current_admin

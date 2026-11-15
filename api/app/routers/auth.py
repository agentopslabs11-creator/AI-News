from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token, generate_csrf_token,
    check_login_rate_limit, record_failed_login, clear_login_attempts,
    get_password_hash, verify_password
)
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, AdminResponse, TokenResponse, PasswordChangeRequest
from app.services.auth_service import authenticate_admin, log_admin_activity

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Authenticates an administrator using email & password with Argon2.
    Sets HttpOnly authentication cookie and CSRF cookie.
    Enforces rate-limiting against brute force attacks.
    """
    client_ip = request.client.host if request.client else "unknown"
    rate_limit_key = f"{client_ip}:{login_data.email.lower()}"

    if not check_login_rate_limit(rate_limit_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed login attempts. Please wait 5 minutes before trying again."
        )

    admin = authenticate_admin(db, login_data.email, login_data.password)
    if not admin:
        record_failed_login(rate_limit_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    clear_login_attempts(rate_limit_key)

    # Token expiration based on "remember me"
    expire_minutes = (60 * 24 * 7) if login_data.remember_me else settings.ACCESS_TOKEN_EXPIRE_MINUTES
    access_token = create_access_token(
        subject=admin.id,
        expires_delta=timedelta(minutes=expire_minutes)
    )
    csrf_token = generate_csrf_token()

    # Set HttpOnly Cookie for JWT
    max_age = expire_minutes * 60
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.SECURE_COOKIE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age,
        path="/"
    )

    # Set non-HttpOnly CSRF cookie so frontend JavaScript can read it to attach in headers
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=csrf_token,
        httponly=False,
        secure=settings.SECURE_COOKIE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=max_age,
        path="/"
    )

    log_admin_activity(
        db, admin.id, admin.email,
        action="LOGIN_SUCCESS",
        entity_type="admin",
        entity_id=str(admin.id),
        details=f"Admin logged in from {client_ip}",
        ip_address=client_ip
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "csrf_token": csrf_token,
        "admin": admin
    }

@router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Logs out administrator and clears authentication and CSRF cookies."""
    response.delete_cookie(settings.AUTH_COOKIE_NAME, path="/")
    response.delete_cookie(settings.CSRF_COOKIE_NAME, path="/")

    client_ip = request.client.host if request.client else "unknown"
    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="LOGOUT",
        entity_type="admin",
        entity_id=str(current_admin.id),
        details="Admin logged out successfully",
        ip_address=client_ip
    )

    return {"message": "Logged out successfully."}

@router.get("/me", response_model=AdminResponse)
async def get_me(current_admin: Admin = Depends(get_current_admin)):
    """Returns the authenticated admin's profile."""
    return current_admin

@router.post("/change-password")
async def change_password(
    pwd_data: PasswordChangeRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Allows authenticated admin to change their password."""
    if not verify_password(pwd_data.current_password, current_admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )

    current_admin.password_hash = get_password_hash(pwd_data.new_password)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="CHANGE_PASSWORD",
        entity_type="admin",
        entity_id=str(current_admin.id),
        details="Admin changed their password"
    )

    return {"message": "Password updated successfully."}

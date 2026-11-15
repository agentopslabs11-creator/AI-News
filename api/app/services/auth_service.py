from typing import Optional
from sqlalchemy.orm import Session
from app.models.admin import Admin
from app.models.activity_log import AdminActivityLog
from app.core.security import verify_password

def authenticate_admin(db: Session, email: str, password: str) -> Optional[Admin]:
    """Authenticates admin by email and password using Argon2."""
    admin = db.query(Admin).filter(Admin.email == email.strip().lower()).first()
    if not admin or not admin.is_active:
        return None
    if not verify_password(password, admin.password_hash):
        return None
    return admin

def log_admin_activity(
    db: Session,
    admin_id: Optional[int],
    admin_email: Optional[str],
    action: str,
    entity_type: str,
    entity_id: Optional[str] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AdminActivityLog:
    """Logs an administrative action for audit and security tracking."""
    log_entry = AdminActivityLog(
        admin_id=admin_id,
        admin_email=admin_email,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        details=details,
        ip_address=ip_address,
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

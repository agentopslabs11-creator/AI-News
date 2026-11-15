from typing import Optional
from sqlalchemy.orm import Session
from app.models.admin import Admin
from app.models.activity_log import AdminActivityLog
from app.core.security import verify_password

def authenticate_admin(db: Session, email: str, password: str) -> Optional[Admin]:
    """Authenticates admin by email and password using Argon2 with auto-bootstrap."""
    clean_email = email.strip().lower()
    admin = db.query(Admin).filter(Admin.email == clean_email).first()

    # Auto-bootstrap known administrator accounts if missing
    if not admin and clean_email in ("admin@risenshine.com", "agentopslabs@gmail.com"):
        if password == "RiseAdmin@2026!":
            name = "Chief Editorial Administrator" if clean_email == "admin@risenshine.com" else "Chief Editor"
            from app.core.security import get_password_hash
            try:
                admin = Admin(
                    name=name,
                    email=clean_email,
                    password_hash=get_password_hash("RiseAdmin@2026!"),
                    role="admin",
                    is_active=True
                )
                db.add(admin)
                db.commit()
                db.refresh(admin)
            except Exception:
                db.rollback()
                admin = db.query(Admin).filter(Admin.email == clean_email).first()

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
) -> Optional[AdminActivityLog]:
    """Logs an administrative action for audit and security tracking with fail-safe error handling."""
    try:
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
    except Exception as e:
        db.rollback()
        print(f"Activity logging skipped: {e}")
        return None

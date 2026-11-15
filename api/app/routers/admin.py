from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.models.newspaper import NewspaperEdition
from app.models.article import Article
from app.models.video import Video
from app.models.category import Category
from app.models.advertisement import Advertisement
from app.models.activity_log import AdminActivityLog
from app.schemas.activity_log import ActivityLogResponse

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/dashboard")
async def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Returns high-level editorial metrics and recent publishing activities
    for the Rise ’n’ Shine admin dashboard.
    """
    total_published_editions = db.query(NewspaperEdition).filter(NewspaperEdition.status == "published").count()
    en_editions = db.query(NewspaperEdition).filter(NewspaperEdition.status == "published", NewspaperEdition.language == "en").count()
    te_editions = db.query(NewspaperEdition).filter(NewspaperEdition.status == "published", NewspaperEdition.language == "te").count()
    hi_editions = db.query(NewspaperEdition).filter(NewspaperEdition.status == "published", NewspaperEdition.language == "hi").count()
    draft_editions = db.query(NewspaperEdition).filter(NewspaperEdition.status == "draft").count()

    total_articles = db.query(Article).filter(Article.status == "published").count()
    total_videos = db.query(Video).filter(Video.status == "published").count()
    total_categories = db.query(Category).count()
    total_ads = db.query(Advertisement).count()
    active_ads = db.query(Advertisement).filter(Advertisement.is_active == True).count()

    recent_logs = db.query(AdminActivityLog).order_by(desc(AdminActivityLog.created_at)).limit(8).all()

    return {
        "stats": {
            "total_published_editions": total_published_editions,
            "english_editions": en_editions,
            "telugu_editions": te_editions,
            "hindi_editions": hi_editions,
            "draft_editions": draft_editions,
            "total_articles": total_articles,
            "total_videos": total_videos,
            "total_categories": total_categories,
            "total_ads": total_ads,
            "active_advertisements": active_ads,
        },
        "recent_activity": recent_logs,
        "admin": {
            "id": current_admin.id,
            "name": current_admin.name,
            "email": current_admin.email,
            "role": current_admin.role,
        }
    }

@router.get("/activity-logs", response_model=List[ActivityLogResponse])
async def get_activity_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieves security and audit activity logs."""
    return db.query(AdminActivityLog).order_by(desc(AdminActivityLog.created_at)).limit(limit).all()

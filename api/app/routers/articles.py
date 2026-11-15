from datetime import datetime, timezone
import re
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.models.article import Article
from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleListItem
from app.services.auth_service import log_admin_activity

router = APIRouter(prefix="/admin/articles", tags=["Admin Articles"])

def generate_slug(title: str) -> str:
    slug = re.sub(r'[^\w\s-]', '', title.lower().strip())
    slug = re.sub(r'[-\s]+', '-', slug)
    return slug[:250]

@router.post("", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
async def create_article(
    article_in: ArticleCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Creates a new editorial article."""
    # Ensure unique slug
    base_slug = article_in.slug or generate_slug(article_in.title)
    final_slug = base_slug
    counter = 1
    while db.query(Article).filter(Article.slug == final_slug).first():
        final_slug = f"{base_slug}-{counter}"
        counter += 1

    article = Article(
        title=article_in.title,
        slug=final_slug,
        language=article_in.language,
        description=article_in.description,
        content=article_in.content,
        image_url=article_in.image_url,
        category_id=article_in.category_id,
        edition_id=article_in.edition_id,
        status=article_in.status,
        is_breaking=article_in.is_breaking,
        is_featured=article_in.is_featured,
    )
    db.add(article)
    db.commit()
    db.refresh(article)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="CREATE_ARTICLE",
        entity_type="article",
        entity_id=str(article.id),
        details=f"Created article '{article.title}' ({article.language})"
    )

    return article

@router.get("", response_model=List[ArticleListItem])
async def list_admin_articles(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    category_id: Optional[int] = None,
    status: Optional[str] = Query(None, pattern="^(draft|published)$"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Lists articles for admin dashboard."""
    query = db.query(Article)
    if language:
        query = query.filter(Article.language == language)
    if category_id:
        query = query.filter(Article.category_id == category_id)
    if status:
        query = query.filter(Article.status == status)

    return query.order_by(desc(Article.created_at)).all()

@router.get("/{article_id}", response_model=ArticleResponse)
async def get_admin_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieves full article details for editing."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return article

@router.put("/{article_id}", response_model=ArticleResponse)
async def update_article(
    article_id: int,
    update_in: ArticleUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Updates an existing article."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    update_dict = update_in.dict(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(article, field, val)

    article.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(article)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="UPDATE_ARTICLE",
        entity_type="article",
        entity_id=str(article.id),
        details=f"Updated article {article.id} ('{article.title}')"
    )

    return article

@router.delete("/{article_id}")
async def delete_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Permanently deletes an article."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

    title = article.title
    db.delete(article)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="DELETE_ARTICLE",
        entity_type="article",
        entity_id=str(article_id),
        details=f"Deleted article {article_id}: '{title}'"
    )

    return {"message": f"Article '{title}' deleted successfully."}

class BulkDeleteArticlesRequest(BaseModel):
    article_ids: List[int]

@router.post("/bulk-delete")
async def bulk_delete_articles(
    payload: BulkDeleteArticlesRequest,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Bulk permanently deletes multiple articles."""
    if not payload.article_ids:
        return {"deleted_count": 0, "message": "No article IDs provided."}

    deleted_count = db.query(Article).filter(Article.id.in_(payload.article_ids)).delete(synchronize_session=False)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="BULK_DELETE_ARTICLES",
        entity_type="article",
        entity_id="batch",
        details=f"Bulk deleted {deleted_count} articles (IDs: {payload.article_ids})"
    )

    return {"deleted_count": deleted_count, "message": f"{deleted_count} articles deleted successfully."}

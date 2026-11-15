from datetime import date, datetime, timezone
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.config import settings
from app.core.database import get_db
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.models.newspaper import NewspaperEdition
from app.schemas.newspaper import (
    EditionListItem, EditionDetail, EditionUpdate, EditionValidationResponse
)
from app.services.html_processor import HTMLProcessor, HTMLValidationError
from app.services.auth_service import log_admin_activity
from app.services.article_extractor import extract_articles_from_edition

router = APIRouter(prefix="/admin/editions", tags=["Admin Editions"])

@router.post("/validate", response_model=EditionValidationResponse)
async def validate_html_edition(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Pre-validates and tests uploaded newspaper HTML before saving to database.
    Checks file size, UTF-8 encoding, removes dangerous tags, and reports warnings.
    """
    if not file.filename.lower().endswith((".html", ".htm")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid .html or .htm files are permitted for newspaper editions."
        )

    content_bytes = await file.read()
    try:
        sanitized_html, meta = HTMLProcessor.validate_and_sanitize(
            content_bytes,
            max_size_mb=settings.MAX_UPLOAD_SIZE_MB
        )
    except HTMLValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    warning = None
    if meta["external_images_count"] > 0:
        warning = (
            f"Notice: {meta['external_images_count']} external image URLs detected. "
            f"External images must remain accessible at their original source URLs."
        )

    return {
        "valid": True,
        "title": meta.get("title"),
        "headings_count": meta.get("headings_count", 0),
        "sample_headings": meta.get("sample_headings", []),
        "external_images_count": meta.get("external_images_count", 0),
        "content_size_bytes": meta.get("content_size_bytes", len(content_bytes)),
        "sanitized": True,
        "warning": warning
    }

def _parse_bool_flag(val: Any) -> bool:
    if isinstance(val, bool):
        return val
    if isinstance(val, str):
        return val.lower().strip() in ("true", "1", "yes", "on", "confirm")
    return bool(val)

@router.post("/upload", response_model=EditionListItem)
async def upload_newspaper_edition(
    file: UploadFile = File(...),
    title: str = Form(...),
    language: str = Form(..., pattern="^(en|te|hi)$"),
    publication_date: date = Form(...),
    description: Optional[str] = Form(None),
    status_choice: str = Form("published", pattern="^(draft|published)$"),
    confirm_replace: Optional[str] = Form(None),
    auto_replace: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Uploads and stores a daily newspaper edition directly into Neon PostgreSQL.
    Validates UTF-8, sanitizes HTML, enforces unique date+language constraint,
    and supports automatic replacement and update of latest news.
    """
    if not file.filename.lower().endswith((".html", ".htm")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid .html or .htm files are permitted for newspaper editions."
        )

    # Check for existing edition on this date for this language
    existing = db.query(NewspaperEdition).filter(
        NewspaperEdition.language == language,
        NewspaperEdition.publication_date == publication_date
    ).first()

    should_replace = _parse_bool_flag(confirm_replace) or _parse_bool_flag(auto_replace)

    if existing and not should_replace:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": f"An edition for {language.upper()} on {publication_date} already exists ('{existing.title}').",
                "existing_id": existing.id,
                "requires_confirmation": True
            }
        )

    # Read and sanitize HTML
    raw_bytes = await file.read()
    try:
        sanitized_html, meta = HTMLProcessor.validate_and_sanitize(
            raw_bytes,
            max_size_mb=settings.MAX_UPLOAD_SIZE_MB
        )
    except HTMLValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    now = datetime.now(timezone.utc)
    published_time = now if status_choice == "published" else None

    if existing and should_replace:
        # Explicit update / replacement workflow
        existing.title = title
        existing.description = description
        existing.original_filename = file.filename
        existing.html_content = sanitized_html
        existing.content_size = meta["content_size_bytes"]
        existing.status = status_choice
        if status_choice == "published":
            existing.published_at = now
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        edition = existing

        log_admin_activity(
            db, current_admin.id, current_admin.email,
            action="REPLACE_EDITION_HTML",
            entity_type="edition",
            entity_id=str(edition.id),
            details=f"Replaced HTML and updated latest news for edition ID {edition.id} ({language.upper()} - {publication_date})"
        )
    else:
        # Create new edition
        edition = NewspaperEdition(
            title=title,
            language=language,
            publication_date=publication_date,
            description=description,
            original_filename=file.filename,
            html_content=sanitized_html,
            content_size=meta["content_size_bytes"],
            status=status_choice,
            created_by=current_admin.id,
            published_at=published_time
        )
        db.add(edition)
        db.commit()
        db.refresh(edition)

        log_admin_activity(
            db, current_admin.id, current_admin.email,
            action="UPLOAD_EDITION",
            entity_type="edition",
            entity_id=str(edition.id),
            details=f"Uploaded {edition.title} ({language.upper()}, {publication_date}, status: {status_choice})"
        )

    # ── Auto-extract articles when edition is published (deletes previous latest news) ──
    if edition.status == "published":
        try:
            extracted = extract_articles_from_edition(
                edition_id=edition.id,
                html_content=edition.html_content,
                language=edition.language,
                publication_date=edition.publication_date,
                db=db,
                delete_previous_for_language=True
            )
            log_admin_activity(
                db, current_admin.id, current_admin.email,
                action="AUTO_EXTRACT_ARTICLES",
                entity_type="edition",
                entity_id=str(edition.id),
                details=f"Auto-extracted {len(extracted)} latest news articles from edition {edition.id} (previous latest news deleted)"
            )
        except Exception as e:
            # Non-fatal: log but don't fail the upload response
            print(f"[article_extractor] Warning: {e}")

    return edition

@router.post("/{edition_id}/replace-html", response_model=EditionListItem)
async def replace_edition_html(
    edition_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Replaces the HTML content of an existing newspaper edition with newly sanitized HTML.
    """
    edition = db.query(NewspaperEdition).filter(NewspaperEdition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edition not found.")

    if not file.filename.lower().endswith((".html", ".htm")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .html or .htm files are permitted.")

    raw_bytes = await file.read()
    try:
        sanitized_html, meta = HTMLProcessor.validate_and_sanitize(raw_bytes, settings.MAX_UPLOAD_SIZE_MB)
    except HTMLValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    now = datetime.now(timezone.utc)
    edition.html_content = sanitized_html
    edition.original_filename = file.filename
    edition.content_size = meta["content_size_bytes"]
    edition.updated_at = now
    if edition.status == "published":
        edition.published_at = now
    db.commit()
    db.refresh(edition)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="REPLACE_HTML",
        entity_type="edition",
        entity_id=str(edition.id),
        details=f"HTML content replaced for edition {edition.id}"
    )

    # ── Auto-extract articles when HTML is replaced for published edition ────
    if edition.status == "published":
        try:
            extracted = extract_articles_from_edition(
                edition_id=edition.id,
                html_content=edition.html_content,
                language=edition.language,
                publication_date=edition.publication_date,
                db=db,
                delete_previous_for_language=True
            )
            log_admin_activity(
                db, current_admin.id, current_admin.email,
                action="AUTO_EXTRACT_ARTICLES",
                entity_type="edition",
                entity_id=str(edition.id),
                details=f"Auto-extracted {len(extracted)} latest news articles from replaced edition {edition.id} (previous latest news deleted)"
            )
        except Exception as e:
            print(f"[article_extractor] Error on replace-html: {e}")

    return edition

@router.put("/{edition_id}", response_model=EditionListItem)
async def update_edition_metadata(
    edition_id: int,
    update_data: EditionUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Updates metadata (title, description, status) of an existing edition."""
    edition = db.query(NewspaperEdition).filter(NewspaperEdition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edition not found.")

    if update_data.title is not None:
        edition.title = update_data.title
    if update_data.description is not None:
        edition.description = update_data.description
    if update_data.status is not None:
        edition.status = update_data.status
        if update_data.status == "published" and not edition.published_at:
            edition.published_at = datetime.now(timezone.utc)

    edition.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(edition)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="UPDATE_EDITION",
        entity_type="edition",
        entity_id=str(edition.id),
        details=f"Metadata updated for edition {edition.id}"
    )

    return edition

@router.post("/{edition_id}/publish", response_model=EditionListItem)
async def publish_edition(
    edition_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Transitions an edition from draft to published."""
    edition = db.query(NewspaperEdition).filter(NewspaperEdition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edition not found.")

    edition.status = "published"
    edition.published_at = datetime.now(timezone.utc)
    edition.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(edition)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="PUBLISH_EDITION",
        entity_type="edition",
        entity_id=str(edition.id),
        details=f"Published edition {edition.id} ({edition.title})"
    )

    # ── Auto-extract articles on explicit publish ─────────────────────────
    try:
        extracted = extract_articles_from_edition(
            edition_id=edition.id,
            html_content=edition.html_content,
            language=edition.language,
            publication_date=edition.publication_date,
            db=db,
            delete_previous_for_language=True
        )
        log_admin_activity(
            db, current_admin.id, current_admin.email,
            action="AUTO_EXTRACT_ARTICLES",
            entity_type="edition",
            entity_id=str(edition.id),
            details=f"Auto-extracted {len(extracted)} latest news articles from published edition {edition.id} (previous latest news deleted)"
        )
    except Exception as e:
        print(f"[article_extractor] Warning on publish: {e}")

    return edition

@router.post("/{edition_id}/unpublish", response_model=EditionListItem)
async def unpublish_edition(
    edition_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Transitions an edition from published back to draft."""
    edition = db.query(NewspaperEdition).filter(NewspaperEdition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edition not found.")

    edition.status = "draft"
    edition.updated_at = datetime.now(timezone.utc)
    # Also set associated articles to draft so they disappear from public latest news
    db.query(Article).filter(Article.edition_id == edition.id).update({"status": "draft"}, synchronize_session=False)
    db.commit()
    db.refresh(edition)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="UNPUBLISH_EDITION",
        entity_type="edition",
        entity_id=str(edition.id),
        details=f"Unpublished edition {edition.id} ({edition.title})"
    )

    return edition

@router.delete("/{edition_id}")
async def delete_edition(
    edition_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Permanently deletes an edition with confirmation."""
    edition = db.query(NewspaperEdition).filter(NewspaperEdition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edition not found.")

    title_snapshot = edition.title
    # Delete associated articles from database
    db.query(Article).filter(Article.edition_id == edition_id).delete(synchronize_session=False)
    db.delete(edition)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="DELETE_EDITION",
        entity_type="edition",
        entity_id=str(edition_id),
        details=f"Deleted edition {edition_id}: '{title_snapshot}'"
    )

    return {"message": f"Edition '{title_snapshot}' deleted successfully."}

@router.get("", response_model=List[EditionListItem])
async def list_admin_editions(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    status: Optional[str] = Query(None, pattern="^(draft|published|archived)$"),
    publication_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Lists all newspaper editions for management."""
    query = db.query(NewspaperEdition)
    if language:
        query = query.filter(NewspaperEdition.language == language)
    if status:
        query = query.filter(NewspaperEdition.status == status)
    if publication_date:
        query = query.filter(NewspaperEdition.publication_date == publication_date)

    return query.order_by(desc(NewspaperEdition.publication_date), desc(NewspaperEdition.created_at)).all()

@router.get("/{edition_id}", response_model=EditionDetail)
async def get_admin_edition_detail(
    edition_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Retrieves full edition details, including raw sanitized HTML for admin preview."""
    edition = db.query(NewspaperEdition).filter(NewspaperEdition.id == edition_id).first()
    if not edition:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edition not found.")
    return edition

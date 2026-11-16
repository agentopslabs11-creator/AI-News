import os
import re
import base64
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

UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "editions")
os.makedirs(UPLOADS_DIR, exist_ok=True)

@router.post("/validate", response_model=EditionValidationResponse)
async def validate_html_edition(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Pre-validates and tests uploaded newspaper HTML or PDF before saving to database.
    Checks file size, UTF-8 encoding or PDF format, and reports warnings.
    """
    filename_lower = file.filename.lower()
    if not filename_lower.endswith((".html", ".htm", ".pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid .html, .htm, or .pdf files are permitted for newspaper editions."
        )

    content_bytes = await file.read()

    # Handle PDF broadsheets
    if filename_lower.endswith(".pdf"):
        if len(content_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Uploaded PDF file is empty.")
        if not content_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid PDF file format. Missing standard %PDF header.")
        if len(content_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024 * 5:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"PDF size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB * 5} MB.")

        clean_name = file.filename.rsplit(".", 1)[0].replace("-", " ").replace("_", " ").title()
        return {
            "valid": True,
            "title": clean_name,
            "headings_count": 0,
            "sample_headings": ["Official PDF Broadsheet Document"],
            "external_images_count": 0,
            "content_size_bytes": len(content_bytes),
            "sanitized": True,
            "warning": None
        }

    # Handle HTML broadsheets
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

def _generate_pdf_html(title: str, language: str, publication_date: date, original_filename: str, raw_bytes: bytes) -> str:
    b64_pdf = base64.b64encode(raw_bytes).decode("utf-8")
    pdf_data_uri = f"data:application/pdf;base64,{b64_pdf}"
    pdf_stream_url = f"/api/public/editions/{language}/{publication_date}/pdf"

    return f"""<!DOCTYPE html>
<html lang="{language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <style>
    html, body {{
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      background: #f1f5f9;
      overflow-x: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }}
    .pdf-toolbar {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #0f172a;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }}
    .pdf-toolbar a {{
      color: #38bdf8;
      text-decoration: none;
      padding: 5px 12px;
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      transition: background 0.2s;
    }}
    .pdf-toolbar a:hover {{
      background: rgba(255,255,255,0.25);
    }}
    .pdf-container {{
      width: 100%;
      height: calc(100vh - 48px);
      min-height: 850px;
    }}
    object, embed, iframe {{
      width: 100%;
      height: 100%;
      border: 0;
      min-height: 850px;
    }}
  </style>
</head>
<body>
  <div class="pdf-toolbar">
    <span>📄 {title}</span>
    <div style="display:flex;gap:8px;">
      <a href="{pdf_stream_url}" download="{original_filename}">Download PDF ↓</a>
      <a href="{pdf_stream_url}" target="_blank">Open Full Screen ↗</a>
    </div>
  </div>
  <div class="pdf-container">
    <object data="{pdf_data_uri}" type="application/pdf" width="100%" height="100%">
      <embed src="{pdf_data_uri}" type="application/pdf" width="100%" height="100%" />
      <iframe src="{pdf_stream_url}" width="100%" height="100%">
        <p>Your browser does not support inline PDFs. <a href="{pdf_stream_url}" target="_blank">Click here to download and view the broadsheet PDF.</a></p>
      </iframe>
    </object>
  </div>
</body>
</html>"""

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
    Uploads and stores a daily newspaper edition (HTML or PDF) directly into Neon PostgreSQL.
    Enforces unique date+language constraint, supports automatic replacement and update of latest news.
    """
    filename_lower = file.filename.lower()
    if not filename_lower.endswith((".html", ".htm", ".pdf")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only valid .html, .htm, or .pdf files are permitted for newspaper editions."
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

    raw_bytes = await file.read()

    # Process either PDF or HTML
    if filename_lower.endswith(".pdf"):
        if len(raw_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Uploaded PDF file is empty.")
        if not raw_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid PDF file format. Missing %PDF header.")

        # Save PDF to disk
        pdf_filename = f"{language}_{publication_date}.pdf"
        disk_path = os.path.join(UPLOADS_DIR, pdf_filename)
        try:
            with open(disk_path, "wb") as f:
                f.write(raw_bytes)
        except Exception as e:
            print(f"Warning saving PDF to disk: {e}")

        sanitized_html = _generate_pdf_html(title, language, publication_date, file.filename, raw_bytes)
        content_size_val = len(raw_bytes)
    else:
        try:
            sanitized_html, meta = HTMLProcessor.validate_and_sanitize(
                raw_bytes,
                max_size_mb=settings.MAX_UPLOAD_SIZE_MB
            )
            content_size_val = meta["content_size_bytes"]
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
        existing.content_size = content_size_val
        existing.status = status_choice
        if status_choice == "published":
            existing.published_at = now
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        edition = existing

        log_admin_activity(
            db, current_admin.id, current_admin.email,
            action="REPLACE_EDITION_FILE",
            entity_type="edition",
            entity_id=str(edition.id),
            details=f"Replaced broadsheet file and updated latest news for edition ID {edition.id} ({language.upper()} - {publication_date})"
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
            content_size=content_size_val,
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

    # ── Auto-extract articles when HTML edition is published (deletes previous latest news) ──
    if edition.status == "published" and not filename_lower.endswith(".pdf"):
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

    filename_lower = file.filename.lower()
    if not filename_lower.endswith((".html", ".htm", ".pdf")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .html, .htm, or .pdf files are permitted.")

    raw_bytes = await file.read()
    if filename_lower.endswith(".pdf"):
        if len(raw_bytes) == 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Uploaded PDF file is empty.")
        if not raw_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid PDF file format. Missing %PDF header.")

        # Save PDF to disk
        pdf_filename = f"{edition.language}_{edition.publication_date}.pdf"
        disk_path = os.path.join(UPLOADS_DIR, pdf_filename)
        try:
            with open(disk_path, "wb") as f:
                f.write(raw_bytes)
        except Exception as e:
            print(f"Warning saving PDF to disk: {e}")

        sanitized_html = _generate_pdf_html(edition.title, edition.language, edition.publication_date, file.filename, raw_bytes)
        content_size_val = len(raw_bytes)
    else:
        try:
            sanitized_html, meta = HTMLProcessor.validate_and_sanitize(raw_bytes, settings.MAX_UPLOAD_SIZE_MB)
            content_size_val = meta["content_size_bytes"]
        except HTMLValidationError as e:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    now = datetime.now(timezone.utc)
    edition.html_content = sanitized_html
    edition.original_filename = file.filename
    edition.content_size = content_size_val
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

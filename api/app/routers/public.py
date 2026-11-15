from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, or_

from app.core.database import get_db
from app.models.newspaper import NewspaperEdition
from app.models.article import Article
from app.models.video import Video
from app.models.category import Category
from app.schemas.newspaper import EditionListItem, EditionDetail
from app.schemas.article import ArticleResponse, ArticleListItem
from app.schemas.video import VideoResponse
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/public", tags=["Public News & Reader"])

@router.get("/editions", response_model=List[EditionListItem])
async def get_published_editions(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieves published newspaper editions list."""
    query = db.query(NewspaperEdition).filter(NewspaperEdition.status == "published")
    if language:
        query = query.filter(NewspaperEdition.language == language)
    return query.order_by(desc(NewspaperEdition.publication_date)).limit(limit).all()

@router.get("/editions/{language}", response_model=List[EditionListItem])
async def get_language_editions(
    language: str,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retrieves published editions for a specific language."""
    if language not in ("en", "te", "hi"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported language.")

    return db.query(NewspaperEdition).filter(
        NewspaperEdition.status == "published",
        NewspaperEdition.language == language
    ).order_by(desc(NewspaperEdition.publication_date)).limit(limit).all()

@router.get("/editions/{language}/latest", response_model=EditionDetail)
async def get_latest_language_edition(
    language: str,
    db: Session = Depends(get_db)
):
    """Retrieves the most recent published edition with full HTML content for the E-Paper reader."""
    if language not in ("en", "te", "hi"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported language.")

    edition = db.query(NewspaperEdition).filter(
        NewspaperEdition.status == "published",
        NewspaperEdition.language == language
    ).order_by(desc(NewspaperEdition.publication_date)).first()

    if not edition:
        edition = db.query(NewspaperEdition).filter(
            NewspaperEdition.language == language
        ).order_by(desc(NewspaperEdition.publication_date)).first()

    if not edition:
        try:
            import seed_data
            seed_data.seed_database()
            edition = db.query(NewspaperEdition).filter(
                NewspaperEdition.language == language
            ).order_by(desc(NewspaperEdition.publication_date)).first()
        except Exception:
            pass

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No published newspaper edition currently available for {language.upper()}."
        )
    return edition

@router.get("/editions/{language}/{pub_date}", response_model=EditionDetail)
async def get_edition_by_date(
    language: str,
    pub_date: date,
    db: Session = Depends(get_db)
):
    """Retrieves an exact edition for a date and language with full sanitized HTML for e-paper reading."""
    if language not in ("en", "te", "hi"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported language.")

    edition = db.query(NewspaperEdition).filter(
        NewspaperEdition.status == "published",
        NewspaperEdition.language == language,
        NewspaperEdition.publication_date == pub_date
    ).first()

    if not edition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No published edition found for {language.upper()} on {pub_date}."
        )
    return edition

@router.get("/latest-news", response_model=List[ArticleListItem])
async def get_combined_latest_news(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Combined news feed across English, Telugu, and Hindi editions.
    Each item includes language badge and category identifier.
    """
    query = db.query(Article).filter(Article.status == "published")
    if language:
        query = query.filter(Article.language == language)
    results = query.order_by(desc(Article.created_at)).limit(limit).all()
    if not results:
        subquery = db.query(Article)
        if language:
            subquery = subquery.filter(Article.language == language)
        results = subquery.order_by(desc(Article.created_at)).limit(limit).all()
    return results

@router.get("/breaking", response_model=List[ArticleListItem])
async def get_breaking_news(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """Returns breaking news headlines for the top horizontal breaking ticker."""
    query = db.query(Article).filter(
        Article.status == "published",
        Article.is_breaking == True
    )
    if language:
        query = query.filter(Article.language == language)
    
    breaking = query.order_by(desc(Article.created_at)).limit(limit).all()
    # Fallback to recent articles if no explicit breaking stories
    if not breaking:
        subquery = db.query(Article).filter(Article.status == "published")
        if language:
            subquery = subquery.filter(Article.language == language)
        breaking = subquery.order_by(desc(Article.created_at)).limit(5).all()
        
    return breaking

@router.get("/articles", response_model=List[ArticleListItem])
async def get_published_articles(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Returns published articles with pagination and filtering."""
    query = db.query(Article).options(
        joinedload(Article.category),
        joinedload(Article.edition)
    ).filter(Article.status == "published")
    
    if language:
        query = query.filter(Article.language == language)
    if category_slug:
        query = query.join(Article.category).filter(Category.slug == category_slug)
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Article.title.ilike(search_fmt),
                Article.description.ilike(search_fmt),
                Article.content.ilike(search_fmt)
            )
        )

    return query.order_by(desc(Article.created_at)).offset(offset).limit(limit).all()

@router.get("/articles/{slug}", response_model=ArticleResponse)
async def get_article_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """Retrieves full article details by URL slug."""
    article = db.query(Article).options(
        joinedload(Article.category),
        joinedload(Article.edition)
    ).filter(
        Article.slug == slug,
        Article.status == "published"
    ).first()

    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
    return article

@router.get("/videos", response_model=List[VideoResponse])
async def get_published_videos(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Retrieves published YouTube video news entries."""
    query = db.query(Video).filter(Video.status == "published")
    if language:
        query = query.filter(Video.language == language)
    return query.order_by(desc(Video.published_at)).limit(limit).all()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_public_categories(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    db: Session = Depends(get_db)
):
    """Retrieves news categories."""
    query = db.query(Category)
    if language:
        query = query.filter((Category.language == language) | (Category.language.is_(None)))
    return query.order_by(Category.name).all()

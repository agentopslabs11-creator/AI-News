from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.dependencies.authentication import get_current_admin
from app.models.admin import Admin
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.auth_service import log_admin_activity

router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Creates a new news category."""
    existing = db.query(Category).filter(Category.slug == cat_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category with slug '{cat_in.slug}' already exists."
        )

    cat = Category(
        name=cat_in.name,
        slug=cat_in.slug,
        language=cat_in.language
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="CREATE_CATEGORY",
        entity_type="category",
        entity_id=str(cat.id),
        details=f"Created category '{cat.name}'"
    )

    return cat

@router.get("", response_model=List[CategoryResponse])
async def list_admin_categories(
    language: Optional[str] = Query(None, pattern="^(en|te|hi)$"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Lists categories for admin management."""
    query = db.query(Category)
    if language:
        query = query.filter((Category.language == language) | (Category.language.is_(None)))
    return query.order_by(Category.name).all()

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    cat_in: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Updates category name or slug."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    if cat_in.slug and cat_in.slug != cat.slug:
        existing = db.query(Category).filter(Category.slug == cat_in.slug).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already in use.")
        cat.slug = cat_in.slug

    if cat_in.name is not None:
        cat.name = cat_in.name
    if cat_in.language is not None:
        cat.language = cat_in.language

    db.commit()
    db.refresh(cat)

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="UPDATE_CATEGORY",
        entity_type="category",
        entity_id=str(cat.id),
        details=f"Updated category {cat.id} to '{cat.name}'"
    )

    return cat

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Deletes a category."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    name = cat.name
    db.delete(cat)
    db.commit()

    log_admin_activity(
        db, current_admin.id, current_admin.email,
        action="DELETE_CATEGORY",
        entity_type="category",
        entity_id=str(category_id),
        details=f"Deleted category {category_id}: '{name}'"
    )

    return {"message": f"Category '{name}' deleted."}

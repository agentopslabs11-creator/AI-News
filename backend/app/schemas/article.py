from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.category import CategoryResponse
from app.schemas.newspaper import EditionListItem

class ArticleBase(BaseModel):
    title: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=300)
    language: str = Field(..., pattern="^(en|te|hi)$")
    description: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    edition_id: Optional[int] = None
    status: str = Field(default="published", pattern="^(draft|published)$")
    is_breaking: bool = False
    is_featured: bool = False

class ArticleCreate(ArticleBase):
    pass

class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    slug: Optional[str] = Field(None, max_length=300)
    language: Optional[str] = Field(None, pattern="^(en|te|hi)$")
    description: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    edition_id: Optional[int] = None
    status: Optional[str] = Field(None, pattern="^(draft|published)$")
    is_breaking: Optional[bool] = None
    is_featured: Optional[bool] = None

class ArticleResponse(ArticleBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    edition: Optional[EditionListItem] = None

    class Config:
        from_attributes = True

class ArticleListItem(BaseModel):
    id: int
    title: str
    slug: str
    language: str
    description: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    edition_id: Optional[int] = None
    status: str
    is_breaking: bool
    is_featured: bool
    created_at: datetime
    category: Optional[CategoryResponse] = None
    edition: Optional[EditionListItem] = None

    class Config:
        from_attributes = True

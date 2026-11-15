from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class EditionBase(BaseModel):
    title: str = Field(..., max_length=255)
    language: str = Field(..., pattern="^(en|te|hi)$")
    publication_date: date
    description: Optional[str] = None

class EditionCreate(EditionBase):
    status: str = Field(default="draft", pattern="^(draft|published)$")

class EditionUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(draft|published|archived)$")

class EditionListItem(BaseModel):
    id: int
    title: str
    language: str
    publication_date: date
    description: Optional[str] = None
    original_filename: str
    content_size: int
    status: str
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EditionDetail(EditionListItem):
    # Full HTML content stored in Neon PostgreSQL TEXT column
    html_content: str

    class Config:
        from_attributes = True

class EditionValidationResponse(BaseModel):
    valid: bool
    title: Optional[str] = None
    headings_count: int
    sample_headings: List[str]
    external_images_count: int
    content_size_bytes: int
    sanitized: bool
    warning: Optional[str] = None

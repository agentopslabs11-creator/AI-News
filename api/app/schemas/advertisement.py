from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class AdvertisementBase(BaseModel):
    title: str = Field(..., max_length=255)
    image_url: str = Field(..., max_length=4000)
    link_url: Optional[str] = Field(None, max_length=4000)
    side: str = Field(..., pattern="^(left|right)$")
    position: int = Field(1, ge=1, le=5)
    is_active: bool = True

class AdvertisementCreate(AdvertisementBase):
    pass

class AdvertisementUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    image_url: Optional[str] = Field(None, max_length=4000)
    link_url: Optional[str] = Field(None, max_length=4000)
    side: Optional[str] = Field(None, pattern="^(left|right)$")
    position: Optional[int] = Field(None, ge=1, le=5)
    is_active: Optional[bool] = None

class AdvertisementResponse(AdvertisementBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

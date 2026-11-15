import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

YOUTUBE_REGEX = re.compile(
    r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
)

def extract_youtube_id(url: str) -> Optional[str]:
    match = YOUTUBE_REGEX.search(url)
    return match.group(1) if match else None

class VideoBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: Optional[str] = None
    youtube_url: str = Field(..., max_length=2000)
    language: str = Field(..., pattern="^(en|te|hi)$")
    status: str = Field(default="published", pattern="^(draft|published)$")

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube_url(cls, v: str) -> str:
        vid_id = extract_youtube_id(v)
        if not vid_id:
            raise ValueError("Invalid YouTube URL. Please provide a valid YouTube watch or share link.")
        return v

class VideoCreate(VideoBase):
    pass

class VideoUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    youtube_url: Optional[str] = Field(None, max_length=2000)
    language: Optional[str] = Field(None, pattern="^(en|te|hi)$")
    status: Optional[str] = Field(None, pattern="^(draft|published)$")

    @field_validator("youtube_url")
    @classmethod
    def validate_optional_youtube_url(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            vid_id = extract_youtube_id(v)
            if not vid_id:
                raise ValueError("Invalid YouTube URL. Please provide a valid YouTube watch or share link.")
        return v

class VideoResponse(VideoBase):
    id: int
    youtube_video_id: str
    thumbnail_url: Optional[str] = None
    created_at: datetime
    published_at: datetime

    class Config:
        from_attributes = True

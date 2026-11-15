from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.database import Base

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    youtube_url = Column(Text, nullable=False)
    youtube_video_id = Column(String(50), nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    language = Column(String(10), nullable=False, index=True)  # 'en', 'te', 'hi'
    status = Column(String(20), default="published", nullable=False, index=True)  # 'draft', 'published'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

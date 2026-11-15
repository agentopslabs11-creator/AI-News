from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    edition_id = Column(Integer, ForeignKey("newspaper_editions.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(300), unique=True, index=True, nullable=False)
    language = Column(String(10), nullable=False, index=True)  # 'en', 'te', 'hi'
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    image_url = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    status = Column(String(20), default="published", nullable=False, index=True)  # 'draft', 'published'
    is_breaking = Column(Boolean, default=False, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    edition = relationship("NewspaperEdition", back_populates="articles")
    category = relationship("Category", back_populates="articles")

from sqlalchemy import Column, Integer, String, Date, Text, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class NewspaperEdition(Base):
    __tablename__ = "newspaper_editions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    language = Column(String(10), nullable=False, index=True)  # 'en', 'te', 'hi'
    publication_date = Column(Date, nullable=False, index=True)
    description = Column(Text, nullable=True)
    original_filename = Column(String(255), nullable=False)
    
    # CRITICAL: Neon PostgreSQL TEXT column storing sanitized newspaper HTML
    html_content = Column(Text, nullable=False)
    content_size = Column(Integer, default=0, nullable=False)  # Size in bytes
    status = Column(String(20), default="draft", nullable=False, index=True)  # 'draft', 'published', 'archived'
    
    created_by = Column(Integer, ForeignKey("admins.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint('language', 'publication_date', name='uq_edition_language_date'),
    )

    creator = relationship("Admin", back_populates="editions")
    articles = relationship("Article", back_populates="edition", cascade="all, delete-orphan")

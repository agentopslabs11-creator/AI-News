from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), unique=True, index=True, nullable=False)
    language = Column(String(10), nullable=True, index=True)  # Nullable for language-agnostic/shared categories
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    articles = relationship("Article", back_populates="category")

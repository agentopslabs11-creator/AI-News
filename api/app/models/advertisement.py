from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, func
from app.core.database import Base

class Advertisement(Base):
    __tablename__ = "advertisements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image_url = Column(Text, nullable=False)
    link_url = Column(Text, nullable=True)
    side = Column(String(10), nullable=False)  # 'left' or 'right'
    position = Column(Integer, default=1, nullable=False)  # 1, 2, or 3
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

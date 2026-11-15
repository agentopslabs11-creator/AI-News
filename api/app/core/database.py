import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Engine configuration
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args=connect_args
    )
else:
    # Use NullPool in Vercel Serverless environment to prevent connection pool starvation
    if os.environ.get("VERCEL"):
        from sqlalchemy.pool import NullPool
        engine = create_engine(
            settings.DATABASE_URL,
            poolclass=NullPool,
            pool_pre_ping=True,
        )
    else:
        # Neon PostgreSQL connection pool
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            pool_recycle=1800,  # 30 min recycle for Neon serverless
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency that yields a database session and closes it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

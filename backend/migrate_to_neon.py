"""
migrate_to_neon.py
------------------
Copies all data from local SQLite database to Neon PostgreSQL.
Run once from your backend folder:
    python migrate_to_neon.py
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv('.env')

NEON_URL = input("Paste your Neon PostgreSQL connection string: ").strip()
if not NEON_URL.startswith("postgresql"):
    print("❌ Invalid Neon URL. Must start with 'postgresql://'")
    sys.exit(1)

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Source: local SQLite
sqlite_engine = create_engine("sqlite:///./risenshine.db", connect_args={"check_same_thread": False})
SqliteSession = sessionmaker(bind=sqlite_engine)

# Target: Neon PostgreSQL
neon_engine = create_engine(NEON_URL, pool_pre_ping=True)
NeonSession = sessionmaker(bind=neon_engine)

# Create all tables in Neon
from app.core.database import Base
import app.models  # register all models
Base.metadata.create_all(bind=neon_engine)
print("✅ Tables created in Neon")

# Migrate each table
from app.models.user import User
from app.models.newspaper import NewspaperEdition
from app.models.article import Article
from app.models.category import Category
from app.models.video import Video
from app.models.advertisement import Advertisement

sqlite_db = SqliteSession()
neon_db = NeonSession()

MODELS = [User, Category, NewspaperEdition, Article, Video, Advertisement]

for Model in MODELS:
    table = Model.__tablename__
    rows = sqlite_db.query(Model).all()
    count = 0
    for row in rows:
        # Check if row already exists in Neon
        existing = neon_db.query(Model).filter(Model.id == row.id).first()
        if existing:
            continue
        # Detach from SQLite session and add to Neon session
        neon_db.expunge_all() if False else None
        obj_data = {c.name: getattr(row, c.name) for c in Model.__table__.columns}
        new_obj = Model(**obj_data)
        neon_db.merge(new_obj)
        count += 1
    neon_db.commit()
    print(f"✅ {table}: migrated {count} rows")

sqlite_db.close()
neon_db.close()
print("\n🎉 Migration complete! Your Neon database is ready.")

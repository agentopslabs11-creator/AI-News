"""
migrate_sqlite_to_neon.py  -  One-shot migration: SQLite to Neon PostgreSQL
Run from: e:\\AI News\\backend
Command:  python migrate_sqlite_to_neon.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

SQLITE_URL = "sqlite:///./risenshine.db"
NEON_URL = (
    "postgresql+psycopg2://neondb_owner:npg_BHucyAJ6TOq7"
    "@ep-solitary-surf-bdld8lf9-pooler.c-8.us-east-2.aws.neon.tech"
    "/neondb?sslmode=require&channel_binding=require"
)

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Source: local SQLite
sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SqliteSession = sessionmaker(bind=sqlite_engine)

# Target: Neon PostgreSQL
neon_engine = create_engine(NEON_URL, pool_pre_ping=True)
NeonSession = sessionmaker(bind=neon_engine)

# Register all models and create tables
from app.core.database import Base
import app.models  # noqa – registers all models

print("Creating tables in Neon...")
Base.metadata.create_all(bind=neon_engine)
print("  Tables ready\n")

# Import concrete model classes (FK-safe order)
from app.models.admin         import Admin
from app.models.category      import Category
from app.models.newspaper     import NewspaperEdition
from app.models.article       import Article
from app.models.video         import Video
from app.models.advertisement import Advertisement
from app.models.activity_log  import AdminActivityLog

MODELS = [Admin, Category, NewspaperEdition, Article, Video, Advertisement, AdminActivityLog]

sqlite_db = SqliteSession()
neon_db   = NeonSession()

for Model in MODELS:
    table = Model.__tablename__
    rows = sqlite_db.query(Model).all()
    if not rows:
        print(f"  SKIP {table}: 0 rows")
        continue

    migrated = 0
    for row in rows:
        data = {c.name: getattr(row, c.name) for c in Model.__table__.columns}
        neon_db.merge(Model(**data))
        migrated += 1

    neon_db.commit()
    print(f"  OK   {table}: {migrated} row(s) migrated")

# Reset PG sequences to avoid PK collisions on new inserts
print("\nResetting PostgreSQL sequences...")
with neon_engine.begin() as conn:
    for Model in MODELS:
        tbl = Model.__tablename__
        try:
            conn.execute(text(
                f"SELECT setval(pg_get_serial_sequence('{tbl}','id'), "
                f"COALESCE((SELECT MAX(id) FROM \"{tbl}\"), 1), true)"
            ))
            print(f"  OK   {tbl} sequence reset")
        except Exception as e:
            print(f"  WARN {tbl} sequence: {e}")

sqlite_db.close()
neon_db.close()
print("\nMigration complete! Neon PostgreSQL is ready.")

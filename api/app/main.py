from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
import app.models  # Ensures all SQLAlchemy models are registered
from app.routers import (
    auth_router,
    public_router,
    admin_router,
    editions_router,
    articles_router,
    categories_router,
    videos_router,
    archive_router,
    advertisements_router,
)

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Table creation warning: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Rise ’n’ Shine – The AI Newspaper",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://rise-n-shine.vercel.app",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers (Both with and without /api prefix for seamless Vercel Serverless routing)
routers = [
    auth_router,
    public_router,
    admin_router,
    editions_router,
    articles_router,
    categories_router,
    videos_router,
    archive_router,
    advertisements_router,
]
for r in routers:
    app.include_router(r, prefix="/api")
    app.include_router(r)

@app.on_event("startup")
def bootstrap_database():
    """Ensures database has initial administrators ready upon deployment."""
    try:
        from app.models.admin import Admin
        from app.core.security import get_password_hash
        db = SessionLocal()
        
        # 1. Default system admin
        default_admin = db.query(Admin).filter(Admin.email == settings.INITIAL_ADMIN_EMAIL.lower()).first()
        if not default_admin:
            db.add(Admin(
                name=settings.INITIAL_ADMIN_NAME,
                email=settings.INITIAL_ADMIN_EMAIL.lower(),
                password_hash=get_password_hash(settings.INITIAL_ADMIN_PASSWORD),
                role="superadmin",
                is_active=True
            ))
            db.commit()

        # 2. Staff admin: agentopslabs@gmail.com
        ops_admin = db.query(Admin).filter(Admin.email == "agentopslabs@gmail.com").first()
        if not ops_admin:
            db.add(Admin(
                name="Chief Editor",
                email="agentopslabs@gmail.com",
                password_hash=get_password_hash("RiseAdmin@2026!"),
                role="superadmin",
                is_active=True
            ))
            db.commit()
        db.close()
    except Exception as e:
        print(f"Database bootstrap notice: {e}")

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    db_connected = False
    db_type = "unknown"
    admin_count = 0
    try:
        db = SessionLocal()
        db_type = "postgresql" if "postgresql" in str(engine.url) else "sqlite"
        from app.models.admin import Admin
        admin_count = db.query(Admin).count()
        db_connected = True
        db.close()
    except Exception as e:
        db_type = f"error: {str(e)[:100]}"

    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "database_connected": db_connected,
        "database_type": db_type,
        "admin_accounts_ready": admin_count
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Rise ’n’ Shine – The AI Newspaper API is active.",
        "documentation": "/api/docs"
    }

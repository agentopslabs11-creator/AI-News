import os
import sys
import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, SessionLocal
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

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for Rise ’n’ Shine – The AI Newspaper",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Global exception handler so unexpected errors are returned cleanly as JSON with details
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    print(f"Unhandled server error on {request.url.path}: {exc}\n{error_trace}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal Server Error: {str(exc)}",
            "path": request.url.path,
            "type": type(exc).__name__
        }
    )

# CORS configuration supporting all local and deployed origins with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",
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
async def on_startup():
    """Ensure database schema is ready and seed fixtures exist on startup."""
    try:
        from app.core.database import Base, engine, SessionLocal
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        from app.models.admin import Admin
        from app.models.newspaper import NewspaperEdition
        if db.query(Admin).count() == 0 or db.query(NewspaperEdition).count() == 0:
            import seed_data
            seed_data.seed_database()
        db.close()
    except Exception as e:
        print(f"Startup database check: {e}")

@app.get("/", tags=["Health"])
@app.get("/api", tags=["Health"])
@app.get("/api/", tags=["Health"])
def root_api():
    return {"status": "online", "message": "Rise 'n' Shine API", "database": "postgresql"}

@app.get("/health", tags=["Health"])
@app.get("/health/", tags=["Health"])
@app.get("/api/health", tags=["Health"])
@app.get("/api/health/", tags=["Health"])
async def health_check():
    """Live diagnostic endpoint verifying database connectivity and admin accounts."""
    db_connected = False
    db_type = "unknown"
    admin_count = 0
    error_detail = None
    try:
        from sqlalchemy import text
        from app.core.database import engine, SessionLocal
        # Fast connection test
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_type = "postgresql" if "postgresql" in str(engine.url) else "sqlite"
        db_connected = True

        db = SessionLocal()
        from app.models.admin import Admin
        from app.models.newspaper import NewspaperEdition
        try:
            admin_count = db.query(Admin).count()
        except Exception:
            # If tables are missing on cold start, initialize them
            from app.core.database import Base
            Base.metadata.create_all(bind=engine)
            import seed_data
            seed_data.seed_database()
            admin_count = db.query(Admin).count()

        if admin_count == 0 or db.query(NewspaperEdition).count() == 0:
            import seed_data
            seed_data.seed_database()
            admin_count = db.query(Admin).count()
        db.close()
    except Exception as e:
        error_detail = str(e)
        db_type = f"error: {str(e)[:120]}"

    return {
        "status": "online",
        "api_status": "healthy",
        "platform": settings.PROJECT_NAME,
        "database_connected": db_connected,
        "database_type": db_type,
        "admin_accounts_ready": admin_count,
        "error": error_detail
    }

@app.get("/debug", tags=["Health"])
@app.get("/api/debug", tags=["Health"])
async def debug_endpoint():
    """Detailed diagnostic endpoint for troubleshooting Vercel deployment."""
    report = {
        "python_version": sys.version,
        "database_url_prefix": str(settings.DATABASE_URL)[:35] + "...",
        "is_vercel": bool(os.environ.get("VERCEL")),
        "env_keys": [k for k in os.environ.keys() if any(w in k for w in ["DATA", "POSTGRES", "VERCEL", "SECRET"])]
    }
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            val = conn.execute(text("SELECT 1")).scalar()
            report["db_ping"] = "success" if val == 1 else "unexpected"
    except Exception as e:
        report["db_ping_error"] = str(e)
        report["traceback"] = traceback.format_exc()
    return report

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Rise ’n’ Shine – The AI Newspaper API is active.",
        "documentation": "/api/docs"
    }

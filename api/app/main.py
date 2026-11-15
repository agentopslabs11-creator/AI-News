from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
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
Base.metadata.create_all(bind=engine)

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
        "*"  # In development, allows testing across local network
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

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "platform": settings.PROJECT_NAME,
        "database_connected": True
    }

@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Rise ’n’ Shine – The AI Newspaper API is active.",
        "documentation": "/api/docs"
    }

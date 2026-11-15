import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

NEON_DEFAULT_URL = "postgresql+psycopg2://neondb_owner:npg_BHucyAJ6TOq7@ep-solitary-surf-bdld8lf9-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require"

class Settings(BaseSettings):
    PROJECT_NAME: str = "Rise ’n’ Shine – The AI Newspaper"
    API_V1_STR: str = "/api"
    
    # Database - defaults to production Neon PostgreSQL so Vercel never crashes on read-only sqlite
    DATABASE_URL: str = Field(
        default_factory=lambda: (
            os.environ.get("DATABASE_URL")
            or os.environ.get("POSTGRES_URL")
            or os.environ.get("POSTGRES_PRISMA_URL")
            or os.environ.get("POSTGRES_URL_NON_POOLING")
            or NEON_DEFAULT_URL
        ),
        description="Neon PostgreSQL connection string or SQLite local fallback"
    )
    
    # Security & JWT
    SECRET_KEY: str = Field(
        default="rise-n-shine-super-secure-editorial-jwt-key-2026-prod-alpha",
        description="Secret key for signing JWT tokens"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Cookie settings
    AUTH_COOKIE_NAME: str = "risenshine_auth_token"
    CSRF_COOKIE_NAME: str = "risenshine_csrf_token"
    SECURE_COOKIE: bool = False  # Set to True in production (HTTPS)
    COOKIE_SAMESITE: str = "lax"  # "lax", "strict", or "none"
    
    # Publishing Limits
    MAX_UPLOAD_SIZE_MB: int = 5
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:4173",
        "https://rise-n-shine.vercel.app",
        "*"
    ]
    
    # Default initial admin
    INITIAL_ADMIN_EMAIL: str = "admin@risenshine.com"
    INITIAL_ADMIN_PASSWORD: str = "RiseAdmin@2026!"
    INITIAL_ADMIN_NAME: str = "Chief Editorial Administrator"
    
    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: Union[str, None]) -> str:
        if not v or v.strip() == "" or v == "sqlite:///./risenshine.db":
            v = (
                os.environ.get("DATABASE_URL")
                or os.environ.get("POSTGRES_URL")
                or os.environ.get("POSTGRES_PRISMA_URL")
                or os.environ.get("POSTGRES_URL_NON_POOLING")
                or NEON_DEFAULT_URL
            )
        # Strip any quotes that might be accidentally pasted in Vercel UI
        v = v.strip("\"' ")
        # Neon and Render often provide 'postgres://' which SQLAlchemy 2.0 deprecates
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+psycopg2://", 1)
        elif v.startswith("postgresql://") and not v.startswith("postgresql+psycopg2://"):
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
        # Ensure sslmode=require is set for remote PostgreSQL
        if "postgresql" in v and "sslmode" not in v:
            delimiter = "&" if "?" in v else "?"
            v = f"{v}{delimiter}sslmode=require"
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

from app.routers.auth import router as auth_router
from app.routers.public import router as public_router
from app.routers.admin import router as admin_router
from app.routers.editions import router as editions_router
from app.routers.articles import router as articles_router
from app.routers.categories import router as categories_router
from app.routers.videos import router as videos_router
from app.routers.archive import router as archive_router
from app.routers.advertisements import router as advertisements_router

__all__ = [
    "auth_router",
    "public_router",
    "admin_router",
    "editions_router",
    "articles_router",
    "categories_router",
    "videos_router",
    "archive_router",
    "advertisements_router",
]

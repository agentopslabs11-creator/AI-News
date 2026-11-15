import os
import sys

# Ensure api directory is the primary search path so 'import app...' works identically in Vercel Serverless
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from app.main import app

# Export both 'app' and 'handler' for Vercel Serverless ASGI runtime
handler = app
__all__ = ["app", "handler"]

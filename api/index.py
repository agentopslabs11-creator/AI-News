import os
import sys

# Ensure api directory and root directory are in sys.path for Vercel Serverless Function
api_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(api_dir)

if api_dir not in sys.path:
    sys.path.insert(0, api_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Import the FastAPI application
from app.main import app

# Export app for Vercel Python runtime
__all__ = ["app"]

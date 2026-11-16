import os
import sys
import traceback

# Ensure api directory is the primary search path so 'import app...' works identically in Vercel Serverless
api_dir = os.path.dirname(os.path.abspath(__file__))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

try:
    from app.main import app
    handler = app
except Exception as e:
    import json
    err_str = str(e)
    err_trace = traceback.format_exc()
    print(f"FATAL EXCEPTION importing app.main in api/index.py: {err_str}\n{err_trace}", file=sys.stderr)

    async def fallback_handler(scope, receive, send):
        if scope.get("type") == "http":
            body = json.dumps({
                "status": "error",
                "api_status": "offline",
                "detail": f"Application initialization error: {err_str}",
                "trace": err_trace.splitlines()[-5:] if err_trace else []
            }).encode("utf-8")
            await send({
                "type": "http.response.start",
                "status": 500,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode("utf-8")),
                    (b"access-control-allow-origin", b"*"),
                ]
            })
            await send({
                "type": "http.response.body",
                "body": body,
            })

    app = fallback_handler
    handler = fallback_handler

__all__ = ["app", "handler"]

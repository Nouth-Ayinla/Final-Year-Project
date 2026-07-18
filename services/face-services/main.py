from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import datetime
import uuid

from app.api.routes.face import router as face_router
from app.api.routes.health import router as health_router
from app.api.routes.liveness import router as liveness_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_EXCEPTION",
                "message": exc.detail,
                "details": [],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "traceId": str(uuid.uuid4())
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    details = []
    for error in exc.errors():
        details.append({
            "field": ".".join(map(str, error.get("loc", []))),
            "issue": error.get("type", "").upper(),
            "message": error.get("msg", "")
        })
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Validation error",
                "details": details,
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "traceId": str(uuid.uuid4())
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled server error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred on the server.",
                "details": [],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                "traceId": str(uuid.uuid4())
            }
        }
    )

app.include_router(health_router)
app.include_router(face_router, prefix=settings.api_prefix)
app.include_router(liveness_router, prefix=settings.api_prefix)

from fastapi import FastAPI

from app.api.routes.face import router as face_router
from app.api.routes.health import router as health_router
from app.api.routes.liveness import router as liveness_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

# app.include_router(health_router)
app.include_router(face_router, prefix=settings.api_prefix)
# app.include_router(liveness_router, prefix=settings.api_prefix)

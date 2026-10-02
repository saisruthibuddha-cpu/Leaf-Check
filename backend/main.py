from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from backend.config import settings
from backend.api.router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agricultural AI Platform combining Computer Vision Leaf Diagnostics, ESP32 IoT Soil Telemetry, and Multilingual Guidance.",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# =========================================================================
# CORS Middleware Configuration
# =========================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================================
# Custom Validation Error Handler
# =========================================================================
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid parameter")
        errors.append({"field": field, "message": msg})

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "status": "error",
            "error_type": "ValidationError",
            "detail": errors,
            "message": "Input validation failed. Please review the supplied parameters."
        }
    )

# =========================================================================
# Startup Event: Ensure Database Schema Exists
# =========================================================================
@app.on_event("startup")
async def on_startup():
    import os
    from database.db import engine
    from database.models.db_models import Base
    os.makedirs("./database", exist_ok=True)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[Main Startup] Database setup notice: {e}")

# =========================================================================
# Register API Router
# =========================================================================
app.include_router(api_router)

# =========================================================================
# System Health & Root Endpoints
# =========================================================================
@app.get("/", tags=["Health & Status"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "endpoints": {
            "docs": "/docs",
            "analyze_plant": "POST /api/analyze-plant",
            "sensors_data": "POST /api/sensors/data",
            "sensors_latest": "GET /api/sensors/latest",
            "soil_health": "GET /api/soil/health",
            "recommendations": "GET /api/recommendations",
            "recommendations_evaluate": "POST /api/recommendations/evaluate",
            "recommendations_fused": "GET /api/recommendations/fused",
            "crops": "GET /api/crops",
            "assistant_ask": "POST /api/assistant/ask"
        }
    }

@app.get("/health", tags=["Health & Status"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "api_gateway": "active",
        "iot_ingestion": "ready",
        "ai_engine": "mock_ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

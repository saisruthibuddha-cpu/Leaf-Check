from fastapi import APIRouter
from backend.api.v1.endpoints import sensors, plant, recommendations

api_router = APIRouter()

api_router.include_router(sensors.router, prefix="/sensors", tags=["Soil Sensors & Telemetry"])
api_router.include_router(plant.router, prefix="/plant", tags=["Plant Diagnostics & AI Vision"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["AI Recommendations"])

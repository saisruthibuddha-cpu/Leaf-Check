from fastapi import APIRouter, HTTPException, status
from backend.models.sensor import SensorIngestRequest, SensorReadingResponse

router = APIRouter()

@router.post("/ingest", status_code=status.HTTP201_CREATED)
async def ingest_sensor_data(payload: SensorIngestRequest):
    """
    Ingest real-time soil telemetry from ESP32 edge node.
    """
    # Architecture shell placeholder for Phase 4 & Phase 6
    return {"status": "success", "device_id": payload.device_id, "message": "Telemetry received"}

@router.get("/{device_id}/latest")
async def get_latest_sensor_data(device_id: str):
    """
    Retrieve latest recorded telemetry for a given sensor device node.
    """
    return {
        "device_id": device_id,
        "moisture": 45.2,
        "temperature": 24.5,
        "ph": 6.8,
        "npk": {"nitrogen": 120.0, "phosphorus": 45.0, "potassium": 180.0},
        "timestamp": "2026-09-16T19:00:00Z",
        "status": "active"
    }

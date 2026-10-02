from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, Dict, Any

class SensorReadingCreate(BaseModel):
    """
    Incoming ESP32 / IoT Sensor Telemetry Payload.
    Strictly validated for sensible agricultural boundaries.
    """
    device_id: str = Field(..., min_length=3, max_length=64, description="ESP32 hardware node identifier (e.g. esp32-field-node-01)")
    soil_moisture: float = Field(..., ge=0.0, le=100.0, description="Soil moisture volumetric water content percentage (0 - 100%)")
    soil_temperature: float = Field(..., ge=-150.0, le=100.0, description="Soil temperature in Celsius (supports -127°C DS18B20 fault code)")
    ph: float = Field(..., ge=0.0, le=14.0, description="Soil acidity/alkalinity pH scale (0.0 to 14.0)")
    nitrogen: float = Field(..., ge=0.0, le=1000.0, description="Available Nitrogen content in mg/kg")
    phosphorus: float = Field(..., ge=0.0, le=500.0, description="Available Phosphorus content in mg/kg")
    potassium: float = Field(..., ge=0.0, le=1000.0, description="Available Potassium content in mg/kg")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow, description="Sampling timestamp")

    @field_validator("device_id")
    @classmethod
    def validate_device_id(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("device_id cannot be empty or blank spaces")
        return v.strip()

    @field_validator("ph")
    @classmethod
    def validate_ph(cls, v: float) -> float:
        if v < 3.0 or v > 10.0:
            # Extreme soil pH warning check
            pass
        return round(v, 2)

class SensorReadingResponse(BaseModel):
    device_id: str
    soil_moisture: float
    soil_temperature: float
    ph: float
    nitrogen: float
    phosphorus: float
    potassium: float
    timestamp: datetime
    status: str = "active" # active | offline | warning
    status_summary: Optional[Dict[str, str]] = None
    is_offline: bool = False
    offline_notice: Optional[str] = None
    is_invalid_reading: bool = False
    warning_notice: Optional[str] = None
    sensor_error: Optional[str] = None
    last_updated_formatted: str = "Just now"


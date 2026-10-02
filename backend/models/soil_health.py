from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class ParameterHealthDetail(BaseModel):
    id: str
    name: str
    value: float
    unit: str
    min_healthy: float
    max_healthy: float
    status: str  # optimal, normal, warning_low, warning_high, critical
    status_label: str
    healthy_range_text: str
    description: str

class SoilWarning(BaseModel):
    id: str
    parameter: str
    severity: str
    message: str
    suggested_action: str

class SoilHealthResponse(BaseModel):
    estimated_score: int = Field(..., ge=0, le=100, description="Estimated calculated soil health score (0-100)")
    rating: str = Field(..., description="Excellent | Good | Fair | Poor")
    color: str = Field(..., description="Hex color code associated with score rating")
    parameter_scores: Dict[str, int] = Field(..., description="Calculated sub-scores for each parameter")
    parameters: List[ParameterHealthDetail] = Field(..., description="Detailed status of all evaluated soil sensors")
    warnings: List[SoilWarning] = Field(default_factory=list, description="Active alerts for parameters deviating from target range")
    disclaimer: str = Field(..., description="Mandatory agronomic disclaimer regarding estimated score limitations")
    device_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"
    is_offline: bool = False
    offline_notice: Optional[str] = None
    is_invalid_reading: bool = False
    warning_notice: Optional[str] = None
    sensor_error: Optional[str] = None
    last_updated_formatted: str = "Just now"

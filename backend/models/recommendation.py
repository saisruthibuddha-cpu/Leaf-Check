from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class PlantSoilFusionInput(BaseModel):
    """
    Combined input payload for Phase 9 Intelligent Recommendation Engine.
    Fuses plant disease vision inferences with live physical soil sensor telemetry.
    """
    crop_type: str = Field("Tomato", description="Target crop (Tomato, Potato, Rice, Maize, etc.)")
    disease_prediction: Optional[str] = Field(None, description="Predicted disease name or 'Healthy'")
    disease_confidence: Optional[float] = Field(None, ge=0.0, le=100.0, description="Disease detection confidence percentage (0-100)")
    plant_health_status: Optional[str] = Field("healthy", description="healthy | warning | disease_detected")
    analysis_id: Optional[str] = Field(None, description="Associated plant analysis ID if available")
    
    # Physical Soil Sensor Telemetry (optional: if omitted/null, automatically retrieves latest ESP32 reading)
    soil_moisture: Optional[float] = Field(None, ge=0.0, le=100.0, description="Soil volumetric moisture (% VWC)")
    soil_temperature: Optional[float] = Field(None, ge=-20.0, le=60.0, description="Soil temperature in °C")
    ph: Optional[float] = Field(None, ge=0.0, le=14.0, description="Soil pH level")
    nitrogen: Optional[float] = Field(None, ge=0.0, le=1000.0, description="Available Nitrogen in mg/kg")
    phosphorus: Optional[float] = Field(None, ge=0.0, le=500.0, description="Available Phosphorus in mg/kg")
    potassium: Optional[float] = Field(None, ge=0.0, le=1000.0, description="Available Potassium in mg/kg")
    
    field_id: str = Field("field-north-01", description="Agricultural field sector ID")
    lang: str = Field("en", description="Target language code: en, te, hi, ta, kn, ml")

class FusedRecommendation(BaseModel):
    """
    Phase 9 Fused Agronomic Guidance.
    Explicitly provides:
    - recommendation (Title / core advice)
    - severity (urgent | high | medium | low)
    - reason (Agronomic rationale)
    - suggested_action (General preventive / management guidance)
    - supporting_sensor_values (Key telemetry / confidence factors)
    """
    id: str
    recommendation: str = Field(..., description="Actionable headline recommendation")
    severity: str = Field(..., description="urgent | high | medium | low")
    stress_type: str = Field(..., description="Disease Stress | Water Stress | Nutrient Stress | Soil pH Issue | Environmental Stress | Compound Stress")
    reason: str = Field(..., description="Agronomic reason explaining the condition")
    suggested_action: str = Field(..., description="General preventive or management guidance without unsafe chemical prescriptions")
    supporting_sensor_values: Dict[str, Any] = Field(default_factory=dict, description="Supporting sensor readings and baseline benchmarks")
    actionable_steps: List[str] = Field(default_factory=list, description="Step-by-step practical management actions")
    category: str = Field("Management", description="Irrigation | Nutrition | Soil Care | Plant Health | Climate")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FusedRecommendationResponse(BaseModel):
    """
    Container response returned by Phase 9 Recommendation Engine.
    """
    field_id: str
    crop_type: str
    plant_disease: Optional[str] = None
    disease_confidence: Optional[float] = None
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
    stresses_detected: List[str] = Field(default_factory=list)
    total_count: int
    recommendations: List[FusedRecommendation]
    disclaimer: str = Field(
        "Notice: General preventive and crop management guidance only. Does not contain unsafe pesticide or chemical fertilizer prescriptions. Please consult local agronomic extension experts and conduct lab soil assays before applying chemical inputs.",
        description="Agricultural safety guardrail notice"
    )

# Backward-compatible model for Phase 4 / Phase 8 API endpoints
class Recommendation(BaseModel):
    id: str
    title: str
    category: str = Field(..., description="Irrigation | Fertilizer | Pest Control | Soil Amendment")
    severity: str = Field(..., description="urgent | high | medium | low")
    issue: str
    explanation: str
    actionable_steps: List[str]
    recommendation: Optional[str] = None
    reason: Optional[str] = None
    suggested_action: Optional[str] = None
    supporting_sensor_values: Optional[Dict[str, Any]] = None
    stress_type: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RecommendationListResponse(BaseModel):
    field_id: str
    total_count: int
    recommendations: List[Recommendation]

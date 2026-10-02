from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AssistantQueryRequest(BaseModel):
    """
    Input query payload for Phase 10 Context-Aware AI Assistant.
    Can either supply explicit crop/sensor/diagnosis context or rely on active backend state.
    """
    question: str = Field(..., min_length=2, description="Farmer query in English or Telugu")
    crop_type: Optional[str] = Field("Tomato", description="Selected crop (Tomato, Potato, Rice, Maize)")
    
    # Plant vision diagnosis context
    disease_prediction: Optional[str] = Field(None, description="Detected disease or 'Healthy'")
    disease_confidence: Optional[float] = Field(None, ge=0.0, le=100.0, description="Vision model confidence percentage")
    plant_health_status: Optional[str] = Field(None, description="healthy | warning | disease_detected")
    analysis_explanation: Optional[str] = Field(None, description="Diagnostic visual symptom explanation")
    
    # Soil telemetry context
    soil_moisture: Optional[float] = Field(None, description="Soil moisture (% VWC)")
    soil_temperature: Optional[float] = Field(None, description="Soil temperature (°C)")
    ph: Optional[float] = Field(None, description="Soil pH")
    nitrogen: Optional[float] = Field(None, description="Available Nitrogen (mg/kg)")
    phosphorus: Optional[float] = Field(None, description="Available Phosphorus (mg/kg)")
    potassium: Optional[float] = Field(None, description="Available Potassium (mg/kg)")
    soil_health_score: Optional[int] = Field(None, ge=0, le=100, description="Estimated soil health score (0-100)")
    
    # Additional context
    existing_recommendations: Optional[List[str]] = Field(default_factory=list, description="List of active recommendation titles")
    lang: str = Field("en", description="User language code: 'en' for English, 'te' for Telugu")

class AssistantQueryResponse(BaseModel):
    """
    Structured response from Phase 10 Context-Aware AI Assistant.
    Provides the 4 required analytical explanations + conversational text + safety notices.
    """
    question: str
    lang: str
    crop_type: str
    
    # The 4 required explanation sections
    possible_reason: str = Field(..., description="1. Possible reason explaining the observed condition")
    evidence_from_plant_image: str = Field(..., description="2. Evidence from plant image diagnosis")
    relevant_soil_measurements: str = Field(..., description="3. Relevant physical soil telemetry and health scores")
    recommended_next_step: str = Field(..., description="4. Recommended next step / safe preventive guidance")
    
    # Conversational output combining the points in natural farmer-friendly tone
    full_response: str = Field(..., description="Complete conversational message for chat UI")
    
    # Safety and certainty indicators
    confidence_level: str = Field(
        ...,
        description="High Confidence | Moderate Likelihood | Low Confidence - Consult Agronomist"
    )
    safety_disclaimer: str = Field(
        "Notice: This AI guidance is an advisory estimate based on available sensor and image context. It does not claim diagnostic certainty. Please consult local agricultural extension officers or Krishi Vigyan Kendra before applying chemical treatments.",
        description="Agricultural safety notice"
    )
    
    context_utilized: Dict[str, Any] = Field(default_factory=dict, description="Snapshot of crop, sensor, and vision values evaluated")
    created_at: datetime = Field(default_factory=datetime.utcnow)

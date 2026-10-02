from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class PlantAnalysisResponse(BaseModel):
    analysis_id: str = Field(..., description="Unique analysis record identifier")
    crop_type: str = Field(..., description="Selected crop type (Tomato, Potato, Rice, Maize)")
    health_status: str = Field(..., description="healthy | warning | disease_detected")
    disease: str = Field(..., description="Detected disease name, low-confidence message, or healthy indicator")
    scientific_name: Optional[str] = Field(None, description="Pathogen biological scientific classification")
    confidence: float = Field(..., ge=0.0, le=100.0, description="Model AI estimated confidence percentage")
    explanation: str = Field(..., description="Agronomic visual feature explanation")
    recommended_actions: List[str] = Field(default_factory=list, description="Practical next steps and treatment protocol")
    severity: str = Field(..., description="none | low | moderate | severe")
    image_url: str = Field(..., description="Stored or preview URL of the analyzed leaf image")
    class_probabilities: Optional[Dict[str, float]] = Field(default_factory=dict, description="Distribution of AI prediction confidence across disease classes")
    gradcam_image: Optional[str] = Field(None, description="Base64 encoded Grad-CAM visual heatmap overlay image")
    is_low_confidence: bool = Field(False, description="Flag indicating if model confidence fell below threshold")
    ai_disclaimer: str = Field("AI prediction only. Not a guaranteed agricultural diagnosis.", description="Agricultural AI non-guarantee safety notice")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Analysis completion timestamp")


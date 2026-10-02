import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import UploadFile
from backend.models.plant import PlantAnalysisResponse
from ai.inference.predict import predictor_service

class PlantService:
    """
    Backend service wrapper for Plant Vision Diagnostics.
    Delegates computer vision inference, preprocessing, confidence thresholding,
    and Grad-CAM heatmap generation to the AI inference engine.
    """
    def __init__(self):
        self.predictor = predictor_service

    async def analyze_crop_image(self, image: UploadFile, crop_type: str) -> PlantAnalysisResponse:
        """
        Processes uploaded crop foliage image and crop selection.
        Executes deep learning inference and returns structured diagnostic payload.
        """
        contents = await image.read()
        if len(contents) == 0:
            raise ValueError("Uploaded image file is empty (0 bytes).")

        # Execute PyTorch computer vision inference pipeline
        prediction = self.predictor.predict(contents, crop_type=crop_type)

        if not prediction.get("success", False):
            raise ValueError(prediction.get("error", "Failed to process image with computer vision model."))

        filename = image.filename or "uploaded_leaf.jpg"

        response = PlantAnalysisResponse(
            analysis_id=prediction.get("analysis_id", f"analysis-{uuid.uuid4().hex[:8]}"),
            crop_type=prediction.get("crop_type", crop_type.capitalize()),
            health_status=prediction.get("health_status", "warning"),
            disease=prediction.get("disease", "Unknown"),
            scientific_name=prediction.get("scientific_name"),
            confidence=prediction.get("confidence", 0.0),
            explanation=prediction.get("explanation", ""),
            recommended_actions=prediction.get("recommended_actions", []),
            severity=prediction.get("severity", "none"),
            image_url=f"/static/uploads/{filename}",
            class_probabilities=prediction.get("class_probabilities", {}),
            gradcam_image=prediction.get("gradcam_image"),
            is_low_confidence=prediction.get("is_low_confidence", False),
            ai_disclaimer=prediction.get("ai_disclaimer", "AI prediction only. Not a guaranteed agricultural diagnosis."),
            timestamp=datetime.utcnow()
        )
        self._latest_analysis = response
        return response

    def get_latest_analysis(self) -> Optional[PlantAnalysisResponse]:
        """Returns the most recent plant disease analysis result, if available."""
        return getattr(self, "_latest_analysis", None)

plant_service = PlantService()

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Query
from typing import Optional
from backend.models.plant import PlantAnalysisResponse
from backend.models.sensor import SensorReadingCreate, SensorReadingResponse
from backend.models.soil_health import SoilHealthResponse
from backend.models.recommendation import (
    RecommendationListResponse,
    PlantSoilFusionInput,
    FusedRecommendationResponse
)
from backend.models.crop import CropListResponse
from backend.models.assistant import AssistantQueryRequest, AssistantQueryResponse
from backend.services.plant_service import plant_service
from backend.services.sensor_service import sensor_service
from backend.services.recommendation_service import recommendation_service
from backend.services.crop_service import crop_service
from backend.services.assistant_service import assistant_service

api_router = APIRouter(prefix="/api")

# =========================================================================
# 1. PLANT ANALYSIS ENDPOINT
# =========================================================================
@api_router.post(
    "/analyze-plant",
    response_model=PlantAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Plant Disease from Leaf Image",
    tags=["Plant Vision Analysis"]
)
async def analyze_plant(
    image: UploadFile = File(..., description="Crop leaf photograph (JPG, PNG, WEBP)"),
    crop_type: str = Form(..., description="Crop type (Tomato, Potato, Rice, Maize)")
):
    """
    Accepts a crop leaf image and crop type, executes diagnostic evaluation,
    and returns disease classification, confidence score, and treatment actions.
    """
    try:
        result = await plant_service.analyze_crop_image(image, crop_type)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Plant image analysis encountered an internal error: {str(e)}"
        )

# =========================================================================
# 2. SENSOR INGESTION ENDPOINT
# =========================================================================
@api_router.post(
    "/sensors/data",
    response_model=SensorReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Real-Time ESP32 Sensor Telemetry",
    tags=["Soil Sensors & Telemetry"]
)
async def ingest_sensor_data(payload: SensorReadingCreate):
    """
    Receives physical telemetry from ESP32 edge node, validates all numeric boundaries,
    stores the latest reading in repository, and returns ingested status.
    """
    try:
        saved_reading = sensor_service.ingest_reading(payload)
        return saved_reading
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process sensor telemetry: {str(e)}"
        )

# =========================================================================
# 3. LATEST SENSOR READINGS ENDPOINT
# =========================================================================
@api_router.get(
    "/sensors/latest",
    response_model=SensorReadingResponse,
    summary="Retrieve Latest Soil Telemetry Reading",
    tags=["Soil Sensors & Telemetry"]
)
async def get_latest_sensor_data(
    device_id: str = Query("esp32-field-node-01", description="Identifier of the target sensor device node")
):
    """
    Returns the latest recorded physical sensor readings (Moisture, Temp, pH, NPK).
    """
    return sensor_service.get_latest_reading(device_id)

# =========================================================================
# 4. SOIL HEALTH EVALUATION ENDPOINT
# =========================================================================
@api_router.get(
    "/soil/health",
    response_model=SoilHealthResponse,
    summary="Calculate Estimated Soil Health Score & Parameters",
    tags=["Soil Health & Diagnostics"]
)
async def get_soil_health(
    device_id: str = Query("esp32-field-node-01", description="Device ID for telemetry calculation")
):
    """
    Calculates estimated composite soil health score (0-100), parameter sub-indices,
    and active threshold warnings based on latest sensor telemetry.
    """
    return sensor_service.calculate_soil_health(device_id)

# =========================================================================
# 5. AGRONOMIC RECOMMENDATIONS ENDPOINT (PHASE 4 & 8)
# =========================================================================
@api_router.get(
    "/recommendations",
    response_model=RecommendationListResponse,
    summary="Fetch Actionable AI Agronomic Guidance",
    tags=["AI Recommendations"]
)
async def get_recommendations(
    field_id: str = Query("field-north-01", description="Agricultural field sector ID"),
    lang: str = Query("en", description="Target language code (en, te, hi, ta, kn, ml)"),
    crop_type: str = Query("Tomato", description="Target crop (Tomato, Potato, Rice, Maize)")
):
    """
    Fuses soil parameters and crop health status to generate actionable irrigation,
    fertilizer, and soil amendment recommendations in farmer-friendly language.
    """
    return recommendation_service.get_recommendations(field_id, lang, crop_type)

# =========================================================================
# 5.1 PHASE 9: INTELLIGENT PLANT + SOIL FUSED RECOMMENDATIONS EVALUATION
# =========================================================================
@api_router.post(
    "/recommendations/evaluate",
    response_model=FusedRecommendationResponse,
    summary="Evaluate Plant + Soil Fused Recommendations (Phase 9)",
    tags=["AI Recommendations"]
)
async def evaluate_fused_recommendations(payload: PlantSoilFusionInput):
    """
    Phase 9 Core Engine Endpoint:
    Combines computer vision leaf diagnostic results with physical ESP32 soil sensor
    telemetry to generate actionable, safe preventive management recommendations.
    Identifies:
    - Disease stress
    - Water stress
    - Nutrient stress
    - Soil pH issues
    - Environmental stress
    - Compound cross-domain stress
    """
    return recommendation_service.evaluate_fused(payload)

@api_router.get(
    "/recommendations/fused",
    response_model=FusedRecommendationResponse,
    summary="Fetch Live Fused Recommendations (Phase 9)",
    tags=["AI Recommendations"]
)
async def get_live_fused_recommendations(
    field_id: str = Query("field-north-01", description="Agricultural field sector ID"),
    crop_type: str = Query("Tomato", description="Target crop (Tomato, Potato, Rice, Maize)"),
    lang: str = Query("en", description="Target language code (en, te, hi, ta, kn, ml)")
):
    """
    Convenience endpoint to retrieve fused recommendations combining the latest
    ESP32 soil sensor reading with the most recent plant analysis.
    """
    from backend.services.plant_service import plant_service
    latest_plant = plant_service.get_latest_analysis()
    
    fusion_input = PlantSoilFusionInput(
        crop_type=latest_plant.crop_type if latest_plant else crop_type,
        disease_prediction=latest_plant.disease if latest_plant else None,
        disease_confidence=latest_plant.confidence if latest_plant else None,
        plant_health_status=latest_plant.health_status if latest_plant else "healthy",
        field_id=field_id,
        lang=lang
    )
    return recommendation_service.evaluate_fused(fusion_input)

# =========================================================================
# 6. SUPPORTED CROPS ENDPOINT
# =========================================================================
@api_router.get(
    "/crops",
    response_model=CropListResponse,
    summary="List Supported Agricultural Crops & Optimal Baselines",
    tags=["Crop Knowledge Base"]
)
async def get_crops():
    """
    Returns metadata on supported crops (Tomato, Potato, Rice, Maize) and their
    optimal agronomic parameters.
    """
    return crop_service.get_all_crops()

# =========================================================================
# 7. PHASE 10: CONTEXT-AWARE AI FARMER ASSISTANT
# =========================================================================
@api_router.post(
    "/assistant/ask",
    response_model=AssistantQueryResponse,
    summary="Ask AI Farmer Assistant with Actual Crop Context (Phase 10)",
    tags=["AI Assistant"]
)
async def ask_assistant(payload: AssistantQueryRequest):
    """
    Phase 10 Core Entrypoint:
    Answers farmer questions in English or Telugu utilizing multi-modal context:
    - Selected crop
    - Latest plant-analysis result & disease prediction
    - Real-time physical ESP32 soil measurements (Moisture, Temp, pH, NPK)
    - Soil health score
    - Existing recommendations

    Provides:
    1. Possible reason
    2. Evidence from plant image
    3. Relevant soil measurements
    4. Recommended next step
    With strict non-certainty and safety guardrails.
    """
    return assistant_service.answer_farmer_query(payload)

@api_router.get(
    "/assistant/context",
    summary="Get Active Field Context for Assistant (Phase 10)",
    tags=["AI Assistant"]
)
async def get_assistant_context(
    crop_type: str = Query("Tomato", description="Active crop type"),
    lang: str = Query("en", description="User language code: 'en' or 'te'")
):
    """
    Returns the real-time context snapshot currently available to the AI Assistant.
    """
    req = AssistantQueryRequest(question="Context query", crop_type=crop_type, lang=lang)
    return assistant_service._extract_context(req)

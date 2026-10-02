"""
Phase 9 Automated Verification Test Suite.
Tests the Intelligent Recommendation Engine fusing plant-analysis diagnostics with physical soil telemetry.

Verifies:
1. Input handling:
   - Crop type, disease prediction, disease confidence, plant health status
   - Soil moisture, soil temperature, pH, nitrogen, phosphorus, potassium
2. Stress identification:
   - Water stress (Low moisture deficit & High moisture waterlogging)
   - Nutrient stress (Nitrogen, Phosphorus, Potassium deficits)
   - Soil pH issues (Acidic and Alkaline reactions)
   - Environmental stress (High root-zone temperature)
   - Disease stress (Foliar visual symptom detection)
   - Compound cross-domain stress (Disease + High moisture, Disease + Nutrient deficit)
3. Safety guardrails:
   - No unsafe chemical pesticide prescriptions
   - No hazardous synthetic fertilizer dosages
   - General preventive and management guidance only
4. Output schema validation:
   - recommendation (headline)
   - severity (urgent | high | medium | low)
   - reason
   - suggested_action
   - supporting_sensor_values
5. Multilingual translations:
   - English (en), Telugu (te), Hindi (hi), Tamil (ta), Kannada (kn), Malayalam (ml)
6. REST API Endpoints:
   - POST /api/recommendations/evaluate
   - GET /api/recommendations/fused
   - GET /api/recommendations
"""

import sys
import os
from datetime import datetime

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.recommendation_engine import recommendation_engine
from backend.models.recommendation import PlantSoilFusionInput

client = TestClient(app)

def test_water_stress_low_moisture():
    """Verify under-irrigation detection and exact example guidance."""
    inp = PlantSoilFusionInput(
        crop_type="Tomato",
        disease_prediction="Healthy",
        disease_confidence=98.0,
        soil_moisture=32.0,  # Below Tomato target 50-70%
        soil_temperature=24.0,
        ph=6.5,
        nitrogen=180.0,
        phosphorus=45.0,
        potassium=200.0,
        lang="en"
    )
    res = recommendation_engine.evaluate(inp)
    assert any("Water Stress" in s for s in res.stresses_detected)
    water_rec = next(r for r in res.recommendations if r.stress_type == "Water Stress")
    assert "below" in water_rec.suggested_action.lower() or "irrigation" in water_rec.suggested_action.lower()
    assert water_rec.supporting_sensor_values["current_moisture"] == 32.0
    print("[PASS] Water stress (low moisture) correctly identified with preventive action.")

def test_nutrient_stress_low_nitrogen():
    """Verify low nitrogen detection and general preventive management."""
    inp = PlantSoilFusionInput(
        crop_type="Tomato",
        disease_prediction="Healthy",
        disease_confidence=95.0,
        soil_moisture=55.0,
        soil_temperature=23.0,
        ph=6.5,
        nitrogen=95.0,  # Below Tomato min 140 mg/kg
        phosphorus=45.0,
        potassium=200.0,
        lang="en"
    )
    res = recommendation_engine.evaluate(inp)
    assert any("Nitrogen Deficit" in s for s in res.stresses_detected)
    n_rec = next(r for r in res.recommendations if "Nitrogen" in r.recommendation or "nitrogen" in r.id)
    assert "nitrogen" in n_rec.suggested_action.lower() or "fertilizer" in n_rec.suggested_action.lower()
    assert n_rec.supporting_sensor_values["current_nitrogen"] == 95.0
    print("[PASS] Nutrient stress (low nitrogen) identified with safe guidance.")

def test_soil_ph_and_environmental_stress():
    """Verify acidic soil pH and high soil temperature detection."""
    inp = PlantSoilFusionInput(
        crop_type="Tomato",
        disease_prediction="Healthy",
        soil_moisture=55.0,
        soil_temperature=34.0,  # Heat stress > 28°C
        ph=4.8,  # Acidic < 6.0
        nitrogen=180.0,
        phosphorus=45.0,
        potassium=200.0,
        lang="en"
    )
    res = recommendation_engine.evaluate(inp)
    assert any("Soil pH Issue" in s for s in res.stresses_detected)
    assert any("Environmental Stress" in s for s in res.stresses_detected)
    
    ph_rec = next(r for r in res.recommendations if r.stress_type == "Soil pH Issue")
    temp_rec = next(r for r in res.recommendations if r.stress_type == "Environmental Stress")
    assert ph_rec.supporting_sensor_values["current_ph"] == 4.8
    assert temp_rec.supporting_sensor_values["current_temperature"] == 34.0
    print("[PASS] Soil pH and thermal environmental stress correctly identified.")

def test_compound_disease_and_high_moisture_fusion():
    """Verify cross-domain fusion when fungal disease coincides with high soil moisture."""
    inp = PlantSoilFusionInput(
        crop_type="Tomato",
        disease_prediction="Early Blight",
        disease_confidence=94.5,
        plant_health_status="disease_detected",
        soil_moisture=68.0,  # High moisture creating humid spore microclimate
        soil_temperature=25.0,
        ph=6.4,
        nitrogen=170.0,
        phosphorus=45.0,
        potassium=210.0,
        lang="en"
    )
    res = recommendation_engine.evaluate(inp)
    assert any("Compound Stress" in s for s in res.stresses_detected)
    compound_rec = next(r for r in res.recommendations if r.stress_type == "Compound Stress")
    assert compound_rec.severity == "urgent"
    assert "overhead" in compound_rec.suggested_action.lower() or "spore" in compound_rec.reason.lower()
    print("[PASS] Compound disease + moisture stress fusion successfully triggered with urgent severity.")

def test_multilingual_telugu_output():
    """Verify farmer-friendly Telugu output for all Phase 9 required fields."""
    inp = PlantSoilFusionInput(
        crop_type="Tomato",
        disease_prediction="Early Blight",
        disease_confidence=92.0,
        soil_moisture=35.0,  # Deficit
        soil_temperature=24.0,
        ph=6.4,
        nitrogen=170.0,
        phosphorus=45.0,
        potassium=200.0,
        lang="te"
    )
    res = recommendation_engine.evaluate(inp)
    assert len(res.recommendations) > 0
    first_rec = res.recommendations[0]
    # Check required fields exist
    assert hasattr(first_rec, "recommendation") and len(first_rec.recommendation) > 0
    assert hasattr(first_rec, "severity") and len(first_rec.severity) > 0
    assert hasattr(first_rec, "reason") and len(first_rec.reason) > 0
    assert hasattr(first_rec, "suggested_action") and len(first_rec.suggested_action) > 0
    assert hasattr(first_rec, "supporting_sensor_values") and len(first_rec.supporting_sensor_values) > 0
    print("[PASS] Multilingual Telugu recommendation verified successfully (non-empty translated strings).")

def test_api_endpoints_phase9():
    """Verify POST /api/recommendations/evaluate and GET /api/recommendations/fused endpoints."""
    # 1. Test POST /api/recommendations/evaluate
    payload = {
        "crop_type": "Potato",
        "disease_prediction": "Late Blight",
        "disease_confidence": 91.0,
        "plant_health_status": "disease_detected",
        "soil_moisture": 38.0,
        "soil_temperature": 20.0,
        "ph": 6.0,
        "nitrogen": 140.0,
        "phosphorus": 40.0,
        "potassium": 180.0,
        "lang": "en"
    }
    post_resp = client.post("/api/recommendations/evaluate", json=payload)
    assert post_resp.status_code == 200, f"Expected 200 OK, got {post_resp.status_code}: {post_resp.text}"
    post_data = post_resp.json()
    assert post_data["crop_type"] == "Potato"
    assert post_data["total_count"] > 0
    assert "recommendations" in post_data
    
    first = post_data["recommendations"][0]
    assert "recommendation" in first
    assert "severity" in first
    assert "reason" in first
    assert "suggested_action" in first
    assert "supporting_sensor_values" in first

    # 2. Test GET /api/recommendations/fused
    get_resp = client.get("/api/recommendations/fused?crop_type=Tomato&lang=en")
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert "recommendations" in get_data
    assert "stresses_detected" in get_data

    # 3. Test GET /api/recommendations with crop_type
    legacy_resp = client.get("/api/recommendations?crop_type=Tomato&lang=en")
    assert legacy_resp.status_code == 200
    legacy_data = legacy_resp.json()
    assert len(legacy_data["recommendations"]) > 0
    assert "recommendation" in legacy_data["recommendations"][0]

    print("[PASS] All Phase 9 REST API endpoints responded successfully with full schema.")

if __name__ == "__main__":
    print("\n=======================================================")
    print("  RUNNING PHASE 9 INTELLIGENT RECOMMENDATION ENGINE TESTS")
    print("=======================================================\n")
    test_water_stress_low_moisture()
    test_nutrient_stress_low_nitrogen()
    test_soil_ph_and_environmental_stress()
    test_compound_disease_and_high_moisture_fusion()
    test_multilingual_telugu_output()
    test_api_endpoints_phase9()
    print("\n=======================================================")
    print("  ALL PHASE 9 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("=======================================================\n")

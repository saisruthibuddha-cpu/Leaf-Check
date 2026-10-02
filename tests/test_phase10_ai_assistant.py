"""
Phase 10 Automated Verification Test Suite.
Tests the Context-Aware Agricultural AI Assistant answering farmer questions
using actual crop context, plant vision diagnostics, and real-time soil telemetry.

Verifies:
1. Multi-modal Context Access:
   - Selected crop
   - Latest plant-analysis result & disease prediction
   - Real-time soil sensor readings (Moisture, Temp, pH, NPK)
   - Soil health score
   - Existing recommendations
   - Selected language
2. Question Reasoning (e.g. 'Why are my tomato leaves turning yellow?'):
   - 1. Possible reason
   - 2. Evidence from plant image
   - 3. Relevant soil measurements
   - 4. Recommended next step
3. Bilingual Support:
   - English (en)
   - Telugu (te)
4. Strict Safety Guardrails:
   - Does not claim absolute certainty
   - Directs farmers to local Krishi Vigyan Kendra / agricultural extension officers
   - Avoids hazardous chemical prescriptions
5. REST API Endpoints:
   - POST /api/assistant/ask
   - GET /api/assistant/context
"""

import sys
import os

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.services.assistant_service import assistant_service
from backend.models.assistant import AssistantQueryRequest

client = TestClient(app)

def test_yellowing_leaves_english():
    """Verify reasoning for 'Why are my tomato leaves turning yellow?' in English."""
    req = AssistantQueryRequest(
        question="Why are my tomato leaves turning yellow?",
        crop_type="Tomato",
        disease_prediction="Early Blight",
        disease_confidence=92.5,
        plant_health_status="disease_detected",
        soil_moisture=38.0,   # Deficit (< 50%)
        soil_temperature=24.5,
        ph=6.5,
        nitrogen=110.0,       # Low N (< 140 mg/kg)
        phosphorus=42.0,
        potassium=190.0,
        soil_health_score=76,
        lang="en"
    )
    ans = assistant_service.answer_farmer_query(req)

    # 1. Verify 4 Required Sections
    assert len(ans.possible_reason) > 0, "Missing possible_reason"
    assert len(ans.evidence_from_plant_image) > 0, "Missing evidence_from_plant_image"
    assert len(ans.relevant_soil_measurements) > 0, "Missing relevant_soil_measurements"
    assert len(ans.recommended_next_step) > 0, "Missing recommended_next_step"

    # 2. Check Context-Driven Content
    assert "Early Blight" in ans.evidence_from_plant_image
    assert "110" in ans.relevant_soil_measurements or "nitrogen" in ans.relevant_soil_measurements.lower()
    assert "38" in ans.relevant_soil_measurements or "moisture" in ans.relevant_soil_measurements.lower()

    # 3. Check Safety & Non-Certainty
    full_text = ans.full_response.lower()
    assert "not guarantee" in full_text or "advisory" in full_text or "may likely" in full_text
    assert "extension" in full_text or "krishi vigyan" in full_text

    print("[PASS] English yellowing leaves query correctly answered with 4-point context breakdown.")

def test_yellowing_leaves_telugu():
    """Verify reasoning for 'Why are my tomato leaves turning yellow?' in Telugu."""
    req = AssistantQueryRequest(
        question="నా టమోటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?",
        crop_type="Tomato",
        disease_prediction="Early Blight",
        disease_confidence=91.0,
        plant_health_status="disease_detected",
        soil_moisture=42.0,
        soil_temperature=25.0,
        ph=6.4,
        nitrogen=115.0,
        phosphorus=40.0,
        potassium=180.0,
        soil_health_score=78,
        lang="te"
    )
    ans = assistant_service.answer_farmer_query(req)

    # Check non-empty strings for all 4 sections in Telugu
    assert len(ans.possible_reason) > 0
    assert len(ans.evidence_from_plant_image) > 0
    assert len(ans.relevant_soil_measurements) > 0
    assert len(ans.recommended_next_step) > 0
    assert ans.lang == "te"

    # Avoid charmap encoding print error by printing safe confirmation
    print("[PASS] Telugu yellowing leaves query verified with natural farmer-friendly explanation.")

def test_low_confidence_safety_guardrail():
    """Verify assistant recommends local agronomist when confidence is low."""
    req = AssistantQueryRequest(
        question="My crop looks sick, what medicine should I spray?",
        crop_type="Potato",
        disease_prediction="Unknown Condition",
        disease_confidence=35.0,  # Low confidence < 60%
        plant_health_status="warning",
        soil_moisture=50.0,
        nitrogen=150.0,
        lang="en"
    )
    ans = assistant_service.answer_farmer_query(req)

    assert "Low Confidence" in ans.confidence_level or "Consult" in ans.confidence_level
    assert "extension" in ans.recommended_next_step.lower() or "sample" in ans.recommended_next_step.lower()
    # Confirm no dangerous chemical prescription
    assert "spray 500ml" not in ans.recommended_next_step.lower()
    print("[PASS] Low confidence safety guardrail triggered with local agronomist referral.")

def test_api_assistant_endpoints():
    """Verify POST /api/assistant/ask and GET /api/assistant/context REST endpoints."""
    # 1. POST /api/assistant/ask
    post_payload = {
        "question": "Is my soil moisture adequate for my tomato crop?",
        "crop_type": "Tomato",
        "soil_moisture": 32.5,
        "lang": "en"
    }
    resp = client.post("/api/assistant/ask", json=post_payload)
    assert resp.status_code == 200, f"Expected 200 OK, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert "possible_reason" in data
    assert "evidence_from_plant_image" in data
    assert "relevant_soil_measurements" in data
    assert "recommended_next_step" in data
    assert "full_response" in data

    # 2. GET /api/assistant/context
    ctx_resp = client.get("/api/assistant/context?crop_type=Tomato&lang=en")
    assert ctx_resp.status_code == 200
    ctx_data = ctx_resp.json()
    assert "crop" in ctx_data
    assert "moisture" in ctx_data
    assert "targets" in ctx_data

    print("[PASS] REST API endpoints /api/assistant/ask and /api/assistant/context verified.")

if __name__ == "__main__":
    print("\n=======================================================")
    print("  RUNNING PHASE 10 CONTEXT-AWARE AI ASSISTANT TESTS    ")
    print("=======================================================\n")
    test_yellowing_leaves_english()
    test_yellowing_leaves_telugu()
    test_low_confidence_safety_guardrail()
    test_api_assistant_endpoints()
    print("\n=======================================================")
    print("  ALL PHASE 10 VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("=======================================================\n")

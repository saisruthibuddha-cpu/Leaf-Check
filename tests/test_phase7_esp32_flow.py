"""
Phase 7 End-to-End Test Suite: ESP32 to Web Application Telemetry Flow.

Verifies:
1. ESP32 sends reading via HTTP POST to /api/sensors/data.
2. Backend receives reading.
3. Backend validates it (boundary checks, invalid reading warnings, probe error states).
4. Data is stored in SQLite storage layer (sensor_readings and iot_devices).
5. Frontend retrieves it via GET /api/sensors/latest and GET /api/soil/health.
6. Dashboard updates with Moisture, Temperature, pH, Nitrogen, Phosphorus, Potassium, Soil Health Score.
7. Offline detection when ESP32 disconnects: returns 'Sensor offline — displaying last available reading.' without crashing.
"""
import sys
import os
from datetime import datetime, timedelta

# Add workspace root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from database.db import SessionLocal
from database.models.db_models import SensorReadingDB, IoTDeviceDB
from backend.services.sensor_service import _LATEST_SENSOR_STORE, sensor_service

client = TestClient(app)

def test_phase7_full_telemetry_flow():
    print("=================================================================")
    print("  PHASE 7 VERIFICATION: ESP32 TO WEB APPLICATION SENSOR FLOW")
    print("=================================================================\n")

    device_id = "esp32-field-node-01"

    # -------------------------------------------------------------------
    # Step 1 & 2 & 3: ESP32 sends reading -> Backend receives & validates
    # -------------------------------------------------------------------
    print("[Test Step 1-3] Simulating ESP32 HTTP POST transmission to /api/sensors/data...")
    now_iso = datetime.utcnow().isoformat()
    telemetry_payload = {
        "device_id": device_id,
        "soil_moisture": 47.8,
        "soil_temperature": 23.5,
        "ph": 6.55,
        "nitrogen": 165.0,
        "phosphorus": 45.0,
        "potassium": 190.0,
        "timestamp": now_iso
    }

    resp = client.post("/api/sensors/data", json=telemetry_payload)
    assert resp.status_code == 201, f"Expected 201 Created, got {resp.status_code}: {resp.text}"
    data = resp.json()

    print("  -> Received HTTP 201 Response from FastAPI backend")
    assert data["device_id"] == device_id
    assert data["soil_moisture"] == 47.8
    assert data["soil_temperature"] == 23.5
    assert data["ph"] == 6.55
    assert data["nitrogen"] == 165.0
    assert data["phosphorus"] == 45.0
    assert data["potassium"] == 190.0
    assert data["status"] == "active"
    assert data["is_offline"] is False
    assert data["is_invalid_reading"] is False
    assert data["sensor_error"] is None
    print("  -> Telemetry payload validated successfully by SoilSensorProcessor.\n")

    # -------------------------------------------------------------------
    # Step 4: Storage Layer Verification
    # -------------------------------------------------------------------
    print("[Test Step 4] Verifying database storage layer persistence in SQLite...")
    with SessionLocal() as db:
        # Check IoT Device registration
        device_row = db.query(IoTDeviceDB).filter_by(device_id=device_id).first()
        assert device_row is not None, "IoT Device not registered in database!"
        assert device_row.is_online is True

        # Check latest Sensor Reading in DB
        reading_row = (
            db.query(SensorReadingDB)
            .filter_by(device_id=device_id)
            .order_by(SensorReadingDB.timestamp.desc())
            .first()
        )
        assert reading_row is not None, "Sensor reading not saved to database!"
        assert abs(reading_row.moisture_percent - 47.8) < 0.01
        assert abs(reading_row.temperature_celsius - 23.5) < 0.01
        assert abs(reading_row.ph_level - 6.55) < 0.01
        assert abs(reading_row.nitrogen_mg_kg - 165.0) < 0.01
    print("  -> Confirmed reading written to SQLite 'sensor_readings' and device record in 'iot_devices'.\n")

    # -------------------------------------------------------------------
    # Step 5: Frontend Retrieval Endpoints: GET /api/sensors/latest & GET /api/soil/health
    # -------------------------------------------------------------------
    print("[Test Step 5] Verifying Frontend API retrieval endpoints...")
    latest_resp = client.get(f"/api/sensors/latest?device_id={device_id}")
    assert latest_resp.status_code == 200
    latest_data = latest_resp.json()
    assert latest_data["soil_moisture"] == 47.8
    assert latest_data["soil_temperature"] == 23.5
    assert latest_data["ph"] == 6.55
    assert latest_data["nitrogen"] == 165.0
    assert latest_data["phosphorus"] == 45.0
    assert latest_data["potassium"] == 190.0
    assert latest_data["is_offline"] is False
    assert latest_data["last_updated_formatted"] == "Just now"
    print("  -> GET /api/sensors/latest successfully retrieved live telemetry for dashboard.")

    health_resp = client.get(f"/api/soil/health?device_id={device_id}")
    assert health_resp.status_code == 200
    health_data = health_resp.json()
    assert 0 <= health_data["estimated_score"] <= 100
    assert health_data["rating"] in ["Excellent", "Good", "Fair", "Poor"]
    assert len(health_data["parameters"]) == 6
    print(f"  -> GET /api/soil/health calculated Soil Health Score: {health_data['estimated_score']}/100 ({health_data['rating']})")
    print("  -> Evaluated all 6 probe parameters: Moisture, Temperature, pH, Nitrogen, Phosphorus, Potassium.\n")

    # -------------------------------------------------------------------
    # Step 6: Invalid Reading Warning Detection
    # -------------------------------------------------------------------
    print("[Test Step 6] Testing Invalid Reading Warning detection (extreme pH 11.5)...")
    invalid_payload = {
        "device_id": device_id,
        "soil_moisture": 50.0,
        "soil_temperature": 25.0,
        "ph": 11.5, # Out of agricultural boundary
        "nitrogen": 150.0,
        "phosphorus": 40.0,
        "potassium": 180.0
    }
    inv_resp = client.post("/api/sensors/data", json=invalid_payload)
    assert inv_resp.status_code == 201
    inv_data = inv_resp.json()
    assert inv_data["is_invalid_reading"] is True
    assert inv_data["warning_notice"] is not None
    assert "Invalid Reading Warning" in inv_data["warning_notice"]
    print(f"  -> Correctly flagged invalid reading warning: {inv_data['warning_notice']}\n")

    # -------------------------------------------------------------------
    # Step 7: Sensor Error State Detection (e.g. Probe Disconnect / Code -127°C)
    # -------------------------------------------------------------------
    print("[Test Step 7] Testing Hardware Probe Error State (DS18B20 code -127°C)...")
    error_payload = {
        "device_id": device_id,
        "soil_moisture": 45.0,
        "soil_temperature": -127.0, # DS18B20 OneWire fault code
        "ph": 6.5,
        "nitrogen": 150.0,
        "phosphorus": 40.0,
        "potassium": 180.0
    }
    err_resp = client.post("/api/sensors/data", json=error_payload)
    assert err_resp.status_code == 201
    err_data = err_resp.json()
    assert err_data["status"] == "error"
    assert err_data["sensor_error"] is not None
    assert "Hardware Probe Error" in err_data["sensor_error"]
    print(f"  -> Correctly flagged sensor hardware error: {err_data['sensor_error']}\n")

    # -------------------------------------------------------------------
    # Step 8: Offline Disconnect Resilience Test
    # -------------------------------------------------------------------
    print("[Test Step 8] Testing ESP32 Disconnection & Offline Notice Resilience...")
    # Simulate past timestamp (> 15 seconds ago) to test offline trigger
    past_time = datetime.utcnow() - timedelta(seconds=25)
    _LATEST_SENSOR_STORE[device_id].timestamp = past_time

    offline_resp = client.get(f"/api/sensors/latest?device_id={device_id}")
    assert offline_resp.status_code == 200
    off_data = offline_resp.json()
    assert off_data["is_offline"] is True
    assert off_data["status"] == "offline"
    assert off_data["offline_notice"] == "Sensor offline — displaying last available reading."
    # Crucial: Must still display last available readings without crashing!
    assert off_data["soil_moisture"] is not None
    assert off_data["soil_temperature"] is not None
    print(f"  -> Offline status: is_offline = {off_data['is_offline']}")
    print(f"  -> Mandatory notice: '{off_data['offline_notice']}'")
    print("  -> Website resilience: Returns last available reading smoothly with zero crashes.\n")

    print("=================================================================")
    print("  ALL PHASE 7 TESTS PASSED SUCCESSFULLY! ")
    print("=================================================================")

if __name__ == "__main__":
    test_phase7_full_telemetry_flow()

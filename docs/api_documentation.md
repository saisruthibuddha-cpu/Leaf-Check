# 📡 Leaf Check - REST API Documentation

This document provides complete technical specifications for all REST endpoints exposed by the **Leaf Check** FastAPI service.

- **Base URL**: `http://127.0.0.1:8000/api`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc Interactive UI**: `http://127.0.0.1:8000/redoc`
- **OpenAPI Schema**: `http://127.0.0.1:8000/api/openapi.json`

---

## 1. Plant Leaf Computer Vision Diagnostics

### `POST /api/analyze-plant`
Performs deep learning inference on an uploaded leaf photograph using PyTorch `CropDiseaseNet`. Generates class probability distributions and Grad-CAM visual attention overlays.

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `image` *(File, required)*: JPEG, PNG, or WEBP photograph (min 32x32px, max 15MB).
  - `crop_type` *(String, optional, default: `"Tomato"`)*: `Tomato`, `Potato`, `Rice`, or `Maize`.

#### Sample Request (cURL)
```bash
curl -X POST "http://127.0.0.1:8000/api/analyze-plant" \
  -F "crop_type=Tomato" \
  -F "image=@leaf_sample.jpg;type=image/jpeg"
```

#### Success Response (`200 OK`)
```json
{
  "id": "diag-9f8a12e3",
  "crop_type": "Tomato",
  "disease": "Tomato Early Blight",
  "confidence": 94.2,
  "health_status": "disease_detected",
  "is_low_confidence": false,
  "description": "Target-shaped concentric rings on mature foliage caused by Alternaria solani.",
  "recommended_actions": [
    "Prune and discard infected lower leaves.",
    "Avoid overhead irrigation to keep leaf canopy dry.",
    "Apply organic neem oil solution at early onset."
  ],
  "class_probabilities": [
    {"class_name": "Tomato Early Blight", "probability": 0.942},
    {"class_name": "Tomato Late Blight", "probability": 0.038},
    {"class_name": "Tomato Healthy", "probability": 0.020}
  ],
  "gradcam_heatmap_url": "/api/static/heatmaps/diag-9f8a12e3.png",
  "analyzed_at": "2026-10-02T12:00:00Z"
}
```

#### Error Responses
- `400 Bad Request`: Empty image file, unsupported image format, or dimensions `<32x32`.
- `422 Unprocessable Content`: Missing `image` file field.

---

## 2. IoT Soil Sensor Telemetry

### `GET /api/sensors/latest`
Retrieves the most recent physical soil telemetry packet for a field device.

- **Query Parameters**:
  - `device_id` *(String, optional, default: `"esp32-field-node-01"`)*

#### Success Response (`200 OK`)
```json
{
  "device_id": "esp32-field-node-01",
  "soil_moisture": 32.5,
  "soil_temperature": 24.2,
  "ph": 6.4,
  "nitrogen": 118.0,
  "phosphorus": 46.0,
  "potassium": 182.0,
  "timestamp": "2026-10-02T12:00:00Z",
  "status": "active",
  "status_summary": {
    "moisture": "Deficit Warning",
    "ph": "Optimal",
    "nitrogen": "Low"
  },
  "is_offline": false,
  "offline_notice": null,
  "is_invalid_reading": false,
  "warning_notice": null,
  "sensor_error": null,
  "last_updated_formatted": "Just now"
}
```

---

### `POST /api/sensors/data`
Ingests telemetry packets transmitted by field IoT hardware (or simulated testing nodes).

- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "device_id": "esp32-field-node-01",
  "soil_moisture": 42.5,
  "soil_temperature": 23.8,
  "ph": 6.5,
  "nitrogen": 140.0,
  "phosphorus": 45.0,
  "potassium": 175.0,
  "timestamp": "2026-10-02T12:00:00Z"
}
```

#### Validation Rails
- `soil_moisture`: Range `0.0%` to `100.0%`.
- `soil_temperature`: Range `-20.0°C` to `60.0°C` (handles `-127°C` DS18B20 disconnect fault code as hardware error).
- `ph`: Range `0.0` to `14.0`.
- `nitrogen`, `phosphorus`, `potassium`: Non-negative agronomic values.

---

### `GET /api/soil/health`
Computes composite agronomic soil health scoring and parameter deviations.

- **Query Parameters**:
  - `device_id` *(String, optional, default: `"esp32-field-node-01"`)*

#### Success Response (`200 OK`)
```json
{
  "device_id": "esp32-field-node-01",
  "estimated_score": 82,
  "rating": "Good",
  "color": "#10b981",
  "summary": "Overall soil health is good with a slight moisture deficit.",
  "parameters": [
    {
      "id": "moisture",
      "name": "Soil Moisture",
      "value": 32.5,
      "unit": "%",
      "status": "warning",
      "min_healthy": 40.0,
      "max_healthy": 60.0,
      "healthy_range_text": "40 - 60 %"
    }
  ],
  "warnings": [
    {
      "id": "w-moisture",
      "parameter_name": "Soil Moisture",
      "severity": "warning",
      "message": "Soil moisture (32.5%) is below healthy baseline of 40.0%.",
      "suggested_action": "Check drip irrigation schedule."
    }
  ]
}
```

---

## 3. Intelligent Recommendation Engine (Cross-Domain Fusion)

### `POST /api/recommendations/evaluate`
Fuses vision diagnostics with live soil chemistry to produce multi-dimensional agronomic management advice.

- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "crop_type": "Tomato",
  "disease_prediction": "Tomato Early Blight",
  "disease_confidence": 94.2,
  "plant_health_status": "disease_detected",
  "lang": "en"
}
```

#### Success Response (`200 OK`)
```json
{
  "field_id": "field-north-01",
  "crop_type": "Tomato",
  "plant_disease": "Tomato Early Blight",
  "disease_confidence": 94.2,
  "stresses_detected": ["Foliage Pathogen", "Root Moisture Deficit"],
  "total_count": 2,
  "recommendations": [
    {
      "id": "rec-tomato-eb-01",
      "recommendation": "Maintain Moderate Foliage Moisture and Prune Lower Canopy",
      "severity": "high",
      "stress_type": "Compound Stress",
      "reason": "Early blight spores thrive in damp canopies while dry root soil stresses plant natural defenses.",
      "suggested_action": "Ensure root zone hydration without splashing water onto infected lower leaves.",
      "supporting_sensor_values": {
        "Soil Moisture": "32.5%",
        "Target Baseline": "40.0 - 60.0%",
        "Confidence": "94.2%"
      }
    }
  ],
  "disclaimer": "All recommendations provide general cultural and preventive management advice. Consult local agricultural authorities before applying synthetic inputs."
}
```

---

## 4. Multilingual Farmer AI Assistant

### `POST /api/assistant/ask`
Answers farmer questions grounded strictly in the current crop diagnostic context and live soil measurements.

- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "question": "Why are my tomato leaves turning yellow?",
  "crop_type": "Tomato",
  "language": "en"
}
```

#### Success Response (`200 OK`)
```json
{
  "possible_reason": "Your Tomato plot exhibits Early Blight symptoms compounded by a mild nitrogen deficit.",
  "evidence_plant": "Leaf scanning detected concentric lesions characteristic of Early Blight (Confidence: 94.2%).",
  "evidence_soil": "Active soil telemetry indicates nitrogen reserves at 118.0 mg/kg (optimal target: 140-200 mg/kg) and soil moisture at 32.5%.",
  "recommended_next_step": "Prune affected bottom leaves and consider applying compost tea or organic nitrogen before next irrigation cycle.",
  "safety_notice": "Guidance provided is based on sensor estimates and computer vision inference. For severe blight or uncertain symptoms, consult your local agricultural extension service.",
  "language": "en"
}
```

#### Telugu Query Example
```json
{
  "question": "నా టమాటా ఆకులు ఎందుకు పసుపు రంగులోకి మారుతున్నాయి?",
  "crop_type": "Tomato",
  "language": "te"
}
```
Returns natural, localized Telugu explanations with evidence from foliage and soil telemetry.

---

## 5. System Health Check

### `GET /health`
Returns system status, service name, and gateway availability.

#### Success Response (`200 OK`)
```json
{
  "status": "healthy",
  "service": "Leaf Check",
  "api_gateway": "active",
  "iot_ingestion": "ready",
  "ai_engine": "mock_ready"
}
```

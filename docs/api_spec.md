# AI Crop Health - API & Data Contract Specification

## REST Endpoints Specification (v1)

Base URL: `/api/v1`

---

### 1. Soil Telemetry Ingestion
- **Endpoint**: `POST /sensors/ingest`
- **Description**: Receives real-time telemetry from ESP32 edge node.
- **Request Body**:
```json
{
  "device_id": "esp32-field-node-01",
  "moisture": 45.2,
  "temperature": 24.5,
  "ph": 6.8,
  "npk": {
    "nitrogen": 120.0,
    "phosphorus": 45.0,
    "potassium": 180.0
  }
}
```
- **Response**: `201 Created`

---

### 2. Plant Image Disease Diagnosis
- **Endpoint**: `POST /plant/analyze`
- **Description**: Accepts leaf image upload and returns AI disease diagnosis.
- **Content-Type**: `multipart/form-data`
- **Parameters**: `image` (File), `crop_type` (String)
- **Response**:
```json
{
  "analysis_id": "analysis-98214",
  "crop_type": "Tomato",
  "timestamp": "2026-09-16T19:00:00Z",
  "image_url": "/static/uploads/leaf_98214.jpg",
  "prediction": {
    "disease_id": "TOMATO_EARLY_BLIGHT",
    "disease_name": "Tomato Early Blight",
    "scientific_name": "Alternaria solani",
    "confidence": 0.942,
    "severity": "moderate",
    "symptoms": ["Concentric rings on leaves", "Lower leaf yellowing"]
  },
  "treatment_recommendations": [
    "Apply copper-based fungicide",
    "Improve soil drainage and avoid overhead watering"
  ]
}
```

---

### 3. AI Recommendations Engine
- **Endpoint**: `GET /recommendations/{field_id}`
- **Description**: Fetches actionable agronomic guidance fusing soil telemetry + crop analysis.
- **Response**:
```json
{
  "field_id": "field-north-01",
  "recommendations": [
    {
      "id": "rec-101",
      "category": "irrigation",
      "title": "Irrigation Adjustment Required",
      "description": "Soil moisture dropped below threshold (35%). Trigger 30-min drip irrigation.",
      "priority": "high",
      "created_at": "2026-09-16T19:05:00Z"
    }
  ]
}
```

# 🍃 Leaf Check — Precision AI Agricultural Platform

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%205-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/AI%20Vision-PyTorch%202.0+-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org)
[![ESP32](https://img.shields.io/badge/IoT%20Hardware-ESP32%20FreeRTOS-E7352C?logo=espressif&logoColor=white)](https://www.espressif.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Theme](https://img.shields.io/badge/Theme-White%20%26%20Gold%20Luxury-D4AF37)](https://leafcheck.agri.io)

**Leaf Check** is an intelligent agricultural intelligence platform that unites **Deep Learning Computer Vision**, **Physical IoT Soil Telemetry**, an **Agronomic Recommendation Fusion Engine**, and a **Multilingual Farmer AI Assistant** (supporting Telugu, English, Tamil, Kannada, Hindi, and Malayalam).

Designed with a high-end **White and Gold Outlining** luxury aesthetic over a soft blurred botanical background, Leaf Check provides real-time crop disease diagnosis and soil health insights with farmer-friendly, preventative guidance.

---

## 🏛️ System Architecture

```
                                  [ FARMER CLIENT ]
                    React 18 + Vite + TypeScript (White & Gold UI)
                 ┌──────────────────────────────────────────────────┐
                 │  - Multilingual Language Context (EN, TE, ...)   │
                 │  - Leaf Upload & Grad-CAM Heatmap Viewer         │
                 │  - Physical Soil Telemetry Gauge Dashboard       │
                 │  - Fused Agronomic Guidance & Farmer AI Chat     │
                 └─────────────────────────┬────────────────────────┘
                                           │ HTTP REST /api
                                           ▼
                                 [ FASTAPI BACKEND ]
                 ┌──────────────────────────────────────────────────┐
                 │  - Pydantic v2 Request Validation & Error Rails │
                 │  - Agronomic Multi-Domain Fusion Engine          │
                 │  - Context-Aware Farmer AI Assistant Service     │
                 │  - SQLite / SQLAlchemy Telemetry Storage         │
                 └──────────────┬────────────────────────┬──────────┘
                                │                        │
                Leaf Image /cam │                        │ Modbus / JSON
                                ▼                        ▼
                     [ PYTORCH AI ENGINE ]     [ FIELD IoT SENSORS ]
                  - CropDiseaseNet CNN         - ESP32 Microcontroller
                  - Grad-CAM Activation        - Capacitive Moisture
                  - 38 Foliage Conditions      - DS18B20 Temp Probe
                  - Low-Confidence Guardrail   - RS485 Modbus pH & NPK
```

---

## 🌾 Supported Crops & Pathologies

| Crop | Evaluated Conditions | Agronomic Considerations |
| :--- | :--- | :--- |
| **Tomato** | Early Blight, Late Blight, Septoria Spot, Healthy | Nitrogen deficiency exacerbates alternaria vulnerability. |
| **Potato** | Early Blight, Late Blight, Healthy | High moisture (>80%) accelerates Phytophthora sporulation. |
| **Rice** | Leaf Blast, Brown Spot, Healthy | Soil pH deviation impacts silica and micronutrient uptake. |
| **Maize** | Common Rust, Northern Leaf Blight, Gray Spot, Healthy | Potassium reserves dictate stalk structural strength. |

---

## 🌐 Multilingual Accessibility

Leaf Check provides complete localization across all diagnostics, alerts, recommendations, and conversational assistance:
- **English** (`en`)
- **తెలుగు (Telugu)** (`te`)
- **தமிழ் (Tamil)** (`ta`)
- **ಕನ್ನಡ (Kannada)** (`kn`)
- **हिन्दी (Hindi)** (`hi`)
- **മലയാളം (Malayalam)** (`ml`)

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Git

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/agri-ai/leaf-check.git
cd leaf-check

# Install Python dependencies
pip install -r backend/requirements.txt
pip install -r ai/requirements.txt

# Launch development backend server (Port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation is available immediately at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

### 2. Frontend Setup
```bash
# In a separate terminal, enter the frontend directory
cd frontend

# Install npm dependencies
npm install

# Start development client (Port 3000)
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to experience Leaf Check.

---

## 🎮 10-Step Evaluator Demo Flow

Leaf Check features an automated **Demo Mode** with preloaded sample images and simulated telemetry so the complete platform can be evaluated anytime, even when physical field hardware is offline:

1. **Open Website**: Visit `http://localhost:3000`.
2. **Select Language**: Click the language dropdown in the navbar and toggle between **English** and **తెలుగు (Telugu)**.
3. **Select Leaf Photograph**: Navigate to **Plant Disease Check** (or click **⚡ Run 10-Step Demo Flow** on the landing page). Click any preset sample (e.g. *Tomato* or *Potato*).
4. **Run Vision Diagnostics**: Click **Analyze Foliage**. The PyTorch model executes vision inference.
5. **Inspect Neural Prediction**: Review the disease prediction (e.g., *Tomato Early Blight*), confidence percentage (`94.2%`), severity badge, and Grad-CAM visual attention heatmap.
6. **Review Soil Telemetry**: Examine the active soil telemetry benchmarks (Moisture 32.5%, Temp 24.2°C, pH 6.4, N-P-K reserves).
7. **Examine Soil Health Score**: Review the composite Soil Health Score (`82/100 - Good`) and agronomic parameters.
8. **Inspect Cross-Domain Fusion**: Scroll to the **Plant & Soil Fused Guidance** card uniting leaf symptoms with soil deficits.
9. **Review Preventive Actions**: View the prioritized management steps (irrigation adjustments, organic management).
10. **Consult Farmer AI Assistant**: Click **Ask Farmer AI Assistant About This Result**. The conversational assistant opens with pre-loaded field context in your selected language.

---

## 🏭 Production Deployment

### 1. Production Build
```bash
# Compile and optimize frontend bundle
npm --prefix frontend run build

# Start production ASGI server with multi-worker support
python backend/prod_server.py
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```
Refer to [`docs/environment_variables.md`](docs/environment_variables.md) for full parameter definitions.

### 3. Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name leafcheck.agri.io;

    # Serve compiled frontend static files
    location / {
        root /var/www/leaf-check/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API traffic to FastAPI ASGI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📂 Project Architecture

```
leaf-check/
├── ai/                         # PyTorch Neural Network Pipeline
│   ├── datasets/               # PlantVillage / custom crop dataset loaders
│   ├── inference/              # Vision prediction service & Grad-CAM generator
│   └── models/                 # CropDiseaseNet CNN architecture & weights
├── backend/                    # FastAPI REST API Microservice
│   ├── api/                    # Versioned REST routers & endpoints
│   ├── config.py               # Pydantic Settings & environment bindings
│   ├── main.py                 # Application factory & CORS middleware
│   ├── models/                 # Pydantic DTO models & schemas
│   ├── prod_server.py          # Production ASGI server launcher
│   └── services/               # Recommendation engine, sensor & assistant services
├── database/                   # SQLite / SQLAlchemy Persistence Layer
│   ├── db.py                   # Engine & session management
│   └── models/                 # ORM telemetry & analysis entities
├── docs/                       # Comprehensive Platform Documentation
│   ├── api_documentation.md    # Complete REST API reference
│   ├── demo_instructions.md    # 10-step evaluator demonstration guide
│   ├── environment_variables.md# Production env vars specification
│   └── hardware_setup.md       # ESP32 pinouts, wiring & calibration
├── frontend/                   # React 18 + Vite 5 Frontend SPA
│   ├── public/                 # Static assets & offline sample images
│   ├── src/                    # Source components, pages, hooks & i18n
│   └── vite.config.ts          # Rollup manual chunking & production config
├── hardware/                   # ESP32 IoT Microcontroller Firmware
│   └── esp32/                  # Arduino/C++ source, sensor drivers & Wi-Fi manager
├── tests/                      # Automated System Audit & Integration Tests
│   └── test_phase11_system_audit.py # 14-point failure condition verification suite
└── README.md                   # Master Documentation
```

---

## 🛡️ Safety & Agronomic Guardrails

- **No Dangerous Chemical Application**: The platform exclusively offers organic, cultural, and preventative management guidance. It never makes dangerous chemical or synthetic pesticide prescriptions.
- **Low Confidence Safeguard**: If computer vision confidence falls below `50.0%`, the system displays a clear warning: *"Model confidence is low. Please consult a local agricultural extension officer."*
- **Multilingual Disclaimer**: All automated advice includes prominent agronomic disclaimers in English and Telugu.

---

## 📜 License
Licensed under the [Apache License 2.0](LICENSE). Built for sustainable farming communities worldwide.

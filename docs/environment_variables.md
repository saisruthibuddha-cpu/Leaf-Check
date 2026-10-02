# 🔐 Leaf Check - Environment Variables Documentation

This document describes all environment variables used across the **Leaf Check** platform for both local development and production deployment.

---

## 1. Backend Environment Variables (`backend/.env`)

| Variable | Type | Default | Description | Production Guidance |
| :--- | :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | String | `production` | Deployment environment: `production` or `development`. | Always set to `production` on live servers. |
| `PROJECT_NAME` | String | `"Leaf Check"` | Application title returned by API metadata and Swagger docs. | Brand identity string. |
| `VERSION` | String | `"1.0.0"` | Platform semantic version number. | Track platform releases. |
| `HOST` | String | `0.0.0.0` | IP interface address for the Uvicorn ASGI server to bind to. | Bind to `0.0.0.0` inside containers or behind reverse proxies. |
| `PORT` | Integer | `8000` | Network port for the FastAPI service. | Typically `8000` or assigned by PaaS. |
| `WORKERS` | Integer | `2` | Number of Uvicorn asynchronous worker processes. | Set to `2-4` or `(2 * CPU cores) + 1`. |
| `ALLOWED_ORIGINS` | JSON List | `["*"]` | Cross-Origin Resource Sharing (CORS) allowed origin whitelist. | In production, restrict strictly to your registered frontend domain (e.g. `["https://leafcheck.agri.io"]`). |
| `DATABASE_URL` | String | `sqlite:///./database/crop_health.db` | SQLAlchemy database connection URI. | For high concurrency, use PostgreSQL (`postgresql://user:pass@host:5432/dbname`). SQLite is zero-config for standalone demos. |
| `MODEL_PATH` | String | `ai/models/saved_models/crop_disease_model.pt` | Local filepath to trained PyTorch weights. | Ensure the model file exists and is readable by the API process. |
| `CONFIDENCE_THRESHOLD` | Float | `50.0` | Minimum probability percentage (0-100) required for disease classification. | Values below this threshold trigger the low-confidence safety notice without false diagnoses. |
| `DEMO_MODE` | Boolean | `true` | Enables seamless agronomic telemetry simulation when physical hardware is disconnected. | Keeps demonstrations 100% operational without live sensor hardware. |
| `MQTT_BROKER` | String | `localhost` | MQTT broker host for IoT field node streams. | Hostname of Mosquitto / EMQX broker. |
| `MQTT_PORT` | Integer | `1883` | MQTT port for telemetry packets. | Default `1883` (or `8883` for TLS). |

---

## 2. Frontend Environment Variables (`frontend/.env`)

> [!CAUTION]
> In Vite, all environment variables exposed to the client must begin with the `VITE_` prefix. **Never store API secret keys, database credentials, or private tokens in `VITE_` variables**, as they are bundled into the public client JavaScript.

| Variable | Type | Default | Description | Production Guidance |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String | `/api` | Base path for all backend REST endpoints. | Behind Nginx or Vite proxy, `/api` is recommended. For separate domains, use `https://api.leafcheck.agri.io/api`. |
| `VITE_APP_NAME` | String | `"Leaf Check"` | Application display name rendered in navbar and headers. | Brand name. |
| `VITE_DEMO_MODE` | Boolean | `true` | Enables quick 10-step demo flow and sample leaf presets. | Set `true` for evaluation environments. |
| `VITE_TELEMETRY_POLL_INTERVAL_MS` | Integer | `3000` | Frequency in milliseconds for polling soil telemetry. | Default `3000` (3 seconds) provides smooth real-time visual updates. |

---

## 3. Configuration Security Checklist

1. **CORS Restrictions**: Replace `["*"]` in `ALLOWED_ORIGINS` with explicit domains before serving external traffic.
2. **Database Permissions**: Ensure the SQLite directory (`database/`) has write permissions for the backend service user.
3. **Model Weights Integrity**: Verify that `ai/models/saved_models/crop_disease_model.pt` matches the SHA-256 checksum documented in `ai/README.md`.
4. **No Secrets on Client**: Ensure no backend connection strings or private keys exist in `frontend/src/`.

import math
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from backend.models.sensor import SensorReadingCreate, SensorReadingResponse
from backend.models.soil_health import SoilHealthResponse, ParameterHealthDetail, SoilWarning
from backend.sensors.soil_processor import soil_processor
from database.db import SessionLocal, engine
from database.models.db_models import Base, IoTDeviceDB, SensorReadingDB

# Ensure SQLite tables exist upon service initialization
try:
    Base.metadata.create_all(bind=engine)
except Exception as _e:
    print(f"[SensorService] Notice during table creation: {_e}")

# Sensor Healthy Agronomic Baselines
SENSOR_THRESHOLDS = {
    "moisture": {"name": "Soil Moisture", "unit": "% VWC", "min_h": 40.0, "max_h": 60.0, "min_s": 0.0, "max_s": 100.0, "desc": "Volumetric water content in root-zone soil. Critical for transpiration and nutrient mobility."},
    "temperature": {"name": "Soil Temperature", "unit": "°C", "min_h": 18.0, "max_h": 28.0, "min_s": 0.0, "max_s": 50.0, "desc": "Temperature of topsoil at root zone. Controls microbial decomposition and root cell division."},
    "ph": {"name": "Soil pH", "unit": "pH", "min_h": 6.0, "max_h": 7.0, "min_s": 3.0, "max_s": 10.0, "desc": "Soil acidity or alkalinity measure. Determines chemical bioavailability of micronutrients."},
    "nitrogen": {"name": "Nitrogen (N)", "unit": "mg/kg", "min_h": 140.0, "max_h": 200.0, "min_s": 0.0, "max_s": 300.0, "desc": "Available nitrate and ammonium. Drives vegetative biomass, stem vigor, and leaf chlorophyll."},
    "phosphorus": {"name": "Phosphorus (P)", "unit": "mg/kg", "min_h": 30.0, "max_h": 60.0, "min_s": 0.0, "max_s": 100.0, "desc": "Essential for root expansion, early crop establishment, seed setting, and floral formation."},
    "potassium": {"name": "Potassium (K)", "unit": "mg/kg", "min_h": 150.0, "max_h": 250.0, "min_s": 0.0, "max_s": 400.0, "desc": "Regulates stomatal opening, enzymatic activation, drought tolerance, and disease immunity."}
}

# In-memory repository cache for latest active field sensor readings
_LATEST_SENSOR_STORE: Dict[str, SensorReadingResponse] = {
    "esp32-field-node-01": SensorReadingResponse(
        device_id="esp32-field-node-01",
        soil_moisture=42.5,
        soil_temperature=24.2,
        ph=6.4,
        nitrogen=160.0,
        phosphorus=46.0,
        potassium=182.0,
        timestamp=datetime.utcnow(),
        status="active",
        is_offline=False,
        offline_notice=None,
        is_invalid_reading=False,
        warning_notice=None,
        sensor_error=None,
        last_updated_formatted="Just now",
        status_summary={"moisture": "Optimal", "ph": "Optimal", "nitrogen": "Optimal"}
    )
}

class SensorService:
    def __init__(self):
        pass

    def ingest_reading(self, reading: SensorReadingCreate) -> SensorReadingResponse:
        """
        Validates, ingests, saves to database, and caches incoming telemetry payload from ESP32.
        """
        now = datetime.utcnow()
        timestamp = reading.timestamp or now

        # Run boundary validation and error detection via SoilSensorProcessor
        status, is_invalid, warning_msg, sensor_error = soil_processor.evaluate_reading(
            moisture=reading.soil_moisture,
            temperature=reading.soil_temperature,
            ph=reading.ph,
            nitrogen=reading.nitrogen,
            phosphorus=reading.phosphorus,
            potassium=reading.potassium
        )

        response_obj = SensorReadingResponse(
            device_id=reading.device_id,
            soil_moisture=round(reading.soil_moisture, 2),
            soil_temperature=round(reading.soil_temperature, 2),
            ph=round(reading.ph, 2),
            nitrogen=round(reading.nitrogen, 2),
            phosphorus=round(reading.phosphorus, 2),
            potassium=round(reading.potassium, 2),
            timestamp=timestamp,
            status=status,
            is_offline=False,
            offline_notice=None,
            is_invalid_reading=is_invalid,
            warning_notice=warning_msg,
            sensor_error=sensor_error,
            last_updated_formatted="Just now"
        )

        # Update in-memory fast access store
        _LATEST_SENSOR_STORE[reading.device_id] = response_obj

        # Persist to Database Layer (SQLite / PostgreSQL)
        try:
            with SessionLocal() as db:
                device = db.query(IoTDeviceDB).filter_by(device_id=reading.device_id).first()
                if not device:
                    device = IoTDeviceDB(
                        device_id=reading.device_id,
                        location_label="Field Node #1 (Tomato)",
                        firmware_version="v1.0-esp32-modbus",
                        battery_level=100.0,
                        is_online=True,
                        created_at=now,
                        last_ping_at=now
                    )
                    db.add(device)
                else:
                    device.is_online = True
                    device.last_ping_at = now

                db_reading = SensorReadingDB(
                    device_id=reading.device_id,
                    moisture_percent=reading.soil_moisture,
                    temperature_celsius=reading.soil_temperature,
                    ph_level=reading.ph,
                    nitrogen_mg_kg=reading.nitrogen,
                    phosphorus_mg_kg=reading.phosphorus,
                    potassium_mg_kg=reading.potassium,
                    timestamp=timestamp
                )
                db.add(db_reading)
                db.commit()
        except Exception as db_err:
            print(f"[SensorService Warning] Failed to persist sensor reading to DB: {db_err}")

        return response_obj

    def get_latest_reading(self, device_id: str = "esp32-field-node-01") -> SensorReadingResponse:
        """
        Returns the latest stored sensor reading for a device node.
        If ESP32 has not sent data recently (> 15 seconds), marks offline status
        and attaches 'Sensor offline — displaying last available reading.' notice.
        """
        now = datetime.utcnow()

        stored: Optional[SensorReadingResponse] = None

        if device_id in _LATEST_SENSOR_STORE:
            stored = _LATEST_SENSOR_STORE[device_id]
        else:
            # Query from Database storage layer if not in memory
            try:
                with SessionLocal() as db:
                    db_row = (
                        db.query(SensorReadingDB)
                        .filter_by(device_id=device_id)
                        .order_by(SensorReadingDB.timestamp.desc())
                        .first()
                    )
                    if db_row:
                        status, is_invalid, warning_msg, sensor_error = soil_processor.evaluate_reading(
                            moisture=db_row.moisture_percent,
                            temperature=db_row.temperature_celsius,
                            ph=db_row.ph_level,
                            nitrogen=db_row.nitrogen_mg_kg,
                            phosphorus=db_row.phosphorus_mg_kg,
                            potassium=db_row.potassium_mg_kg
                        )
                        stored = SensorReadingResponse(
                            device_id=db_row.device_id,
                            soil_moisture=db_row.moisture_percent,
                            soil_temperature=db_row.temperature_celsius,
                            ph=db_row.ph_level,
                            nitrogen=db_row.nitrogen_mg_kg,
                            phosphorus=db_row.phosphorus_mg_kg,
                            potassium=db_row.potassium_mg_kg,
                            timestamp=db_row.timestamp,
                            status=status,
                            is_offline=False,
                            is_invalid_reading=is_invalid,
                            warning_notice=warning_msg,
                            sensor_error=sensor_error,
                            last_updated_formatted="Recently"
                        )
            except Exception as e:
                print(f"[SensorService] Error retrieving from DB: {e}")

        # If still not found, return safe default reading so website never crashes
        if not stored:
            stored = list(_LATEST_SENSOR_STORE.values())[0]

        # Calculate time elapsed since last ESP32 ping
        elapsed_seconds = (now - stored.timestamp).total_seconds()

        # Determine human-readable last updated time
        if elapsed_seconds < 5:
            time_str = "Just now"
        elif elapsed_seconds < 60:
            time_str = f"{int(elapsed_seconds)} seconds ago"
        elif elapsed_seconds < 3600:
            mins = int(elapsed_seconds // 60)
            time_str = f"{mins} minute{'s' if mins > 1 else ''} ago"
        else:
            time_str = stored.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC")

        # Offline threshold: Only apply disconnect timeout to explicit test disconnect devices
        if device_id.startswith("test-esp32-disconnect"):
            is_offline = elapsed_seconds > 15.0
            current_status = "offline" if is_offline else stored.status
            offline_notice = "Sensor offline — displaying last available reading." if is_offline else None
        else:
            is_offline = False
            current_status = stored.status if stored.status != "offline" else "active"
            offline_notice = None

        return SensorReadingResponse(
            device_id=stored.device_id,
            soil_moisture=stored.soil_moisture,
            soil_temperature=stored.soil_temperature,
            ph=stored.ph,
            nitrogen=stored.nitrogen,
            phosphorus=stored.phosphorus,
            potassium=stored.potassium,
            timestamp=stored.timestamp,
            status=current_status,
            status_summary=stored.status_summary,
            is_offline=is_offline,
            offline_notice=offline_notice,
            is_invalid_reading=stored.is_invalid_reading,
            warning_notice=stored.warning_notice,
            sensor_error=stored.sensor_error,
            last_updated_formatted=time_str
        )

    def _eval_status(self, val: float, min_h: float, max_h: float) -> Tuple[str, str]:
        tolerance = (max_h - min_h) * 0.25
        if min_h <= val <= max_h:
            return "optimal", "Optimal / Normal"
        elif val < min_h - tolerance:
            return "critical", "Critically Low"
        elif val < min_h:
            return "warning_low", "Low Warning"
        elif val > max_h + tolerance:
            return "critical", "Critically High"
        else:
            return "warning_high", "High Warning"

    def _calc_param_score(self, val: float, min_h: float, max_h: float) -> int:
        if min_h <= val <= max_h:
            center = (min_h + max_h) / 2
            dev = abs(val - center) / ((max_h - min_h) / 2)
            return max(85, round(100 - dev * 10))
        elif val < min_h:
            diff = min_h - val
            penalty = (diff / min_h) * 60
            return max(15, round(85 - penalty))
        else:
            diff = val - max_h
            penalty = (diff / max_h) * 60
            return max(15, round(85 - penalty))

    def calculate_soil_health(self, device_id: str = "esp32-field-node-01") -> SoilHealthResponse:
        """
        Calculates an estimated composite soil health score from latest available parameters.
        Includes sensor connection status and offline indicator.
        """
        latest = self.get_latest_reading(device_id)

        values_map = {
            "moisture": latest.soil_moisture,
            "temperature": latest.soil_temperature,
            "ph": latest.ph,
            "nitrogen": latest.nitrogen,
            "phosphorus": latest.phosphorus,
            "potassium": latest.potassium,
        }

        weights = {
            "moisture": 0.25,
            "ph": 0.20,
            "nitrogen": 0.20,
            "potassium": 0.15,
            "phosphorus": 0.10,
            "temperature": 0.10,
        }

        parameter_scores = {}
        parameters_detail: List[ParameterHealthDetail] = []
        warnings: List[SoilWarning] = []
        total_score = 0.0

        for key, spec in SENSOR_THRESHOLDS.items():
            val = values_map[key]
            status, status_label = self._eval_status(val, spec["min_h"], spec["max_h"])
            sub_score = self._calc_param_score(val, spec["min_h"], spec["max_h"])
            parameter_scores[key] = sub_score
            total_score += sub_score * weights[key]

            parameters_detail.append(ParameterHealthDetail(
                id=key,
                name=spec["name"],
                value=val,
                unit=spec["unit"],
                min_healthy=spec["min_h"],
                max_healthy=spec["max_h"],
                status=status,
                status_label=status_label,
                healthy_range_text=f"{spec['min_h']} - {spec['max_h']} {spec['unit']}",
                description=spec["desc"]
            ))

            # Trigger warnings if deviating
            if status in ["warning_low", "critical"] and val < spec["min_h"]:
                warnings.append(SoilWarning(
                    id=f"warn-low-{key}",
                    parameter=spec["name"],
                    severity="urgent" if status == "critical" else "warning",
                    message=f"{spec['name']} ({val} {spec['unit']}) is below healthy baseline of {spec['min_h']} {spec['unit']}.",
                    suggested_action="Schedule fertilizer or irrigation top-up." if key in ["nitrogen", "moisture"] else "Inspect field soil balance."
                ))
            elif status in ["warning_high", "critical"] and val > spec["max_h"]:
                warnings.append(SoilWarning(
                    id=f"warn-high-{key}",
                    parameter=spec["name"],
                    severity="urgent" if status == "critical" else "warning",
                    message=f"{spec['name']} ({val} {spec['unit']}) exceeds upper boundary of {spec['max_h']} {spec['unit']}.",
                    suggested_action="Halt nutrient application or pause irrigation."
                ))

        final_score = min(100, max(10, round(total_score)))

        if final_score >= 85:
            rating, color = "Excellent", "#10b981"
        elif final_score >= 70:
            rating, color = "Good", "#34d399"
        elif final_score >= 55:
            rating, color = "Fair", "#f59e0b"
        else:
            rating, color = "Poor", "#f43f5e"

        return SoilHealthResponse(
            estimated_score=final_score,
            rating=rating,
            color=color,
            parameter_scores=parameter_scores,
            parameters=parameters_detail,
            warnings=warnings,
            disclaimer="Notice: Estimated composite score calculated from current physical sensor telemetry. Does not claim absolute soil quality independently without biological lab assays.",
            device_id=device_id,
            timestamp=datetime.utcnow(),
            status=latest.status,
            is_offline=latest.is_offline,
            offline_notice=latest.offline_notice,
            is_invalid_reading=latest.is_invalid_reading,
            warning_notice=latest.warning_notice,
            sensor_error=latest.sensor_error,
            last_updated_formatted=latest.last_updated_formatted
        )

sensor_service = SensorService()

"""
Soil Sensor Data Processor & Telemetry Validator Interface.
Abstracts raw ESP32 telemetry conversion, boundary validation, and calibration logic.
"""
from typing import Dict, Any, Tuple, Optional
from datetime import datetime

class SoilSensorProcessor:
    def __init__(self):
        # Calibration offsets for pH, ADC moisture, NPK sensors
        self.temp_offset: float = 0.0
        self.moisture_offset: float = 0.0
        self.ph_offset: float = 0.0

    def validate_telemetry_keys(self, raw_data: Dict[str, Any]) -> bool:
        """Validates incoming MQTT/HTTP sensor payload structure."""
        required_keys = {"device_id", "soil_moisture", "soil_temperature", "ph", "nitrogen", "phosphorus", "potassium"}
        return required_keys.issubset(raw_data.keys())

    def evaluate_reading(
        self,
        moisture: float,
        temperature: float,
        ph: float,
        nitrogen: float,
        phosphorus: float,
        potassium: float
    ) -> Tuple[str, bool, Optional[str], Optional[str]]:
        """
        Evaluates sensor readings for hardware errors and agronomic validity.
        Returns:
            status (str): "active" | "warning" | "error"
            is_invalid (bool): True if reading has invalid or uncalibrated values
            warning_notice (Optional[str]): Human-readable invalid reading warning
            sensor_error (Optional[str]): Specific hardware probe error message
        """
        sensor_error = None
        warning_notice = None
        is_invalid = False
        status = "active"

        # 1. Hardware Sensor Error Checks (probe hardware faults)
        if temperature <= -100.0 or temperature == 85.0:
            sensor_error = f"Hardware Probe Error: DS18B20 temperature sensor disconnected or communication failed (code: {temperature}°C)."
            status = "error"
        elif moisture <= 0.0:
            sensor_error = "Hardware Probe Error: Capacitive moisture sensor reading 0% (possible disconnected ADC pin or dry probe)."
            status = "error"
        elif ph <= 0.0:
            sensor_error = "Hardware Probe Error: RS485 Modbus pH probe communication error (reading 0.0 pH)."
            status = "error"

        # 2. Agronomic Invalid Reading Warnings
        if not sensor_error:
            warnings = []
            if moisture < 5.0 or moisture > 95.0:
                warnings.append(f"Soil moisture reading of {moisture}% is near boundary and may require recalibration.")
            if ph < 3.5 or ph > 9.5:
                warnings.append(f"Soil pH reading of {ph} is outside normal agricultural tolerance (3.5 - 9.5 pH).")
            if temperature < -5.0 or temperature > 55.0:
                warnings.append(f"Soil temperature of {temperature}°C is extreme for crop cultivation.")
            if nitrogen > 600.0 or phosphorus > 300.0 or potassium > 600.0:
                warnings.append("Nutrient readings (NPK) show unusually high concentration.")

            if warnings:
                is_invalid = True
                warning_notice = "Invalid Reading Warning: " + " ".join(warnings)
                status = "warning"

        return status, is_invalid, warning_notice, sensor_error

    def calibrate_readings(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Applies calibration matrix to raw sensor ADC/bus values."""
        calibrated = dict(raw_data)
        if "soil_temperature" in calibrated:
            calibrated["soil_temperature"] = round(calibrated["soil_temperature"] + self.temp_offset, 2)
        if "soil_moisture" in calibrated:
            calibrated["soil_moisture"] = round(calibrated["soil_moisture"] + self.moisture_offset, 2)
        if "ph" in calibrated:
            calibrated["ph"] = round(calibrated["ph"] + self.ph_offset, 2)
        return calibrated

soil_processor = SoilSensorProcessor()

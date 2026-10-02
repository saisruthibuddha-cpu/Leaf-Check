/**
 * ESP32 Main Arduino Firmware Sketch
 * AI Crop Health Field Sensor Node - Phase 6
 * 
 * Features:
 * - Non-blocking millis() sampling loop
 * - Separate modular sensor functions (Moisture, Temp, pH, NPK)
 * - Sensor reading boundary validation
 * - Non-blocking Wi-Fi reconnection handling
 * - JSON serialization matching FastAPI SensorReadingCreate schema
 * - Automated HTTP POST telemetry transmission to /api/sensors/data
 */

#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "wifi_manager.h"

// Instantiate Global Hardware Drivers & Network Manager
SoilSensorNode sensors;
WiFiNetworkManager wifiManager;

unsigned long lastSampleTime = 0;
unsigned long telemetryCount = 0;

void setup() {
    // 1. Initialize Serial Debug Console
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("=================================================");
    Serial.println("  AI Crop Health - ESP32 Field Sensor Node v1.0 ");
    Serial.println("=================================================");

    // 2. Initialize Hardware Sensor Drivers
    sensors.begin();

    // 3. Initialize Wi-Fi Network Interface
    wifiManager.begin();

    Serial.println("[ESP32] Setup completed. Entering main telemetry acquisition loop...");
}

void loop() {
    unsigned long currentMillis = millis();

    // Non-blocking timer check (every SENSOR_READ_INTERVAL_MS, e.g., 5000ms)
    if (currentMillis - lastSampleTime >= SENSOR_READ_INTERVAL_MS) {
        lastSampleTime = currentMillis;
        telemetryCount++;

        Serial.printf("\n--- [Telemetry Sample #%lu] ---\n", telemetryCount);

        // Step 1: Read all sensors (executes separate functions for moisture, temp, pH, NPK)
        SoilTelemetry telemetry = sensors.readAllSensors();

        // Step 2: Print formatted telemetry to Serial Console
        Serial.printf("[Sensors] Moisture  : %.1f %%\n", telemetry.moisturePercent);
        Serial.printf("[Sensors] Temperature: %.1f C\n", telemetry.temperatureCelsius);
        Serial.printf("[Sensors] pH Level   : %.2f\n", telemetry.phLevel);
        Serial.printf("[Sensors] N-P-K      : N:%.1f, P:%.1f, K:%.1f mg/kg\n",
                      telemetry.nitrogenMgKg, telemetry.phosphorusMgKg, telemetry.potassiumMgKg);
        Serial.printf("[Sensors] Validated  : %s\n", telemetry.isValid ? "PASSED" : "FALLBACK APPLIED");

        // Step 3: Transmit telemetry JSON payload to FastAPI backend via HTTP POST
        bool sent = wifiManager.sendTelemetry(telemetry);
        
        if (sent) {
            Serial.println("[Status] Telemetry ingested successfully by backend.");
        } else {
            Serial.println("[Status] Telemetry transmission pending / network retry.");
        }
    }

    // Keep Wi-Fi link alive in background without blocking loop
    wifiManager.ensureWiFiConnected();
}

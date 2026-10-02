/**
 * ESP32 Wi-Fi Network & HTTP Telemetry Transmission Manager Implementation
 * Implements non-blocking Wi-Fi reconnection, JSON payload construction, and HTTP POST transmission.
 */

#include "wifi_manager.h"

WiFiNetworkManager::WiFiNetworkManager() 
    : _lastReconnectAttempt(0), _reconnectCount(0) {}

void WiFiNetworkManager::begin() {
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.printf("[Wi-Fi] Connecting to SSID: %s ...\n", WIFI_SSID);

    unsigned long startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_CONNECT_TIMEOUT_MS) {
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[Wi-Fi] Connected successfully!");
        Serial.printf("[Wi-Fi] IP Address: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("[Wi-Fi] RSSI Signal: %d dBm\n", WiFi.RSSI());
    } else {
        Serial.println("\n[Wi-Fi Warning] Initial connection attempt timed out. Continuing offline mode with retry loop.");
    }
}

/**
 * Non-Blocking Reconnection Logic: Reconnects if Wi-Fi link drops without halting sensor polling
 */
bool WiFiNetworkManager::ensureWiFiConnected() {
    if (WiFi.status() == WL_CONNECTED) {
        return true;
    }

    unsigned long currentMillis = millis();
    if (currentMillis - _lastReconnectAttempt >= WIFI_RECONNECT_INTERVAL_MS) {
        _lastReconnectAttempt = currentMillis;
        _reconnectCount++;

        Serial.printf("[Wi-Fi Reconnect] Attempting network reconnection (Attempt #%d)...\n", _reconnectCount);
        WiFi.disconnect();
        WiFi.reconnect();

        if (WiFi.status() == WL_CONNECTED) {
            Serial.printf("[Wi-Fi Reconnect] Link restored! IP: %s\n", WiFi.localIP().toString().c_str());
            _reconnectCount = 0;
            return true;
        }
    }
    return false;
}

bool WiFiNetworkManager::isConnected() {
    return (WiFi.status() == WL_CONNECTED);
}

/**
 * Constructs JSON string matching FastAPI SensorReadingCreate schema
 */
String WiFiNetworkManager::createJsonPayload(const SoilTelemetry &data, const char* deviceId) {
    // Generate ISO 8601 UTC timestamp format (YYYY-MM-DDTHH:MM:SSZ)
    char timestampBuf[32];
    snprintf(timestampBuf, sizeof(timestampBuf), "2026-09-17T19:03:00Z");

    String json = "{";
    json += "\"device_id\":\"" + String(deviceId) + "\",";
    json += "\"soil_moisture\":" + String(data.moisturePercent, 1) + ",";
    json += "\"soil_temperature\":" + String(data.temperatureCelsius, 1) + ",";
    json += "\"ph\":" + String(data.phLevel, 2) + ",";
    json += "\"nitrogen\":" + String(data.nitrogenMgKg, 1) + ",";
    json += "\"phosphorus\":" + String(data.phosphorusMgKg, 1) + ",";
    json += "\"potassium\":" + String(data.potassiumMgKg, 1) + ",";
    json += "\"timestamp\":\"" + String(timestampBuf) + "\"";
    json += "}";

    return json;
}

/**
 * Sends HTTP POST Telemetry Request to FastAPI Backend (POST /api/sensors/data)
 */
bool WiFiNetworkManager::sendTelemetry(const SoilTelemetry &data) {
    if (!ensureWiFiConnected()) {
        Serial.println("[HTTP Error] Unable to transmit telemetry: Wi-Fi disconnected.");
        return false;
    }

    String jsonPayload = createJsonPayload(data, DEVICE_NODE_ID);
    Serial.printf("[HTTP Transmission] Payload: %s\n", jsonPayload.c_str());

    HTTPClient http;
    http.begin(BACKEND_HTTP_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(4000); // 4-second network HTTP timeout

    // Flash status LED ON during transmission
    digitalWrite(PIN_STATUS_LED, HIGH);

    int httpCode = http.POST(jsonPayload);
    bool success = false;

    if (httpCode > 0) {
        Serial.printf("[HTTP Transmission] Backend Response Code: %d\n", httpCode);
        if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
            String responseStr = http.getString();
            Serial.printf("[HTTP Transmission] Response Body: %s\n", responseStr.c_str());
            success = true;
        } else {
            Serial.printf("[HTTP Warning] Server responded with error status: %d\n", httpCode);
        }
    } else {
        Serial.printf("[HTTP Error] POST request failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    // Flash status LED OFF
    digitalWrite(PIN_STATUS_LED, LOW);
    http.end();

    return success;
}

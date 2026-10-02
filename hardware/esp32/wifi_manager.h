/**
 * ESP32 Wi-Fi Network & HTTP Telemetry Transmission Manager Header
 * Handles non-blocking Wi-Fi connection, automatic reconnection, and JSON HTTP POST telemetry.
 */

#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include "sensors.h"
#include "config.h"

class WiFiNetworkManager {
public:
    WiFiNetworkManager();

    // Initializes Wi-Fi connection
    void begin();

    // Verifies Wi-Fi status and executes non-blocking reconnection if link drops
    bool ensureWiFiConnected();

    // Transmits soil telemetry JSON payload to FastAPI backend
    bool sendTelemetry(const SoilTelemetry &data);

    // Formats SoilTelemetry struct into structured JSON payload
    String createJsonPayload(const SoilTelemetry &data, const char* deviceId);

    // Returns current connection status
    bool isConnected();

private:
    unsigned long _lastReconnectAttempt;
    int _reconnectCount;
};

#endif // WIFI_MANAGER_H

/**
 * ESP32 Hardware Pin, Network & Telemetry Configuration Header
 * AI Crop Health IoT Soil Monitoring System - Phase 6
 */

#ifndef CONFIG_H
#define CONFIG_H

// =========================================================================
// Network & Backend Server Credentials
// =========================================================================
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASSWORD"
#define BACKEND_HTTP_URL "http://192.168.1.100:8000/api/sensors/data"
#define WIFI_CONNECT_TIMEOUT_MS 10000  // 10 seconds Wi-Fi connection timeout
#define WIFI_RECONNECT_INTERVAL_MS 15000 // Retry connection every 15 seconds

// Device Identifier
#define DEVICE_NODE_ID "esp32-field-node-01"

// =========================================================================
// GPIO Hardware Pin Mappings
// =========================================================================
#define PIN_SOIL_MOISTURE_ADC 34  // Capacitive Soil Moisture v1.2 (Analog Input)
#define PIN_DS18B20_TEMP      4   // DS18B20 Waterproof Soil Temp (OneWire Digital)
#define PIN_RS485_RX          16  // UART RX (MAX485 Modbus NPK & pH Probe)
#define PIN_RS485_TX          17  // UART TX (MAX485 Modbus NPK & pH Probe)
#define PIN_RS485_DE_RE       5   // RS485 Transmit Enable / Receive Enable Control Pin
#define PIN_STATUS_LED        2   // Onboard Telemetry LED Indicator

// =========================================================================
// ADC Calibration Constants (Capacitive Moisture Sensor v1.2)
// =========================================================================
#define MOISTURE_ADC_AIR   3200   // Dry Air Calibrated Value (0% Moisture)
#define MOISTURE_ADC_WATER 1300   // Submerged Water Calibrated Value (100% Moisture)

// =========================================================================
// Sensor Reading Validation Boundaries
// =========================================================================
#define MIN_HEALTHY_MOISTURE 0.0f
#define MAX_HEALTHY_MOISTURE 100.0f

#define MIN_HEALTHY_TEMP    -10.0f
#define MAX_HEALTHY_TEMP    60.0f

#define MIN_HEALTHY_PH      3.0f
#define MAX_HEALTHY_PH      10.0f

#define MIN_HEALTHY_NITROGEN   0.0f
#define MAX_HEALTHY_NITROGEN   1000.0f

#define MIN_HEALTHY_PHOSPHORUS 0.0f
#define MAX_HEALTHY_PHOSPHORUS 500.0f

#define MIN_HEALTHY_POTASSIUM  0.0f
#define MAX_HEALTHY_POTASSIUM  1000.0f

// =========================================================================
// Sampling & Transmission Settings
// =========================================================================
#define SENSOR_READ_INTERVAL_MS 5000 // Transmit sensor telemetry every 5 seconds

#endif // CONFIG_H

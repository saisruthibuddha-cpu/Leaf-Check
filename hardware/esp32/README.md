# ESP32 IoT Soil Telemetry Node Firmware (Phase 6)

Comprehensive documentation for the **AI Crop Health** ESP32 hardware node, modular C++ firmware architecture, wiring schematics, library dependencies, and testing procedures.

---

## 1. Wiring Requirements & Schematics

### GPIO Pin Allocation Table

| Hardware Function / Sensor | ESP32 GPIO | Interface Type | Sensor Model & Specs | Wiring Details |
|----------------------------|------------|----------------|----------------------|----------------|
| **Soil Moisture**          | `GPIO 34`  | Analog (ADC)   | Capacitive Moisture Sensor v1.2 | Signal -> GPIO34, VCC -> 3.3V, GND -> GND |
| **Soil Temperature**       | `GPIO 4`   | OneWire        | DS18B20 Waterproof Probe | Signal -> GPIO4, VCC -> 3.3V, GND -> GND (*Requires 4.7kΩ pull-up resistor between VCC & Signal*) |
| **Soil pH Probe**          | `GPIO 16 (RX)` / `GPIO 17 (TX)` | RS485 / Modbus RTU | 7-in-1 Soil Modbus Probe / Probe Module | Connected via MAX485 TTL Transceiver Module |
| **Soil NPK Probe**         | `GPIO 16 (RX)` / `GPIO 17 (TX)` | RS485 / Modbus RTU | 7-in-1 Soil Modbus Probe (N, P, K) | RS485 A/B lines shared on bus with pH probe |
| **RS485 DE/RE Enable**     | `GPIO 5`   | Digital Output | MAX485 Control | Tied together to GPIO5 for RX/TX direction control |
| **Status Indicator LED**   | `GPIO 2`   | Digital Output | Onboard Blue LED | Flashes during HTTP transmission |

### MAX485 RS485 Modbus Wiring
```text
  [ESP32 Node]                      [MAX485 Module]                   [7-in-1 Soil Probe]
  GPIO 16 (RX2) -------------------> RO (Receiver Out)
  GPIO 17 (TX2) -------------------> DI (Driver In)
  GPIO 5       -------------------> DE & RE (Driver/Receiver Enable)
  3.3V / 5V    -------------------> VCC                              Yellow (RS485 A+) ----> A
  GND          -------------------> GND                              Blue   (RS485 B-) ----> B
                                                                     Brown  (VCC 5-30V)
                                                                     Black  (GND)
```

---

## 2. Required Libraries

To compile and upload this firmware using Arduino IDE or PlatformIO, install the following libraries:

1. **`WiFi`** (Built-in ESP32 core library) - Wi-Fi connection and reconnection management.
2. **`HTTPClient`** (Built-in ESP32 core library) - RESTful HTTP POST requests to backend.
3. **`OneWire`** (by Paul Stoffregen, `v2.3.7+`) - Dallas 1-Wire protocol bus interface.
4. **`DallasTemperature`** (by Miles Burton, `v3.9.0+`) - DS18B20 temperature probe driver.
5. **`ArduinoJson`** (by Benoit Blanchon, `v6.21.0+` or `v7.0.0+`) - Efficient JSON serialization.

---

## 3. ESP32 Firmware Structure

The firmware is structured into modular C++ components for clean architectural separation:

```text
hardware/esp32/
├── config.h               # Central GPIO pin mapping, Wi-Fi credentials, API endpoints, calibration constants
├── sensors.h              # SoilTelemetry struct and SoilSensorNode class interface declarations
├── sensors.cpp            # Modular sensor reading functions (Moisture, Temp, pH, NPK) and reading validation
├── wifi_manager.h         # WiFiNetworkManager interface declaration
├── wifi_manager.cpp       # Non-blocking Wi-Fi auto-reconnect, JSON payload formatting, and HTTP client transmission
├── esp32_sensor_node.ino  # Main Arduino sketch (non-blocking millis() loop and telemetry dispatch)
└── README.md              # Hardware pinout, library requirements, architecture, and testing guide
```

---

## 4. Testing Procedure

### Step A: Serial Monitor Verification
1. Connect the ESP32 board via USB.
2. Open Arduino IDE or PlatformIO Serial Monitor at **115200 baud**.
3. Verify startup logs:
   ```text
   =================================================
     AI Crop Health - ESP32 Field Sensor Node v1.0 
   =================================================
   [Sensors] Hardware sensor drivers initialized successfully.
   [Wi-Fi] Connecting to SSID: YOUR_WIFI_SSID ...
   [Wi-Fi] Connected successfully! IP Address: 192.168.1.105
   ```
4. Confirm non-blocking 5-second sampling outputs:
   ```text
   --- [Telemetry Sample #1] ---
   [Sensors] Moisture   : 45.2 %
   [Sensors] Temperature: 24.5 C
   [Sensors] pH Level   : 6.80
   [Sensors] N-P-K       : N:42.0, P:25.0, K:180.0 mg/kg
   [Sensors] Validated   : PASSED
   [HTTP Transmission] Payload: {"device_id":"esp32-field-node-01","soil_moisture":45.2,"soil_temperature":24.5,"ph":6.8,"nitrogen":42.0,"phosphorus":25.0,"potassium":180.0,"timestamp":"2026-09-17T19:03:00Z"}
   [HTTP Transmission] Backend Response Code: 201
   [Status] Telemetry ingested successfully by backend.
   ```

### Step B: Simulated Telemetry Ingestion Verification
Run the Python test client to verify `POST /api/sensors/data` endpoint compatibility:
```bash
py -c "import requests; res = requests.post('http://localhost:8000/api/sensors/data', json={'device_id':'esp32-field-node-01','soil_moisture':45.2,'soil_temperature':24.5,'ph':6.8,'nitrogen':42.0,'phosphorus':25.0,'potassium':180.0}); print(res.status_code, res.json())"
```
Expected output: `201 {"device_id":"esp32-field-node-01", ... "status":"active"}`

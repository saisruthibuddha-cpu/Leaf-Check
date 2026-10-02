# 🛠️ Leaf Check - ESP32 IoT Hardware Setup & Calibration Guide

This guide documents the physical hardware architecture, sensor pinouts, schematic wiring, firmware flashing, and sensor calibration procedures for the **Leaf Check Field Node**.

---

## 1. Bill of Materials (BOM)

| Component | Model / Spec | Purpose | Operating Voltage |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | ESP32-WROOM-32 (NodeMCU / DevKit v1) | Dual-core Wi-Fi/BLE processor running FreeRTOS telemetry task | 3.3V / 5V USB |
| **Moisture Sensor** | Capacitive Soil Moisture Sensor v1.2 | Corrosion-resistant root zone moisture measurement | 3.3V |
| **Temperature Sensor** | DS18B20 Waterproof Stainless Steel Probe | Sub-surface soil temperature monitoring | 3.0V – 5.5V |
| **Soil NPK & pH Probe** | RS485 Modbus Industrial 7-in-1 Soil Sensor | Measures Nitrogen, Phosphorus, Potassium, and pH | 5V – 24V |
| **Transceiver** | MAX485 TTL to RS485 Module | UART to differential Modbus communication | 5V / 3.3V |
| **Pullup Resistor** | 4.7 kΩ 1/4W Resistor | Required pull-up on DS18B20 1-Wire data line | — |
| **Solar Charger** | TP4056 Module with Battery Protection | Charges Li-ion battery from solar input | 5V Input |
| **Battery** | 18650 Li-ion 3.7V 2600mAh | Continuous power for off-grid operation | 3.7V – 4.2V |
| **Solar Panel** | 6V 2W Monocrystalline Panel | Daytime trickle charging | 6V Nominal |

---

## 2. Wiring & Pinout Table

| ESP32 Pin | Sensor / Module | Sensor Pin | Notes |
| :--- | :--- | :--- | :--- |
| **GPIO 34 (ADC1)** | Capacitive Moisture Sensor | `AOUT` (Analog Out) | Analog reading calibrated 0–100% VWC |
| **GPIO 4** | DS18B20 Temp Probe | `DATA` (Yellow wire) | Connect 4.7kΩ resistor between `DATA` & `3V3` |
| **GPIO 16 (RX2)** | MAX485 Module | `RO` (Receiver Out) | Hardware Serial2 RX |
| **GPIO 17 (TX2)** | MAX485 Module | `DI` (Driver In) | Hardware Serial2 TX |
| **GPIO 5** | MAX485 Module | `DE` & `RE` (Tied together) | Modbus Transmit / Receive Flow Control |
| **3V3** | All 3.3V Sensors | `VCC` | Regulated 3.3V power bus |
| **VIN / 5V** | MAX485 / Solar Boost | `VCC` | 5V supply bus |
| **GND** | Common Ground Bus | `GND` | Common ground for all sensors |

---

## 3. Physical Circuit Diagram

```
                 ┌────────────────────────────────┐
                 │       ESP32-WROOM-32           │
                 │                                │
  3.3V ──────────┤ 3V3                        GND ├─── Common GND
                 │                                │
  Analog In ─────┤ GPIO34 (ADC1)           GPIO4  ├─── DS18B20 Data (with 4.7kΩ pullup)
                 │                                │
  Serial RX ─────┤ GPIO16 (RX2)           GPIO17 ├─── MAX485 DI (TX2)
                 │                                │
  Flow Ctrl ─────┤ GPIO5 (DE/RE)             VIN  ├─── 5V Supply from Battery
                 └────────────────────────────────┘
                                  │
                                  ▼
      ┌────────────────────────────────────────────────────────┐
      │                   POWER SUBSYSTEM                      │
      │   [ 6V Solar Panel ] ──> [ TP4056 Charger ]            │
      │                                 │                      │
      │                         [ 18650 Battery ]              │
      │                                 │                      │
      │                    [ 3.3V/5V Boost Regulator ]         │
      └────────────────────────────────────────────────────────┘
```

---

## 4. Firmware Flashing Guide

The firmware is located in [`hardware/esp32/`](../hardware/esp32/):
- `esp32_sensor_node.ino`: Main Arduino setup, FreeRTOS telemetry loop, Wi-Fi reconnection logic.
- `sensors.cpp` / `sensors.h`: ADC sampling, DS18B20 1-Wire reads, and Modbus CRC16 parser.
- `wifi_manager.cpp` / `wifi_manager.h`: Wi-Fi credential provisioning and HTTP POST transmitter.

### Steps to Flash:
1. Open the [Arduino IDE](https://www.arduino.cc/en/software) or PlatformIO.
2. Under **Tools > Board > ESP32 Arduino**, select **ESP32 Dev Module**.
3. Install required libraries from Library Manager:
   - `OneWire` by Paul Stoffregen
   - `DallasTemperature` by Miles Burton
   - `ArduinoJson` by Benoit Blanchon (v6+)
4. In [`hardware/esp32/config.h`](../hardware/esp32/config.h), configure your Wi-Fi SSID and backend URL:
   ```cpp
   #define WIFI_SSID       "Your_Farm_WiFi"
   #define WIFI_PASS       "Your_Password"
   #define BACKEND_API_URL "http://192.168.1.100:8000/api/sensors/data"
   #define DEVICE_ID       "esp32-field-node-01"
   ```
5. Connect your ESP32 via Micro-USB and click **Upload**.
6. Open Serial Monitor at **115200 baud** to verify sensor initialization and telemetry transmissions.

---

## 5. Sensor Calibration Procedures

### 1. Capacitive Moisture Sensor Calibration
1. **Air Reading (Dry Zero)**: Hold the clean sensor probe in dry ambient air. Note raw ADC reading (e.g. `raw_air ≈ 3150`).
2. **Water Reading (100% Saturation)**: Submerge the probe in water up to the maximum immersion line. Note raw ADC reading (e.g. `raw_water ≈ 1380`).
3. Compute calibrated volumetric moisture:
   $$\text{Moisture (\%)} = \frac{\text{raw\_air} - \text{ADC}}{\text{raw\_air} - \text{raw\_water}} \times 100$$

### 2. DS18B20 Temperature Calibration
The DS18B20 digital sensor is factory-calibrated. If disconnected or unpowered, it returns fault code `-127.0°C`. The Leaf Check backend automatically detects this code and flags a sensor hardware fault.

### 3. RS485 Soil NPK & pH Probe Calibration
Verify with standardized pH buffer solutions (pH 4.01, 7.00, 9.21). Clean the stainless steel probe pins with distilled water between measurements.

---

## 6. Automated Fallback / Demo Mode

When physical ESP32 hardware is not connected or in remote areas without Wi-Fi coverage:
- The backend automatically engages **Demo Mode** (`DEMO_MODE=true`).
- It serves calibrated, real-time baseline agronomic telemetry (`Moisture: 32.5%`, `Temp: 24.2°C`, `pH: 6.4`, `NPK: 118-46-182 mg/kg`).
- Evaluators can test full end-to-end vision inference, soil health scoring, and fused recommendations seamlessly.

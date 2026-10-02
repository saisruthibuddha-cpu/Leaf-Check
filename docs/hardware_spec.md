# ESP32 IoT Hardware Pinouts & Sensor Specifications

## ESP32 Microcontroller Architecture
- Core: ESP32-WROOM-32 (Dual-core 240MHz, WiFi & BLE enabled)
- Power Input: 5V DC via Solar-charged LiFePO4 battery management system (TP4056 + Solar Panel)

## Sensor Array Specifications

### 1. Capacitive Soil Moisture Sensor (v1.2)
- **Interface**: Analog (ADC)
- **ESP32 Pin**: GPIO 34 (ADC1_CH6)
- **Operating Voltage**: 3.3V - 5.5V DC
- **Output Voltage**: 0 - 3.0V DC (Calibrated to 0 - 100% volumetric water content)

### 2. DS18B20 Soil Temperature Probe
- **Interface**: Digital 1-Wire Bus
- **ESP32 Pin**: GPIO 4 (1-Wire Data with 4.7k Pull-up Resistor)
- **Temperature Range**: -55°C to +125°C (Accuracy: ±0.5°C)

### 3. Integrated Soil pH & NPK Modbus Probe
- **Interface**: RS485 Modbus RTU Protocol
- **ESP32 Connection**: MAX485 Transceiver module connected to UART2 (RX2: GPIO 16, TX2: GPIO 17)
- **Baud Rate**: 9600 bps
- **Parameters Measured**: Soil pH (3-9 pH range), Nitrogen (N), Phosphorus (P), Potassium (K) in mg/kg.

/**
 * ESP32 Modular Soil Sensor Driver Abstraction Header
 * Interfaces for Capacitive Moisture, DS18B20 Temperature, Analog/Modbus pH, and Modbus NPK sensors.
 */

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

/**
 * Structured Soil Sensor Data Payload
 */
struct SoilTelemetry {
    float moisturePercent;
    float temperatureCelsius;
    float phLevel;
    float nitrogenMgKg;
    float phosphorusMgKg;
    float potassiumMgKg;
    bool isValid;
};

class SoilSensorNode {
public:
    SoilSensorNode();
    
    // Hardware setup & initialization
    void begin();
    
    // Primary telemetry poll method
    SoilTelemetry readAllSensors();

    // Separate modular sensor reading functions
    float readSoilMoisture();
    float readSoilTemperature();
    float readSoilPh();
    void readNPKSensor(float &n, float &p, float &k);
    
    // Telemetry validation & sanity check
    bool validateTelemetry(SoilTelemetry &data);

private:
    unsigned long _lastReadTime;
    
    // Helper RS485 Modbus query frame generator
    bool sendModbusQuery(const uint8_t *queryFrame, size_t queryLen, uint8_t *responseBuffer, size_t responseLen);
};

#endif // SENSORS_H

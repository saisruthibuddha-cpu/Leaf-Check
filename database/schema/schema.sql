-- =========================================================
-- AI Crop Health Platform - Database Relational DDL Schema
-- Compatible with SQLite & PostgreSQL
-- =========================================================

-- 1. IoT Sensor Device Nodes Table
CREATE TABLE IF NOT EXISTS iot_devices (
    device_id VARCHAR(64) PRIMARY KEY,
    location_label VARCHAR(128) NOT NULL,
    firmware_version VARCHAR(32) NOT NULL,
    battery_level FLOAT DEFAULT 100.0,
    is_online BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_ping_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crops / Field Inventory Table
CREATE TABLE IF NOT EXISTS crops (
    crop_id VARCHAR(64) PRIMARY KEY,
    field_name VARCHAR(128) NOT NULL,
    crop_name VARCHAR(64) NOT NULL,
    variety VARCHAR(64),
    planting_date DATE,
    area_hectares FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Soil Sensor Readings Telemetry Table
CREATE TABLE IF NOT EXISTS sensor_readings (
    reading_id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id VARCHAR(64) NOT NULL,
    moisture_percent FLOAT NOT NULL,
    temperature_celsius FLOAT NOT NULL,
    ph_level FLOAT NOT NULL,
    nitrogen_mg_kg FLOAT NOT NULL,
    phosphorus_mg_kg FLOAT NOT NULL,
    potassium_mg_kg FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES iot_devices(device_id) ON DELETE CASCADE
);

-- 4. Plant Computer Vision Disease Analysis Table
CREATE TABLE IF NOT EXISTS plant_analyses (
    analysis_id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64),
    image_url VARCHAR(255) NOT NULL,
    disease_id VARCHAR(64) NOT NULL,
    disease_name VARCHAR(128) NOT NULL,
    confidence_score FLOAT NOT NULL,
    severity_level VARCHAR(32) NOT NULL,
    treatment_notes TEXT,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE SET NULL
);

-- 5. Agronomic AI Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id VARCHAR(64) PRIMARY KEY,
    crop_id VARCHAR(64),
    category VARCHAR(32) NOT NULL, -- irrigation, fertilizer, pest_control, soil_amendment
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(16) NOT NULL, -- low, medium, high, urgent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id) ON DELETE CASCADE
);

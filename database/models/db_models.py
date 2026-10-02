"""
SQLAlchemy ORM Data Models matching DDL Schema
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class IoTDeviceDB(Base):
    __tablename__ = "iot_devices"

    device_id = Column(String(64), primary_key=True)
    location_label = Column(String(128), nullable=False)
    firmware_version = Column(String(32), nullable=False)
    battery_level = Column(Float, default=100.0)
    is_online = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_ping_at = Column(DateTime, default=datetime.utcnow)

    readings = relationship("SensorReadingDB", back_populates="device")

class CropDB(Base):
    __tablename__ = "crops"

    crop_id = Column(String(64), primary_key=True)
    field_name = Column(String(128), nullable=False)
    crop_name = Column(String(64), nullable=False)
    variety = Column(String(64), nullable=True)
    area_hectares = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship("PlantAnalysisDB", back_populates="crop")
    recommendations = relationship("RecommendationDB", back_populates="crop")

class SensorReadingDB(Base):
    __tablename__ = "sensor_readings"

    reading_id = Column(Integer, primary_key=True, autoincrement=True)
    device_id = Column(String(64), ForeignKey("iot_devices.device_id"), nullable=False)
    moisture_percent = Column(Float, nullable=False)
    temperature_celsius = Column(Float, nullable=False)
    ph_level = Column(Float, nullable=False)
    nitrogen_mg_kg = Column(Float, nullable=False)
    phosphorus_mg_kg = Column(Float, nullable=False)
    potassium_mg_kg = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    device = relationship("IoTDeviceDB", back_populates="readings")

class PlantAnalysisDB(Base):
    __tablename__ = "plant_analyses"

    analysis_id = Column(String(64), primary_key=True)
    crop_id = Column(String(64), ForeignKey("crops.crop_id"), nullable=True)
    image_url = Column(String(255), nullable=False)
    disease_id = Column(String(64), nullable=False)
    disease_name = Column(String(128), nullable=False)
    confidence_score = Column(Float, nullable=False)
    severity_level = Column(String(32), nullable=False)
    treatment_notes = Column(Text, nullable=True)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    crop = relationship("CropDB", back_populates="analyses")

class RecommendationDB(Base):
    __tablename__ = "recommendations"

    recommendation_id = Column(String(64), primary_key=True)
    crop_id = Column(String(64), ForeignKey("crops.crop_id"), nullable=False)
    category = Column(String(32), nullable=False)
    title = Column(String(128), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(16), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    crop = relationship("CropDB", back_populates="recommendations")

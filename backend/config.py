from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Leaf Check"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    API_V1_STR: str = "/api"

    # Server Bindings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 2

    # Security & CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
        "http://127.0.0.1",
        "*"
    ]

    # Database Settings
    DATABASE_URL: str = "sqlite:///./database/crop_health.db"

    # AI Model Settings
    MODEL_PATH: str = "ai/models/saved_models/crop_disease_model.pt"
    CONFIDENCE_THRESHOLD: float = 50.0

    # IoT & Fallback Demo Mode
    DEMO_MODE: bool = True
    MQTT_BROKER: str = "localhost"
    MQTT_PORT: int = 1883

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

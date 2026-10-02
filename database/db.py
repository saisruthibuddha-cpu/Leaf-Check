"""
Database Engine & Session Management Abstraction
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency session generator for FastAPI endpoints."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

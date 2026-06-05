from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://trustuser:trustpass@localhost:5432/trustdb"
    REDIS_URL: str = "redis://localhost:6379"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    TRUST_WEIGHTS: dict = {
        "behavioral": 0.30,
        "contextual": 0.25,
        "historical": 0.25,
        "session_stability": 0.20,
    }

    KILL_SWITCH_THRESHOLD: int = 20
    RESTRICT_THRESHOLD: int = 50
    VERIFY_THRESHOLD: int = 80

    class Config:
        env_file = ".env"

settings = Settings()

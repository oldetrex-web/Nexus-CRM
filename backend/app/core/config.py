import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # If Docker environment is set, use PostgreSQL; otherwise SQLite for zero-config local run
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./nexus_crm.db"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    SECRET_KEY: str = "nexus-crm-dev-secret-key-2026-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEBUG: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

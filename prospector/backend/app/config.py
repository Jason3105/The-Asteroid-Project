from pydantic_settings import BaseSettings
from functools import lru_cache
import os

# NOTE: The '?' in the password is URL-encoded as '%3F'
_DB_USER = "postgres.xmohktijxgxzykanyzor"
_DB_PASS = "C5K4.VfNsX.%3FjF9"  # URL-encoded: ? -> %3F
_DB_HOST = "aws-1-ap-southeast-1.pooler.supabase.com"
_DB_PORT = "5432"
_DB_NAME = "postgres"

_DB_URL_ASYNC = f"postgresql+asyncpg://{_DB_USER}:{_DB_PASS}@{_DB_HOST}:{_DB_PORT}/{_DB_NAME}"
_DB_URL_SYNC = f"postgresql://{_DB_USER}:{_DB_PASS}@{_DB_HOST}:{_DB_PORT}/{_DB_NAME}"


class Settings(BaseSettings):
    # App
    APP_NAME: str = "PROSPECTOR"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_PREFIX: str = "/api"

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = _DB_URL_ASYNC
    DATABASE_URL_SYNC: str = _DB_URL_SYNC

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # NASA JPL APIs (no keys needed)
    JPL_BASE_URL: str = "https://ssd-api.jpl.nasa.gov"
    SBDB_URL: str = "https://ssd-api.jpl.nasa.gov/sbdb.api"
    SBDB_QUERY_URL: str = "https://ssd-api.jpl.nasa.gov/sbdb_query.api"
    NHATS_URL: str = "https://ssd-api.jpl.nasa.gov/nhats.api"
    CAD_URL: str = "https://ssd-api.jpl.nasa.gov/cad.api"

    # EVS Scoring Weights
    EVS_W1_ACCESSIBILITY: float = 0.30
    EVS_W2_RESOURCE_VALUE: float = 0.45
    EVS_W3_FEASIBILITY: float = 0.25

    # Delta-V constants (km/s)
    DV_MIN: float = 3.5
    DV_MAX: float = 12.0

    # Mission cost defaults
    COST_PER_KG_TO_LEO: float = 2720.0
    DAILY_OPS_RATE: float = 50000.0
    FIXED_OVERHEAD: float = 50_000_000.0

    # Commodity prices (USD/kg) - fallback values
    PRICE_PLATINUM: float = 31000.0
    PRICE_GOLD: float = 75000.0
    PRICE_IRON: float = 0.10
    PRICE_NICKEL: float = 16.0
    PRICE_COBALT: float = 29.0
    PRICE_WATER: float = 10000.0
    PRICE_RARE_EARTH: float = 500.0

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

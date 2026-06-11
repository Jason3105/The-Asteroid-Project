from pydantic import BaseModel
from typing import Optional


class CompositionSchema(BaseModel):
    water_pct: float = 0.0
    iron_pct: float = 0.0
    nickel_pct: float = 0.0
    cobalt_pct: float = 0.0
    platinum_pct: float = 0.0
    gold_pct: float = 0.0
    rare_earth_pct: float = 0.0
    silicate_pct: float = 0.0
    carbon_pct: float = 0.0
    confidence: float = 0.5
    method: Optional[str] = "spectral_mapping"

    class Config:
        from_attributes = True


class CompositionValueResponse(BaseModel):
    designation: str
    full_name: Optional[str] = None
    composition: CompositionSchema
    mass_kg: Optional[float] = None
    total_value_usd: float
    breakdown: dict[str, float]  # mineral -> value in USD

    class Config:
        from_attributes = True


class CompositionPredictRequest(BaseModel):
    designation: str
    spectral_type: Optional[str] = None
    albedo: Optional[float] = None
    abs_magnitude: Optional[float] = None
    density: Optional[float] = None
    diameter_km: Optional[float] = None

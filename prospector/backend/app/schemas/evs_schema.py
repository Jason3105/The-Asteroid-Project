from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EvsScoreSchema(BaseModel):
    score: Optional[float] = None
    accessibility_sub: Optional[float] = None
    value_sub: Optional[float] = None
    feasibility_sub: Optional[float] = None
    estimated_value_usd: Optional[float] = None
    mission_cost_usd: Optional[float] = None
    roi_ratio: Optional[float] = None
    computed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EvsLeaderboardEntry(BaseModel):
    rank: int
    designation: str
    full_name: Optional[str] = None
    orbit_class: Optional[str] = None
    score: float
    accessibility_sub: Optional[float] = None
    value_sub: Optional[float] = None
    feasibility_sub: Optional[float] = None
    estimated_value_usd: Optional[float] = None
    min_delta_v: Optional[float] = None
    spectral_type: Optional[str] = None

    class Config:
        from_attributes = True


class EvsLeaderboardResponse(BaseModel):
    total: int
    entries: list[EvsLeaderboardEntry]


class EvsStatsResponse(BaseModel):
    total_scored: int
    avg_score: float
    max_score: float
    min_score: float
    avg_estimated_value_usd: Optional[float] = None
    total_estimated_value_usd: Optional[float] = None

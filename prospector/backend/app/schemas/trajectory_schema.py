from pydantic import BaseModel
from typing import Optional
from datetime import date


class TrajectorySchema(BaseModel):
    min_delta_v: Optional[float] = None
    min_duration_days: Optional[float] = None
    launch_date: Optional[date] = None
    outbound_days: Optional[int] = None
    stay_days: Optional[int] = None
    return_days: Optional[int] = None
    c3: Optional[float] = None
    departure_v_inf: Optional[float] = None
    n_viable_trajectories: Optional[int] = None
    occ_code: Optional[int] = None

    class Config:
        from_attributes = True


class TrajectoryDetailResponse(TrajectorySchema):
    asteroid_designation: str
    asteroid_full_name: Optional[str] = None

    class Config:
        from_attributes = True


class LaunchWindowSchema(BaseModel):
    launch_date: Optional[date] = None
    arrival_date: Optional[date] = None
    delta_v: Optional[float] = None
    duration_days: Optional[float] = None

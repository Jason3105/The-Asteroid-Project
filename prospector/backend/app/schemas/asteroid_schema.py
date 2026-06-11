from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrbitalElementsSchema(BaseModel):
    epoch: Optional[float] = None
    eccentricity: Optional[float] = None
    semi_major_axis: Optional[float] = None
    perihelion: Optional[float] = None
    inclination: Optional[float] = None
    long_asc_node: Optional[float] = None
    arg_perihelion: Optional[float] = None
    mean_anomaly: Optional[float] = None
    period: Optional[float] = None
    moid: Optional[float] = None

    class Config:
        from_attributes = True


class PhysicalParamsSchema(BaseModel):
    abs_magnitude: Optional[float] = None
    diameter_km: Optional[float] = None
    diameter_min_m: Optional[float] = None
    diameter_max_m: Optional[float] = None
    albedo: Optional[float] = None
    density: Optional[float] = None
    rotation_period_h: Optional[float] = None
    spectral_type_tholen: Optional[str] = None
    spectral_type_smass: Optional[str] = None

    class Config:
        from_attributes = True


class AsteroidBase(BaseModel):
    designation: str
    full_name: Optional[str] = None
    spkid: Optional[str] = None
    is_neo: bool = False
    is_pha: bool = False
    orbit_class: Optional[str] = None


class AsteroidCreate(AsteroidBase):
    pass


class AsteroidResponse(AsteroidBase):
    id: int
    last_synced: Optional[datetime] = None
    orbital_elements: Optional[OrbitalElementsSchema] = None
    physical_params: Optional[PhysicalParamsSchema] = None

    class Config:
        from_attributes = True


class AsteroidListResponse(BaseModel):
    total: int
    asteroids: list[AsteroidResponse]

    class Config:
        from_attributes = True

"""
Unit conversion utilities for PROSPECTOR.
"""
import math
from datetime import datetime, timezone
from app.utils.constants import AU_TO_KM, LD_PER_AU


def au_to_km(au: float) -> float:
    """Convert Astronomical Units to kilometers."""
    return au * AU_TO_KM


def km_to_au(km: float) -> float:
    """Convert kilometers to Astronomical Units."""
    return km / AU_TO_KM


def au_to_ld(au: float) -> float:
    """Convert Astronomical Units to Lunar Distances."""
    return au * LD_PER_AU


def deg_to_rad(degrees: float) -> float:
    """Convert degrees to radians."""
    return math.radians(degrees)


def rad_to_deg(radians: float) -> float:
    """Convert radians to degrees."""
    return math.degrees(radians)


def jd_to_datetime(jd: float) -> datetime:
    """Convert Julian Date to Python datetime (UTC)."""
    # JD 2451545.0 = J2000.0 = 2000-01-01 12:00 TT
    unix_epoch_jd = 2440587.5
    unix_timestamp = (jd - unix_epoch_jd) * 86400.0
    return datetime.fromtimestamp(unix_timestamp, tz=timezone.utc)


def datetime_to_jd(dt: datetime) -> float:
    """Convert Python datetime to Julian Date."""
    unix_epoch_jd = 2440587.5
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    unix_timestamp = dt.timestamp()
    return unix_epoch_jd + unix_timestamp / 86400.0


def m_to_km(m: float) -> float:
    """Convert meters to kilometers."""
    return m / 1000.0


def km_to_m(km: float) -> float:
    """Convert kilometers to meters."""
    return km * 1000.0


def safe_float(value, default: float = 0.0) -> float:
    """Safely convert a value to float, returning default on failure."""
    if value is None:
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

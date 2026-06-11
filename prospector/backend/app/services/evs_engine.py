"""
EVS (Economic Viability Score) Engine.
Computes the proprietary PROSPECTOR EVS score for asteroid ranking.

EVS = W1 * Accessibility + W2 * ResourceValue + W3 * Feasibility
W1=0.30, W2=0.45, W3=0.25
"""
import math
import logging
from typing import Optional
from app.utils.constants import (
    DV_MIN, DV_MAX,
    EVS_W1, EVS_W2, EVS_W3,
    MAX_KNOWN_VALUE_USD,
    COST_PER_KG_TO_LEO,
    DAILY_OPS_RATE,
    FIXED_OVERHEAD,
)

logger = logging.getLogger(__name__)


def compute_accessibility_score(delta_v: Optional[float]) -> float:
    """
    Compute accessibility sub-score (0-100).
    Lower delta-v = higher score.
    """
    if delta_v is None:
        return 0.0
    if delta_v <= DV_MIN:
        return 100.0
    if delta_v >= DV_MAX:
        return 0.0
    return 100.0 * (1.0 - (delta_v - DV_MIN) / (DV_MAX - DV_MIN))


def compute_resource_value_score(estimated_value_usd: Optional[float]) -> float:
    """
    Compute resource value sub-score (0-100).
    Uses log normalization to handle extreme values.
    """
    if not estimated_value_usd or estimated_value_usd <= 0:
        return 0.0
    try:
        log_value = math.log10(estimated_value_usd)
        log_max = math.log10(MAX_KNOWN_VALUE_USD)
        score = 100.0 * (log_value / log_max)
        return max(0.0, min(100.0, score))
    except (ValueError, ZeroDivisionError):
        return 0.0


def compute_feasibility_score(
    min_duration_days: Optional[float] = None,
    occ_code: Optional[int] = None,
    rotation_period_h: Optional[float] = None,
    diameter_km: Optional[float] = None,
) -> float:
    """
    Compute mission feasibility sub-score (0-100).
    
    Components:
    - duration_score (25): Shorter mission = higher score
    - occ_score (25): Lower orbit condition code = better orbit certainty
    - spin_score (25): Moderate spin rate (2-24h) = higher score
    - size_score (25): Optimal size range (0.1-2km) = higher score
    """
    # Duration score (optimal: 60-200 days, max: 450 days)
    if min_duration_days is not None:
        if min_duration_days <= 100:
            duration_score = 100.0
        elif min_duration_days >= 450:
            duration_score = 0.0
        else:
            duration_score = 100.0 * (1.0 - (min_duration_days - 100) / 350.0)
    else:
        duration_score = 50.0  # Unknown = neutral

    # OCC score (0=best, 9=worst)
    if occ_code is not None:
        occ_score = max(0.0, 100.0 - (occ_code * 11.0))
    else:
        occ_score = 50.0

    # Spin score (ideal: 2-24h period)
    if rotation_period_h is not None:
        if 2.0 <= rotation_period_h <= 24.0:
            spin_score = 100.0
        elif rotation_period_h < 2.0:
            spin_score = max(0.0, 50.0 * (rotation_period_h / 2.0))
        else:
            spin_score = max(0.0, 100.0 - (rotation_period_h - 24.0) * 2.0)
    else:
        spin_score = 50.0

    # Size score (ideal: 0.1km to 2km for mining)
    if diameter_km is not None:
        if 0.1 <= diameter_km <= 2.0:
            size_score = 100.0
        elif diameter_km < 0.1:
            size_score = max(0.0, diameter_km * 1000.0)
        else:
            size_score = max(0.0, 100.0 - (diameter_km - 2.0) * 10.0)
    else:
        size_score = 50.0

    total = (25 * duration_score + 25 * occ_score + 25 * spin_score + 25 * size_score) / 100.0
    return max(0.0, min(100.0, total))


def compute_mission_cost(
    delta_v: Optional[float],
    min_duration_days: Optional[float],
    spacecraft_mass_kg: float = 5000.0,
) -> float:
    """Estimate total mission cost in USD."""
    if delta_v is None:
        return FIXED_OVERHEAD

    delta_v_factor = (delta_v / DV_MIN) ** 2  # Tsiolkovsky-inspired scaling
    launch_cost = delta_v_factor * spacecraft_mass_kg * COST_PER_KG_TO_LEO
    ops_cost = (min_duration_days or 200) * DAILY_OPS_RATE
    return launch_cost + ops_cost + FIXED_OVERHEAD


def compute_evs(
    delta_v: Optional[float] = None,
    estimated_value_usd: Optional[float] = None,
    min_duration_days: Optional[float] = None,
    occ_code: Optional[int] = None,
    rotation_period_h: Optional[float] = None,
    diameter_km: Optional[float] = None,
) -> dict:
    """
    Compute the full EVS score for an asteroid.
    
    Returns:
        dict with score, accessibility_sub, value_sub, feasibility_sub,
        estimated_value_usd, mission_cost_usd, roi_ratio
    """
    accessibility = compute_accessibility_score(delta_v)
    resource_value = compute_resource_value_score(estimated_value_usd)
    feasibility = compute_feasibility_score(
        min_duration_days=min_duration_days,
        occ_code=occ_code,
        rotation_period_h=rotation_period_h,
        diameter_km=diameter_km,
    )

    evs = (EVS_W1 * accessibility) + (EVS_W2 * resource_value) + (EVS_W3 * feasibility)
    mission_cost = compute_mission_cost(delta_v, min_duration_days)
    roi = (estimated_value_usd / mission_cost) if (estimated_value_usd and mission_cost > 0) else 0.0

    return {
        "score": round(max(0.0, min(100.0, evs)), 4),
        "accessibility_sub": round(accessibility, 4),
        "value_sub": round(resource_value, 4),
        "feasibility_sub": round(feasibility, 4),
        "estimated_value_usd": estimated_value_usd or 0.0,
        "mission_cost_usd": round(mission_cost, 2),
        "roi_ratio": round(roi, 6),
    }

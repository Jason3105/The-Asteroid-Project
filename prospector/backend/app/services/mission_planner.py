"""
Mission planner service: generates full mission timeline and cost breakdown.
"""
import math
import logging
from typing import Optional
from datetime import date, timedelta
from app.utils.constants import COST_PER_KG_TO_LEO, DAILY_OPS_RATE, FIXED_OVERHEAD, DV_MIN

logger = logging.getLogger(__name__)


def generate_mission_plan(
    designation: str,
    delta_v: Optional[float] = None,
    duration_days: Optional[float] = None,
    launch_date: Optional[date] = None,
    outbound_days: Optional[int] = None,
    stay_days: Optional[int] = None,
    return_days: Optional[int] = None,
    spacecraft_mass_kg: float = 5000.0,
    payload_mass_kg: float = 1000.0,
) -> dict:
    """
    Generate a complete mission plan for an asteroid.
    
    Returns:
        dict with launch info, mission phases, costs, and fuel requirements.
    """
    # Defaults if not provided from NHATS data
    if duration_days is None:
        duration_days = 300.0
    if outbound_days is None:
        outbound_days = int(duration_days * 0.35)
    if stay_days is None:
        stay_days = int(duration_days * 0.30)
    if return_days is None:
        return_days = int(duration_days * 0.35)
    if launch_date is None:
        launch_date = date.today() + timedelta(days=365)
    if delta_v is None:
        delta_v = 6.0  # Default moderate delta-v

    # Dates
    arrival_date = launch_date + timedelta(days=outbound_days)
    departure_from_asteroid = arrival_date + timedelta(days=stay_days)
    return_date = departure_from_asteroid + timedelta(days=return_days)

    # Fuel estimation (Tsiolkovsky rocket equation approximation)
    isp = 450.0  # s (typical chemical rocket)
    g0 = 9.80665  # m/s^2
    exhaust_velocity = isp * g0 / 1000.0  # km/s
    mass_ratio = math.exp(delta_v / exhaust_velocity)
    fuel_mass_kg = spacecraft_mass_kg * (mass_ratio - 1)

    # Cost breakdown
    delta_v_factor = (delta_v / DV_MIN) ** 2
    launch_cost = delta_v_factor * spacecraft_mass_kg * COST_PER_KG_TO_LEO
    operations_cost = duration_days * DAILY_OPS_RATE
    total_cost = launch_cost + operations_cost + FIXED_OVERHEAD

    return {
        "designation": designation,
        "launch_date": launch_date.isoformat(),
        "arrival_date": arrival_date.isoformat(),
        "asteroid_departure_date": departure_from_asteroid.isoformat(),
        "earth_return_date": return_date.isoformat(),
        "total_duration_days": int(duration_days),
        "phases": {
            "outbound_days": outbound_days,
            "stay_days": stay_days,
            "return_days": return_days,
        },
        "delta_v_km_s": delta_v,
        "spacecraft_mass_kg": spacecraft_mass_kg,
        "fuel_mass_kg": round(fuel_mass_kg, 2),
        "payload_mass_kg": payload_mass_kg,
        "cost_breakdown": {
            "launch_cost_usd": round(launch_cost, 2),
            "operations_cost_usd": round(operations_cost, 2),
            "fixed_overhead_usd": FIXED_OVERHEAD,
            "total_cost_usd": round(total_cost, 2),
        },
    }

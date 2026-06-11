"""
Composition estimator: maps spectral type to mineral percentages and estimates value.
"""
import math
import logging
from typing import Optional
from app.utils.constants import (
    COMPOSITION_BY_SPECTRAL_TYPE,
    DENSITY_BY_SPECTRAL_TYPE,
    ALBEDO_BY_SPECTRAL_TYPE,
    DEFAULT_COMMODITY_PRICES,
)

logger = logging.getLogger(__name__)


def get_spectral_class(spectral_type: Optional[str]) -> str:
    """Determine the broad spectral class (S, C, M, X, etc.) from a spectral type string."""
    if not spectral_type:
        return "DEFAULT"
    s = spectral_type.strip().upper()
    for key in COMPOSITION_BY_SPECTRAL_TYPE:
        if s.startswith(key):
            return key
    return "DEFAULT"


def estimate_diameter_km(abs_magnitude: float, albedo: float) -> float:
    """
    Estimate diameter from absolute magnitude and albedo.
    Formula: D = (1329 / sqrt(albedo)) * 10^(-H/5)
    """
    if albedo <= 0 or albedo > 1:
        albedo = 0.10
    return (1329.0 / math.sqrt(albedo)) * (10.0 ** (-abs_magnitude / 5.0))


def estimate_mass_kg(diameter_km: float, density_g_cm3: float) -> float:
    """
    Estimate mass from diameter and density.
    Assumes spherical body.
    V = (4/3) * pi * r^3  (in km^3) -> convert to m^3 -> mass in kg
    """
    radius_m = (diameter_km * 1000.0) / 2.0
    volume_m3 = (4.0 / 3.0) * math.pi * (radius_m**3)
    density_kg_m3 = density_g_cm3 * 1000.0
    return volume_m3 * density_kg_m3


def estimate_composition(
    spectral_type: Optional[str] = None,
    albedo: Optional[float] = None,
    abs_magnitude: Optional[float] = None,
    diameter_km: Optional[float] = None,
    density: Optional[float] = None,
) -> dict:
    """
    Estimate mineral composition from physical parameters.
    Returns a dict with mineral percentages and confidence.
    """
    spectral_class = get_spectral_class(spectral_type)
    composition = dict(COMPOSITION_BY_SPECTRAL_TYPE.get(spectral_class, COMPOSITION_BY_SPECTRAL_TYPE["DEFAULT"]))

    # Calculate confidence based on available data
    confidence = 0.5  # Base confidence for spectral mapping
    if spectral_type:
        confidence += 0.2
    if albedo is not None:
        confidence += 0.1
    if abs_magnitude is not None or diameter_km is not None:
        confidence += 0.1
    if density is not None:
        confidence += 0.1
    confidence = min(confidence, 1.0)

    composition["confidence"] = confidence
    composition["method"] = "spectral_mapping"
    return composition


def estimate_value_usd(
    mass_kg: float,
    composition: dict,
    commodity_prices: Optional[dict] = None,
) -> dict:
    """
    Estimate total mineral value and breakdown for an asteroid.
    Returns: {total_value_usd, breakdown: {mineral: value_usd}, mass_kg}
    """
    prices = commodity_prices or DEFAULT_COMMODITY_PRICES
    breakdown = {}

    mineral_to_price_key = {
        "water_pct": "water",
        "iron_pct": "iron",
        "nickel_pct": "nickel",
        "cobalt_pct": "cobalt",
        "platinum_pct": "platinum",
        "gold_pct": "gold",
        "rare_earth_pct": "rare_earth",
        "silicate_pct": "silicate",
        "carbon_pct": "carbon",
    }

    total_value = 0.0
    for comp_key, price_key in mineral_to_price_key.items():
        pct = composition.get(comp_key, 0.0) or 0.0
        price_per_kg = prices.get(price_key, 0.0)
        yield_kg = mass_kg * (pct / 100.0)
        value_usd = yield_kg * price_per_kg
        breakdown[price_key] = value_usd
        total_value += value_usd

    return {
        "total_value_usd": total_value,
        "breakdown": breakdown,
        "mass_kg": mass_kg,
    }


def full_composition_analysis(
    spectral_type: Optional[str],
    abs_magnitude: Optional[float],
    diameter_km: Optional[float],
    albedo: Optional[float],
    density: Optional[float],
    commodity_prices: Optional[dict] = None,
) -> dict:
    """
    Complete composition pipeline: estimate composition → mass → value.
    """
    spectral_class = get_spectral_class(spectral_type)

    # Resolve albedo
    resolved_albedo = albedo or ALBEDO_BY_SPECTRAL_TYPE.get(spectral_class, 0.10)

    # Resolve diameter
    if not diameter_km and abs_magnitude is not None:
        diameter_km = estimate_diameter_km(abs_magnitude, resolved_albedo)

    # Resolve density
    resolved_density = density or DENSITY_BY_SPECTRAL_TYPE.get(spectral_class, 2.0)

    # Estimate mass
    mass_kg = 0.0
    if diameter_km:
        mass_kg = estimate_mass_kg(diameter_km, resolved_density)

    # Estimate composition
    composition = estimate_composition(
        spectral_type=spectral_type,
        albedo=resolved_albedo,
        abs_magnitude=abs_magnitude,
        diameter_km=diameter_km,
        density=resolved_density,
    )

    # Estimate value
    value_data = estimate_value_usd(mass_kg, composition, commodity_prices)

    return {
        "composition": composition,
        "mass_kg": mass_kg,
        "diameter_km": diameter_km,
        "density_g_cm3": resolved_density,
        "albedo": resolved_albedo,
        "spectral_class": spectral_class,
        **value_data,
    }

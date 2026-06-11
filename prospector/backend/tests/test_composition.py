"""Tests for composition estimator."""
import pytest
import math
from app.services.composition_estimator import (
    get_spectral_class,
    estimate_diameter_km,
    estimate_mass_kg,
    estimate_composition,
    estimate_value_usd,
    full_composition_analysis,
)


def test_spectral_class_s_type():
    assert get_spectral_class("S") == "S"
    assert get_spectral_class("Sq") == "S"
    assert get_spectral_class("Sw") == "S"


def test_spectral_class_c_type():
    assert get_spectral_class("C") == "C"
    assert get_spectral_class("Cb") == "C"


def test_spectral_class_unknown():
    assert get_spectral_class(None) == "DEFAULT"
    assert get_spectral_class("") == "DEFAULT"
    assert get_spectral_class("Z") == "DEFAULT"


def test_diameter_estimation():
    """Eros: H=10.4, albedo=0.25 → ~17 km diameter."""
    d = estimate_diameter_km(10.4, 0.25)
    assert 15 < d < 20


def test_mass_estimation():
    """500m diameter, density 2.7 g/cm3."""
    mass = estimate_mass_kg(0.5, 2.7)
    assert mass > 1e11  # Should be > 100 billion kg


def test_composition_s_type():
    comp = estimate_composition("S")
    assert comp["iron_pct"] == 25.0
    assert comp["silicate_pct"] == 60.0
    assert comp["confidence"] > 0.5


def test_composition_m_type():
    comp = estimate_composition("M")
    assert comp["iron_pct"] == 85.0
    assert comp["nickel_pct"] == 7.0


def test_value_estimation():
    mass_kg = 1e15  # 1 quadrillion kg
    comp = {"platinum_pct": 0.01, "gold_pct": 0.001, "iron_pct": 85, "nickel_pct": 7}
    result = estimate_value_usd(mass_kg, comp)
    assert result["total_value_usd"] > 0
    assert "platinum" in result["breakdown"]


def test_full_analysis():
    result = full_composition_analysis(
        spectral_type="M",
        abs_magnitude=15.0,
        diameter_km=None,
        albedo=0.10,
        density=5.3,
    )
    assert result["mass_kg"] > 0
    assert result["total_value_usd"] > 0
    assert result["spectral_class"] == "M"

"""Tests for EVS scoring engine."""
import pytest
from app.services.evs_engine import (
    compute_accessibility_score,
    compute_resource_value_score,
    compute_feasibility_score,
    compute_evs,
)


def test_accessibility_perfect():
    """Minimum delta-v gives max score."""
    score = compute_accessibility_score(3.5)
    assert score == 100.0


def test_accessibility_zero():
    """Max delta-v gives zero score."""
    score = compute_accessibility_score(12.0)
    assert score == 0.0


def test_accessibility_none():
    """None delta-v gives zero score."""
    score = compute_accessibility_score(None)
    assert score == 0.0


def test_accessibility_mid():
    """Middle delta-v gives ~50 score."""
    score = compute_accessibility_score(7.75)
    assert 45 < score < 55


def test_resource_value_zero():
    """Zero value gives zero score."""
    assert compute_resource_value_score(0) == 0.0


def test_resource_value_max():
    """Maximum known value gives 100."""
    score = compute_resource_value_score(1e21)
    assert score == pytest.approx(100.0, abs=1.0)


def test_feasibility_optimal():
    """Optimal parameters give high feasibility."""
    score = compute_feasibility_score(
        min_duration_days=90,
        occ_code=0,
        rotation_period_h=8,
        diameter_km=0.5,
    )
    assert score > 90


def test_evs_full():
    """Full EVS computation returns valid dict."""
    result = compute_evs(
        delta_v=4.5,
        estimated_value_usd=1e18,
        min_duration_days=180,
        occ_code=1,
        rotation_period_h=6,
        diameter_km=0.8,
    )
    assert "score" in result
    assert 0 <= result["score"] <= 100
    assert result["accessibility_sub"] > 0
    assert result["value_sub"] > 0
    assert result["feasibility_sub"] > 0

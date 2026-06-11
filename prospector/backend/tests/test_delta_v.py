"""Tests for delta-v and orbital calculations."""
import pytest
import math
from app.utils.orbital_math import (
    solve_kepler,
    true_anomaly_from_mean,
    kepler_to_cartesian,
    orbit_points,
    hohmann_delta_v,
)


def test_kepler_circular():
    """For e=0, E = M."""
    E = solve_kepler(math.pi / 2, 0.0)
    assert abs(E - math.pi / 2) < 1e-8


def test_kepler_eros():
    """Test for Eros-like orbit (e~0.22)."""
    E = solve_kepler(math.radians(37.0), 0.22278)
    # Should converge
    assert 0 <= E <= 2 * math.pi + 0.1


def test_orbit_points_count():
    points = orbit_points(1.458, 0.223, 10.8, 304.3, 178.7, n_points=100)
    assert len(points) == 100


def test_orbit_points_shape():
    """All points should be 3-tuples."""
    points = orbit_points(1.0, 0.0, 0.0, 0.0, 0.0, n_points=10)
    for p in points:
        assert len(p) == 3


def test_hohmann_earth_to_eros():
    """Earth (1 AU) to Eros (1.458 AU) Hohmann transfer."""
    dv1, dv2, total = hohmann_delta_v(1.0, 1.458)
    # Should be roughly 2.5-4 km/s range
    assert 2.0 < total < 6.0


def test_hohmann_symmetric():
    """Transfer delta-v from A→B and B→A should be same."""
    _, _, total_ab = hohmann_delta_v(1.0, 1.5)
    _, _, total_ba = hohmann_delta_v(1.5, 1.0)
    assert abs(total_ab - total_ba) < 0.01

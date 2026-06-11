"""
Orbital mathematics for PROSPECTOR - Keplerian orbit calculations.
"""
import math
import numpy as np
from typing import Optional
from app.utils.constants import SUN_MU, AU_TO_KM


def solve_kepler(mean_anomaly_rad: float, eccentricity: float, tol: float = 1e-10, max_iter: int = 100) -> float:
    """
    Solve Kepler's equation using Newton-Raphson iteration.
    
    M = E - e * sin(E)
    Returns eccentric anomaly E in radians.
    """
    E = mean_anomaly_rad  # Initial guess
    for _ in range(max_iter):
        f = E - eccentricity * math.sin(E) - mean_anomaly_rad
        f_prime = 1.0 - eccentricity * math.cos(E)
        E_new = E - f / f_prime
        if abs(E_new - E) < tol:
            return E_new
        E = E_new
    return E


def true_anomaly_from_mean(mean_anomaly_deg: float, eccentricity: float) -> float:
    """
    Convert mean anomaly to true anomaly.
    Returns true anomaly in degrees.
    """
    M_rad = math.radians(mean_anomaly_deg)
    E_rad = solve_kepler(M_rad, eccentricity)
    
    # True anomaly from eccentric anomaly
    cos_nu = (math.cos(E_rad) - eccentricity) / (1.0 - eccentricity * math.cos(E_rad))
    sin_nu = (math.sqrt(1 - eccentricity**2) * math.sin(E_rad)) / (1.0 - eccentricity * math.cos(E_rad))
    nu = math.atan2(sin_nu, cos_nu)
    return math.degrees(nu)


def kepler_to_cartesian(
    semi_major_axis_au: float,
    eccentricity: float,
    inclination_deg: float,
    long_asc_node_deg: float,
    arg_perihelion_deg: float,
    mean_anomaly_deg: float,
) -> tuple[float, float, float]:
    """
    Convert Keplerian orbital elements to 3D Cartesian coordinates (AU).
    
    Returns (x, y, z) in AU in the heliocentric ecliptic J2000 frame.
    """
    a = semi_major_axis_au
    e = eccentricity
    i = math.radians(inclination_deg)
    Omega = math.radians(long_asc_node_deg)      # longitude of ascending node
    omega = math.radians(arg_perihelion_deg)     # argument of perihelion
    M = math.radians(mean_anomaly_deg)

    # Solve for eccentric anomaly
    E = solve_kepler(M, e)

    # Position in orbital plane
    x_orb = a * (math.cos(E) - e)
    y_orb = a * math.sqrt(1 - e**2) * math.sin(E)

    # Rotation matrices
    # Rotate by argument of perihelion
    cos_omega = math.cos(omega)
    sin_omega = math.sin(omega)
    # Rotate by inclination
    cos_i = math.cos(i)
    sin_i = math.sin(i)
    # Rotate by longitude of ascending node
    cos_Omega = math.cos(Omega)
    sin_Omega = math.sin(Omega)

    # Transform to ecliptic coordinates
    x = (cos_Omega * cos_omega - sin_Omega * sin_omega * cos_i) * x_orb + \
        (-cos_Omega * sin_omega - sin_Omega * cos_omega * cos_i) * y_orb
    y = (sin_Omega * cos_omega + cos_Omega * sin_omega * cos_i) * x_orb + \
        (-sin_Omega * sin_omega + cos_Omega * cos_omega * cos_i) * y_orb
    z = (sin_omega * sin_i) * x_orb + (cos_omega * sin_i) * y_orb

    return (x, y, z)


def orbital_period(semi_major_axis_au: float) -> float:
    """
    Calculate orbital period in days using Kepler's third law.
    P^2 = a^3  (in AU and years)
    """
    period_years = math.sqrt(semi_major_axis_au**3)
    return period_years * 365.25


def orbit_points(
    semi_major_axis_au: float,
    eccentricity: float,
    inclination_deg: float,
    long_asc_node_deg: float,
    arg_perihelion_deg: float,
    n_points: int = 360,
) -> list[tuple[float, float, float]]:
    """
    Generate n_points (x, y, z) positions along the full orbit (AU).
    Used for 3D visualization.
    """
    points = []
    for i in range(n_points):
        M = (360.0 * i) / n_points
        pos = kepler_to_cartesian(
            semi_major_axis_au,
            eccentricity,
            inclination_deg,
            long_asc_node_deg,
            arg_perihelion_deg,
            M,
        )
        points.append(pos)
    return points


def hohmann_delta_v(r1_au: float, r2_au: float) -> tuple[float, float, float]:
    """
    Compute Hohmann transfer delta-v for circular orbits.
    r1_au: departure orbit radius (AU)
    r2_au: arrival orbit radius (AU)
    Returns (dv1, dv2, total_dv) in km/s
    """
    r1 = r1_au * AU_TO_KM
    r2 = r2_au * AU_TO_KM
    mu = SUN_MU

    v1 = math.sqrt(mu / r1)
    v2 = math.sqrt(mu / r2)
    v_transfer1 = math.sqrt(mu * (2 / r1 - 1 / ((r1 + r2) / 2)))
    v_transfer2 = math.sqrt(mu * (2 / r2 - 1 / ((r1 + r2) / 2)))

    dv1 = abs(v_transfer1 - v1)
    dv2 = abs(v2 - v_transfer2)
    return (dv1, dv2, dv1 + dv2)

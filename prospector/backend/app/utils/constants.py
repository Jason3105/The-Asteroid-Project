"""
Physical and astronomical constants for PROSPECTOR.
"""
import math

# ── Astronomical Unit ─────────────────────────────────────────────────────────
AU_TO_KM: float = 1.495978707e8      # 1 AU in km
AU_TO_M: float = 1.495978707e11      # 1 AU in m
KM_TO_AU: float = 1.0 / AU_TO_KM
LD_PER_AU: float = 389.17            # Lunar distances per AU

# ── Gravitational Parameters (km^3 / s^2) ────────────────────────────────────
SUN_MU: float = 1.32712440018e11     # Heliocentric GM
EARTH_MU: float = 398600.4418        # Earth GM
G_CONST: float = 6.674e-20           # Gravitational constant (km^3 kg^-1 s^-2)

# ── Planetary orbital periods (days) ─────────────────────────────────────────
EARTH_PERIOD_DAYS: float = 365.25
EARTH_SMA_AU: float = 1.0            # Earth semi-major axis in AU

# ── Solar System masses (kg) ──────────────────────────────────────────────────
SUN_MASS_KG: float = 1.989e30
EARTH_MASS_KG: float = 5.972e24

# ── EVS Algorithm constants ───────────────────────────────────────────────────
DV_MIN: float = 3.5     # km/s - minimum delta-v in dataset
DV_MAX: float = 12.0    # km/s - maximum delta-v considered

EVS_W1: float = 0.30    # Accessibility weight
EVS_W2: float = 0.45    # Resource value weight
EVS_W3: float = 0.25    # Feasibility weight

MAX_KNOWN_VALUE_USD: float = 1e21   # Normalization ceiling for resource values

# ── Default Densities by Spectral Type (g/cm^3) ──────────────────────────────
DENSITY_BY_SPECTRAL_TYPE: dict[str, float] = {
    "S": 2.7,
    "C": 1.3,
    "M": 5.3,
    "X": 3.5,
    "V": 3.0,
    "B": 1.3,
    "D": 1.5,
    "DEFAULT": 2.0,
}

# ── Default Albedos by Spectral Type ─────────────────────────────────────────
ALBEDO_BY_SPECTRAL_TYPE: dict[str, float] = {
    "S": 0.20,
    "C": 0.06,
    "M": 0.10,
    "X": 0.15,
    "V": 0.35,
    "B": 0.08,
    "D": 0.05,
    "DEFAULT": 0.10,
}

# ── Mineral Composition by Spectral Type (percentages) ───────────────────────
COMPOSITION_BY_SPECTRAL_TYPE: dict[str, dict[str, float]] = {
    "S": {
        "water_pct": 0.1,
        "iron_pct": 25.0,
        "nickel_pct": 2.0,
        "cobalt_pct": 0.1,
        "platinum_pct": 0.005,
        "gold_pct": 0.0001,
        "rare_earth_pct": 0.1,
        "silicate_pct": 60.0,
        "carbon_pct": 2.0,
    },
    "C": {
        "water_pct": 15.0,
        "iron_pct": 10.0,
        "nickel_pct": 1.0,
        "cobalt_pct": 0.05,
        "platinum_pct": 0.002,
        "gold_pct": 0.0001,
        "rare_earth_pct": 0.2,
        "silicate_pct": 30.0,
        "carbon_pct": 20.0,
    },
    "M": {
        "water_pct": 0.05,
        "iron_pct": 85.0,
        "nickel_pct": 7.0,
        "cobalt_pct": 0.5,
        "platinum_pct": 0.01,
        "gold_pct": 0.001,
        "rare_earth_pct": 0.1,
        "silicate_pct": 3.0,
        "carbon_pct": 0.5,
    },
    "X": {
        "water_pct": 1.0,
        "iron_pct": 40.0,
        "nickel_pct": 4.0,
        "cobalt_pct": 0.2,
        "platinum_pct": 0.008,
        "gold_pct": 0.0005,
        "rare_earth_pct": 0.2,
        "silicate_pct": 30.0,
        "carbon_pct": 5.0,
    },
    "V": {
        "water_pct": 0.1,
        "iron_pct": 20.0,
        "nickel_pct": 1.5,
        "cobalt_pct": 0.1,
        "platinum_pct": 0.003,
        "gold_pct": 0.0001,
        "rare_earth_pct": 0.2,
        "silicate_pct": 65.0,
        "carbon_pct": 1.0,
    },
    "B": {
        "water_pct": 12.0,
        "iron_pct": 8.0,
        "nickel_pct": 0.8,
        "cobalt_pct": 0.04,
        "platinum_pct": 0.001,
        "gold_pct": 0.0001,
        "rare_earth_pct": 0.15,
        "silicate_pct": 35.0,
        "carbon_pct": 22.0,
    },
    "D": {
        "water_pct": 8.0,
        "iron_pct": 5.0,
        "nickel_pct": 0.5,
        "cobalt_pct": 0.03,
        "platinum_pct": 0.001,
        "gold_pct": 0.00005,
        "rare_earth_pct": 0.1,
        "silicate_pct": 25.0,
        "carbon_pct": 30.0,
    },
}

# Default (unknown spectral type) — use C-type as conservative estimate
COMPOSITION_BY_SPECTRAL_TYPE["DEFAULT"] = COMPOSITION_BY_SPECTRAL_TYPE["C"]

# ── Mission Cost Defaults ─────────────────────────────────────────────────────
COST_PER_KG_TO_LEO: float = 2720.0      # USD/kg
DAILY_OPS_RATE: float = 50_000.0         # USD/day
FIXED_OVERHEAD: float = 50_000_000.0     # USD

# ── Default Commodity Prices (USD/kg) ────────────────────────────────────────
DEFAULT_COMMODITY_PRICES: dict[str, float] = {
    "platinum": 31_000.0,
    "gold": 75_000.0,
    "iron": 0.10,
    "nickel": 16.0,
    "cobalt": 29.0,
    "water": 10_000.0,
    "rare_earth": 500.0,
    "silicate": 0.02,
    "carbon": 0.05,
}

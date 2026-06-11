"""
Market router: commodity prices and market impact simulation.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.asteroid import Asteroid
from app.models.physical_params import PhysicalParams
from app.services.market_service import get_current_prices, simulate_market_impact
from app.services.composition_estimator import full_composition_analysis

router = APIRouter(prefix="/market", tags=["Market"])

# Annual supply estimates (approximate, in kg)
ANNUAL_SUPPLY_KG = {
    "platinum": 200_000,
    "gold": 3_300_000,
    "iron": 2_500_000_000_000,
    "nickel": 2_700_000_000,
    "cobalt": 170_000_000,
    "water": float("inf"),
    "rare_earth": 240_000_000,
}


@router.get("/prices")
async def get_prices(db: AsyncSession = Depends(get_db)):
    """Get current commodity prices."""
    prices = await get_current_prices(db)
    return {"prices": prices, "currency": "USD", "unit": "per_kg"}


@router.get("/impact/{designation}")
async def get_market_impact(designation: str, db: AsyncSession = Depends(get_db)):
    """
    Simulate the market price impact of mining a specific asteroid.
    Shows how introducing asteroid minerals would affect commodity prices.
    """
    from sqlalchemy import select

    result = await db.execute(
        select(Asteroid, PhysicalParams)
        .outerjoin(PhysicalParams, PhysicalParams.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == designation)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail=f"Asteroid '{designation}' not found.")

    asteroid, phys = row
    prices = await get_current_prices(db)

    spectral_type = None
    if phys:
        spectral_type = phys.spectral_type_tholen or phys.spectral_type_smass

    analysis = full_composition_analysis(
        spectral_type=spectral_type,
        abs_magnitude=phys.abs_magnitude if phys else None,
        diameter_km=phys.diameter_km if phys else None,
        albedo=phys.albedo if phys else None,
        density=phys.density if phys else None,
        commodity_prices=prices,
    )

    impacts = {}
    mass_kg = analysis["mass_kg"]
    comp = analysis["composition"]

    mineral_map = {
        "platinum": comp.get("platinum_pct", 0),
        "gold": comp.get("gold_pct", 0),
        "iron": comp.get("iron_pct", 0),
        "nickel": comp.get("nickel_pct", 0),
        "cobalt": comp.get("cobalt_pct", 0),
        "water": comp.get("water_pct", 0),
    }

    for mineral, pct in mineral_map.items():
        yield_kg = mass_kg * (pct / 100.0)
        supply = ANNUAL_SUPPLY_KG.get(mineral, 1e9)
        price = prices.get(mineral, 0.0)
        if supply < float("inf") and price > 0:
            impacts[mineral] = simulate_market_impact(
                mineral=mineral,
                yield_kg=yield_kg,
                current_supply_kg=supply,
                current_price_usd=price,
            )

    return {
        "designation": designation,
        "full_name": asteroid.full_name,
        "mass_kg": mass_kg,
        "market_impacts": impacts,
    }

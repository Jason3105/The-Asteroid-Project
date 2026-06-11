"""
Market service for commodity prices and market impact simulation.
"""
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.commodity_price import CommodityPrice
from app.utils.constants import DEFAULT_COMMODITY_PRICES

logger = logging.getLogger(__name__)


async def get_current_prices(db: AsyncSession) -> dict[str, float]:
    """
    Get latest commodity prices from DB.
    Falls back to hardcoded defaults if DB is empty.
    """
    result = await db.execute(
        select(CommodityPrice).order_by(CommodityPrice.fetched_at.desc())
    )
    prices_db = result.scalars().all()

    if not prices_db:
        return dict(DEFAULT_COMMODITY_PRICES)

    # Use most recent price per metal
    prices = {}
    seen = set()
    for p in prices_db:
        if p.metal not in seen:
            prices[p.metal] = p.price_per_kg_usd
            seen.add(p.metal)
    return prices


async def seed_default_prices(db: AsyncSession):
    """
    Seed the commodity_prices table with default values if empty.
    """
    result = await db.execute(select(func.count()).select_from(CommodityPrice))
    count = result.scalar_one()

    if count == 0:
        for metal, price in DEFAULT_COMMODITY_PRICES.items():
            db.add(CommodityPrice(
                metal=metal,
                price_per_kg_usd=price,
                source="hardcoded_defaults",
            ))
        await db.commit()
        logger.info("Seeded default commodity prices.")


def simulate_market_impact(
    mineral: str,
    yield_kg: float,
    current_supply_kg: float,
    current_price_usd: float,
    elasticity: float = -0.3,
) -> dict:
    """
    Simulate price impact of introducing asteroid-mined minerals.
    Uses simple price elasticity model:
    
    new_supply = current_supply + asteroid_yield
    price_change_pct = elasticity * (supply_change_pct)
    new_price = current_price * (1 + price_change_pct)
    """
    if current_supply_kg <= 0:
        return {"new_price_usd": current_price_usd, "price_change_pct": 0.0}

    supply_change_pct = yield_kg / current_supply_kg
    price_change_pct = elasticity * supply_change_pct
    new_price = current_price_usd * (1 + price_change_pct)

    return {
        "mineral": mineral,
        "current_price_usd_kg": current_price_usd,
        "new_price_usd_kg": max(0.0, new_price),
        "price_change_pct": price_change_pct * 100,
        "yield_kg": yield_kg,
        "supply_change_pct": supply_change_pct * 100,
    }

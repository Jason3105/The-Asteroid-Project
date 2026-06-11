"""
Compositions router.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.asteroid import Asteroid
from app.models.composition import Composition
from app.models.physical_params import PhysicalParams
from app.schemas.composition_schema import CompositionSchema, CompositionValueResponse, CompositionPredictRequest
from app.services.composition_estimator import full_composition_analysis
from app.services.market_service import get_current_prices

router = APIRouter(prefix="/compositions", tags=["Compositions"])


@router.get("/{designation}", response_model=CompositionSchema)
async def get_composition(designation: str, db: AsyncSession = Depends(get_db)):
    """Get mineral composition for an asteroid."""
    result = await db.execute(
        select(Composition, Asteroid)
        .join(Asteroid, Composition.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == designation)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail=f"Composition not found for '{designation}'")
    comp, _ = row
    return comp


@router.get("/{designation}/value", response_model=CompositionValueResponse)
async def get_composition_value(designation: str, db: AsyncSession = Depends(get_db)):
    """Get estimated mineral value for an asteroid using current commodity prices."""
    result = await db.execute(
        select(Asteroid, Composition, PhysicalParams)
        .outerjoin(Composition, Composition.asteroid_id == Asteroid.id)
        .outerjoin(PhysicalParams, PhysicalParams.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == designation)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail=f"Asteroid '{designation}' not found.")

    asteroid, comp, phys = row
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

    comp_schema = CompositionSchema(**analysis["composition"]) if comp is None else CompositionSchema.model_validate(comp)

    return CompositionValueResponse(
        designation=asteroid.designation,
        full_name=asteroid.full_name,
        composition=comp_schema,
        mass_kg=analysis["mass_kg"],
        total_value_usd=analysis["total_value_usd"],
        breakdown=analysis["breakdown"],
    )


@router.post("/predict")
async def predict_composition(req: CompositionPredictRequest, db: AsyncSession = Depends(get_db)):
    """Predict composition from physical parameters (no DB required)."""
    analysis = full_composition_analysis(
        spectral_type=req.spectral_type,
        abs_magnitude=req.abs_magnitude,
        diameter_km=req.diameter_km,
        albedo=req.albedo,
        density=req.density,
    )
    return {"designation": req.designation, **analysis}

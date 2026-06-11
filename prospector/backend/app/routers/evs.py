"""
EVS leaderboard and scoring router.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.asteroid import Asteroid
from app.models.evs_score import EvsScore
from app.models.physical_params import PhysicalParams
from app.models.trajectory import NhatsTrajectory
from app.schemas.evs_schema import EvsLeaderboardResponse, EvsLeaderboardEntry, EvsStatsResponse, EvsScoreSchema
from app.services.data_sync import full_sync

router = APIRouter(prefix="/evs", tags=["EVS"])


@router.get("/leaderboard", response_model=EvsLeaderboardResponse)
async def get_leaderboard(
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get EVS leaderboard - top ranked asteroids by EVS score."""
    total_result = await db.execute(select(func.count()).select_from(EvsScore))
    total = total_result.scalar_one()

    result = await db.execute(
        select(EvsScore, Asteroid, PhysicalParams, NhatsTrajectory)
        .join(Asteroid, EvsScore.asteroid_id == Asteroid.id)
        .outerjoin(PhysicalParams, PhysicalParams.asteroid_id == Asteroid.id)
        .outerjoin(NhatsTrajectory, NhatsTrajectory.asteroid_id == Asteroid.id)
        .order_by(desc(EvsScore.score))
        .offset(skip)
        .limit(limit)
    )
    rows = result.all()

    entries = []
    for rank, (evs, asteroid, phys, traj) in enumerate(rows, start=skip + 1):
        entries.append(EvsLeaderboardEntry(
            rank=rank,
            designation=asteroid.designation,
            full_name=asteroid.full_name,
            orbit_class=asteroid.orbit_class,
            score=evs.score or 0.0,
            accessibility_sub=evs.accessibility_sub,
            value_sub=evs.value_sub,
            feasibility_sub=evs.feasibility_sub,
            estimated_value_usd=evs.estimated_value_usd,
            min_delta_v=traj.min_delta_v if traj else None,
            spectral_type=phys.spectral_type_tholen or phys.spectral_type_smass if phys else None,
        ))

    return EvsLeaderboardResponse(total=total, entries=entries)


@router.get("/stats", response_model=EvsStatsResponse)
async def get_evs_stats(db: AsyncSession = Depends(get_db)):
    """Get aggregate EVS statistics."""
    result = await db.execute(
        select(
            func.count(EvsScore.id).label("total"),
            func.avg(EvsScore.score).label("avg_score"),
            func.max(EvsScore.score).label("max_score"),
            func.min(EvsScore.score).label("min_score"),
            func.avg(EvsScore.estimated_value_usd).label("avg_value"),
            func.sum(EvsScore.estimated_value_usd).label("total_value"),
        )
    )
    row = result.one()

    return EvsStatsResponse(
        total_scored=row.total or 0,
        avg_score=float(row.avg_score or 0),
        max_score=float(row.max_score or 0),
        min_score=float(row.min_score or 0),
        avg_estimated_value_usd=float(row.avg_value or 0),
        total_estimated_value_usd=float(row.total_value or 0),
    )


@router.get("/{designation}", response_model=EvsScoreSchema)
async def get_asteroid_evs(designation: str, db: AsyncSession = Depends(get_db)):
    """Get EVS score details for a specific asteroid."""
    result = await db.execute(
        select(EvsScore)
        .join(Asteroid, EvsScore.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == designation)
    )
    evs = result.scalar_one_or_none()
    if not evs:
        raise HTTPException(status_code=404, detail=f"EVS score not found for '{designation}'")
    return evs


@router.post("/recalculate")
async def recalculate_evs(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Trigger full re-computation of all EVS scores."""
    background_tasks.add_task(full_sync, db)
    return {"message": "EVS recalculation queued.", "status": "queued"}

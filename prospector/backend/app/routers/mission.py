"""
Mission planner router.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional
from datetime import date

from app.database import get_db
from app.models.asteroid import Asteroid
from app.models.trajectory import NhatsTrajectory
from app.services.mission_planner import generate_mission_plan

router = APIRouter(prefix="/mission", tags=["Mission"])


class MissionPlanRequest(BaseModel):
    designation: str
    spacecraft_mass_kg: float = 5000.0
    payload_mass_kg: float = 1000.0
    launch_date: Optional[date] = None


@router.post("/plan")
async def create_mission_plan(req: MissionPlanRequest, db: AsyncSession = Depends(get_db)):
    """Generate a mission plan for an asteroid."""
    result = await db.execute(
        select(Asteroid, NhatsTrajectory)
        .outerjoin(NhatsTrajectory, NhatsTrajectory.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == req.designation)
    )
    row = result.one_or_none()

    if not row:
        raise HTTPException(status_code=404, detail=f"Asteroid '{req.designation}' not found.")

    asteroid, traj = row

    plan = generate_mission_plan(
        designation=asteroid.designation,
        delta_v=traj.min_delta_v if traj else None,
        duration_days=traj.min_duration_days if traj else None,
        launch_date=req.launch_date or (traj.launch_date if traj else None),
        outbound_days=traj.outbound_days if traj else None,
        stay_days=traj.stay_days if traj else None,
        return_days=traj.return_days if traj else None,
        spacecraft_mass_kg=req.spacecraft_mass_kg,
        payload_mass_kg=req.payload_mass_kg,
    )

    plan["asteroid_full_name"] = asteroid.full_name
    return plan


@router.get("/{designation}")
async def get_mission_info(designation: str, db: AsyncSession = Depends(get_db)):
    """Get quick mission feasibility summary for an asteroid."""
    result = await db.execute(
        select(Asteroid, NhatsTrajectory)
        .outerjoin(NhatsTrajectory, NhatsTrajectory.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == designation)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail=f"Asteroid '{designation}' not found.")

    asteroid, traj = row
    plan = generate_mission_plan(
        designation=asteroid.designation,
        delta_v=traj.min_delta_v if traj else None,
        duration_days=traj.min_duration_days if traj else None,
        outbound_days=traj.outbound_days if traj else None,
        stay_days=traj.stay_days if traj else None,
        return_days=traj.return_days if traj else None,
    )
    plan["asteroid_full_name"] = asteroid.full_name
    return plan

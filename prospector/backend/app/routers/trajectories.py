"""
Trajectories router.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.asteroid import Asteroid
from app.models.trajectory import NhatsTrajectory
from app.schemas.trajectory_schema import TrajectoryDetailResponse
from app.services.nhats_client import nhats_client

router = APIRouter(prefix="/trajectories", tags=["Trajectories"])


@router.get("/accessible")
async def get_accessible_asteroids(db: AsyncSession = Depends(get_db)):
    """Get all asteroids with NHATS trajectory data (accessible from Earth)."""
    result = await db.execute(
        select(NhatsTrajectory, Asteroid)
        .join(Asteroid, NhatsTrajectory.asteroid_id == Asteroid.id)
        .order_by(NhatsTrajectory.min_delta_v)
    )
    rows = result.all()
    return [
        {
            "designation": asteroid.designation,
            "full_name": asteroid.full_name,
            "min_delta_v": traj.min_delta_v,
            "min_duration_days": traj.min_duration_days,
            "n_viable_trajectories": traj.n_viable_trajectories,
            "occ_code": traj.occ_code,
        }
        for traj, asteroid in rows
    ]


@router.get("/{designation}", response_model=TrajectoryDetailResponse)
async def get_trajectory(designation: str, db: AsyncSession = Depends(get_db)):
    """Get trajectory data for a specific asteroid."""
    result = await db.execute(
        select(NhatsTrajectory, Asteroid)
        .join(Asteroid, NhatsTrajectory.asteroid_id == Asteroid.id)
        .where(Asteroid.designation == designation)
    )
    row = result.one_or_none()
    if not row:
        # Try fetching from NHATS live
        traj_data = await nhats_client.get_asteroid_trajectories(designation)
        if not traj_data:
            raise HTTPException(status_code=404, detail=f"Trajectory not found for '{designation}'")
        return TrajectoryDetailResponse(
            asteroid_designation=designation,
            **{k: v for k, v in traj_data.items() if k != "designation"},
        )

    traj, asteroid = row
    return TrajectoryDetailResponse(
        asteroid_designation=asteroid.designation,
        asteroid_full_name=asteroid.full_name,
        min_delta_v=traj.min_delta_v,
        min_duration_days=traj.min_duration_days,
        launch_date=traj.launch_date,
        outbound_days=traj.outbound_days,
        stay_days=traj.stay_days,
        return_days=traj.return_days,
        c3=traj.c3,
        departure_v_inf=traj.departure_v_inf,
        n_viable_trajectories=traj.n_viable_trajectories,
        occ_code=traj.occ_code,
    )


@router.get("/{designation}/windows")
async def get_launch_windows(designation: str):
    """Get launch windows for a specific asteroid from NHATS live."""
    traj_data = await nhats_client.get_asteroid_trajectories(designation)
    if not traj_data:
        raise HTTPException(status_code=404, detail=f"No trajectory windows found for '{designation}'")
    return {"designation": designation, "trajectory": traj_data}

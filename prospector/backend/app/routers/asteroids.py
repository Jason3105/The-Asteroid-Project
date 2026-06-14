"""
Asteroids router: CRUD + sync endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from typing import Optional

from app.database import get_db
from app.models.asteroid import Asteroid
from app.models.orbital_elements import OrbitalElements
from app.models.physical_params import PhysicalParams
from app.schemas.asteroid_schema import AsteroidResponse, AsteroidListResponse
from app.services.jpl_client import jpl_client
from app.services.cad_client import cad_client
from app.services.data_sync import sync_asteroid_details, full_sync
from app.utils.orbital_math import orbit_points

router = APIRouter(prefix="/asteroids", tags=["Asteroids"])


@router.get("", response_model=AsteroidListResponse)
async def list_asteroids(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    is_neo: Optional[bool] = None,
    orbit_class: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """List all asteroids with optional filters."""
    query = select(Asteroid)
    count_query = select(func.count()).select_from(Asteroid)

    if is_neo is not None:
        query = query.where(Asteroid.is_neo == is_neo)
        count_query = count_query.where(Asteroid.is_neo == is_neo)
    if orbit_class:
        query = query.where(Asteroid.orbit_class == orbit_class)
        count_query = count_query.where(Asteroid.orbit_class == orbit_class)

    total = (await db.execute(count_query)).scalar_one()
    result = await db.execute(query.offset(skip).limit(limit))
    asteroids = result.scalars().all()

    return AsteroidListResponse(total=total, asteroids=asteroids)


@router.get("/search", response_model=list[dict])
async def search_asteroids(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Search asteroids by name or designation (DB first, then JPL)."""
    # Search local DB first
    result = await db.execute(
        select(Asteroid).where(
            or_(
                Asteroid.designation.ilike(f"%{q}%"),
                Asteroid.full_name.ilike(f"%{q}%"),
            )
        ).limit(limit)
    )
    local_results = result.scalars().all()

    if local_results:
        return [{"designation": a.designation, "full_name": a.full_name, "source": "local"} for a in local_results]

    # Fallback to JPL API
    jpl_results = await jpl_client.search_asteroids(q, limit=limit)
    return [
        {
            "designation": r.get("des", ""),
            "full_name": r.get("fullname", ""),
            "source": "jpl_live",
        }
        for r in jpl_results
    ]


@router.get("/query")
async def query_asteroids(
    is_neo: bool = Query(True, description="Filter to Near-Earth Objects"),
    orbit_class: Optional[str] = Query(None, description="Filter by orbit class (e.g., APO, ATE)"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Query asteroids directly from the SBDB Query API."""
    data = await jpl_client.query_asteroids(
        is_neo=is_neo,
        orbit_class=orbit_class,
        limit=limit,
        offset=offset
    )
    return data


@router.get("/{designation}", response_model=AsteroidResponse)
async def get_asteroid(
    designation: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single asteroid by designation."""
    result = await db.execute(select(Asteroid).where(Asteroid.designation == designation))
    asteroid = result.scalar_one_or_none()

    if not asteroid:
        # Try fetching from JPL live
        raw = await jpl_client.get_asteroid(designation)
        if not raw:
            raise HTTPException(status_code=404, detail=f"Asteroid '{designation}' not found.")
        asteroid = await sync_asteroid_details(db, designation)

    return asteroid


@router.get("/{designation}/orbit")
async def get_asteroid_orbit(designation: str, n_points: int = Query(360, ge=60, le=720), db: AsyncSession = Depends(get_db)):
    """Get orbital trajectory points for 3D visualization."""
    result = await db.execute(select(Asteroid).where(Asteroid.designation == designation))
    asteroid = result.scalar_one_or_none()

    if not asteroid:
        raise HTTPException(status_code=404, detail="Asteroid not found.")

    orb = asteroid.orbital_elements
    if not orb:
        raise HTTPException(status_code=404, detail="Orbital elements not available.")

    points = orbit_points(
        semi_major_axis_au=orb.semi_major_axis or 1.0,
        eccentricity=orb.eccentricity or 0.0,
        inclination_deg=orb.inclination or 0.0,
        long_asc_node_deg=orb.long_asc_node or 0.0,
        arg_perihelion_deg=orb.arg_perihelion or 0.0,
        n_points=n_points,
    )

    return {
        "designation": designation,
        "n_points": n_points,
        "points": [{"x": p[0], "y": p[1], "z": p[2]} for p in points],
    }


@router.get("/{designation}/physical")
async def get_asteroid_physical(designation: str, db: AsyncSession = Depends(get_db)):
    """Get physical parameters for an asteroid."""
    result = await db.execute(select(Asteroid).where(Asteroid.designation == designation))
    asteroid = result.scalar_one_or_none()
    if not asteroid:
        raise HTTPException(status_code=404, detail="Asteroid not found.")
    return asteroid.physical_params


@router.get("/{designation}/close-approaches")
async def get_close_approaches(
    designation: str,
    date_min: str = Query("now", description="Minimum date (e.g., 'now', '2025-01-01')"),
    date_max: str = Query("+10", description="Maximum date (e.g., '+10' years or '2035-01-01')"),
    dist_max: str = Query("0.05", description="Maximum distance in AU"),
    body: str = Query("Earth", description="Close approach body (default: Earth)"),
):
    """Get close approaches for an asteroid from CAD API."""
    approaches = await cad_client.get_close_approaches(
        designation=designation,
        date_min=date_min,
        date_max=date_max,
        dist_max=dist_max,
        body=body
    )
    return approaches


@router.post("/sync")
async def trigger_sync(background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    """Trigger a background sync of NHATS asteroid data."""
    background_tasks.add_task(full_sync, db)
    return {"message": "Sync started in background.", "status": "queued"}

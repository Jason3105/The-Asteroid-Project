"""
Data sync service: fetches NASA data and stores to PostgreSQL.
"""
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.models.asteroid import Asteroid
from app.models.orbital_elements import OrbitalElements
from app.models.physical_params import PhysicalParams
from app.models.composition import Composition
from app.models.trajectory import NhatsTrajectory
from app.models.evs_score import EvsScore

from app.services.jpl_client import jpl_client
from app.services.nhats_client import nhats_client
from app.services.composition_estimator import full_composition_analysis
from app.services.evs_engine import compute_evs

logger = logging.getLogger(__name__)


async def sync_nhats_asteroids(db: AsyncSession) -> int:
    """
    Fetch all accessible asteroids from NHATS and sync to DB.
    Returns count of synced asteroids.
    """
    nhats_data = await nhats_client.get_accessible_asteroids()
    logger.info(f"Fetched {len(nhats_data)} asteroids from NHATS.")
    synced = 0

    for nhats_entry in nhats_data:
        designation = nhats_entry.get("designation", "").strip()
        if not designation:
            continue

        try:
            await sync_asteroid_details(db, designation, nhats_entry)
            synced += 1
        except Exception as e:
            logger.error(f"Failed to sync asteroid {designation}: {e}")

    return synced


async def sync_asteroid_details(
    db: AsyncSession,
    designation: str,
    nhats_entry: dict = None,
) -> Asteroid:
    """
    Fetch full asteroid details from JPL SBDB and store/update in DB.
    """
    # Check if asteroid already exists
    result = await db.execute(select(Asteroid).where(Asteroid.designation == designation))
    asteroid = result.scalar_one_or_none()

    # Fetch from JPL SBDB
    raw_data = await jpl_client.get_asteroid(designation)
    parsed = jpl_client.parse_asteroid_data(raw_data) if raw_data else {}

    if not asteroid:
        asteroid = Asteroid(
            designation=parsed.get("designation") or designation,
            full_name=parsed.get("full_name") or designation,
            spkid=parsed.get("spkid"),
            is_neo=parsed.get("is_neo", True),
            is_pha=parsed.get("is_pha", False),
            orbit_class=parsed.get("orbit_class"),
        )
        db.add(asteroid)
        await db.flush()  # Get the ID
    else:
        asteroid.full_name = parsed.get("full_name") or asteroid.full_name
        asteroid.spkid = parsed.get("spkid") or asteroid.spkid
        asteroid.is_neo = parsed.get("is_neo", True)
        asteroid.is_pha = parsed.get("is_pha", False)
        asteroid.orbit_class = parsed.get("orbit_class") or asteroid.orbit_class

    # Upsert orbital elements
    if parsed.get("orbital_elements"):
        result = await db.execute(
            select(OrbitalElements).where(OrbitalElements.asteroid_id == asteroid.id)
        )
        orb = result.scalar_one_or_none()
        if not orb:
            orb = OrbitalElements(asteroid_id=asteroid.id)
            db.add(orb)
        for k, v in parsed["orbital_elements"].items():
            if v is not None:
                setattr(orb, k, v)

    # Upsert physical params
    phys_data = parsed.get("physical_params", {})
    if phys_data:
        result = await db.execute(
            select(PhysicalParams).where(PhysicalParams.asteroid_id == asteroid.id)
        )
        phys = result.scalar_one_or_none()
        if not phys:
            phys = PhysicalParams(asteroid_id=asteroid.id)
            db.add(phys)
        for k, v in phys_data.items():
            if v is not None:
                setattr(phys, k, v)

    # Upsert NHATS trajectory
    if nhats_entry:
        result = await db.execute(
            select(NhatsTrajectory).where(NhatsTrajectory.asteroid_id == asteroid.id)
        )
        traj = result.scalar_one_or_none()
        if not traj:
            traj = NhatsTrajectory(asteroid_id=asteroid.id)
            db.add(traj)
        for k, v in nhats_entry.items():
            if k != "designation" and hasattr(traj, k) and v is not None:
                setattr(traj, k, v)

    # Estimate composition and EVS score
    phys = phys_data
    spectral_type = phys.get("spectral_type_tholen") or phys.get("spectral_type_smass")
    analysis = full_composition_analysis(
        spectral_type=spectral_type,
        abs_magnitude=phys.get("abs_magnitude"),
        diameter_km=phys.get("diameter_km"),
        albedo=phys.get("albedo"),
        density=phys.get("density"),
    )

    # Upsert composition
    result = await db.execute(
        select(Composition).where(Composition.asteroid_id == asteroid.id)
    )
    comp = result.scalar_one_or_none()
    if not comp:
        comp = Composition(asteroid_id=asteroid.id)
        db.add(comp)
    comp_data = analysis["composition"]
    for k, v in comp_data.items():
        if hasattr(comp, k):
            setattr(comp, k, v)

    # Compute EVS
    delta_v = nhats_entry.get("min_delta_v") if nhats_entry else None
    evs_data = compute_evs(
        delta_v=delta_v,
        estimated_value_usd=analysis["total_value_usd"],
        min_duration_days=nhats_entry.get("min_duration_days") if nhats_entry else None,
        occ_code=nhats_entry.get("occ_code") if nhats_entry else None,
        rotation_period_h=phys.get("rotation_period_h"),
        diameter_km=analysis.get("diameter_km"),
    )

    result = await db.execute(
        select(EvsScore).where(EvsScore.asteroid_id == asteroid.id)
    )
    evs = result.scalar_one_or_none()
    if not evs:
        evs = EvsScore(asteroid_id=asteroid.id)
        db.add(evs)
    for k, v in evs_data.items():
        if hasattr(evs, k):
            setattr(evs, k, v)

    await db.commit()
    logger.info(f"Synced asteroid {designation} (EVS={evs_data['score']:.2f})")
    return asteroid


async def full_sync(db: AsyncSession) -> dict:
    """Run a complete data sync: NHATS + JPL details + EVS computation."""
    logger.info("Starting full PROSPECTOR data sync...")
    count = await sync_nhats_asteroids(db)
    logger.info(f"Full sync complete. Synced {count} asteroids.")
    return {"synced_count": count, "status": "complete"}

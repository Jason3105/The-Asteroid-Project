"""
JPL SBDB API client for fetching asteroid data from NASA.
Endpoints: ssd-api.jpl.nasa.gov/sbdb.api & sbdb_query.api
"""
import httpx
import logging
from typing import Optional, Any
from app.config import settings

logger = logging.getLogger(__name__)

JPL_TIMEOUT = 30.0
JPL_RETRIES = 3


class JPLClient:
    """Async HTTP client for the JPL Small-Body Database (SBDB) API."""

    def __init__(self):
        self.base_url = settings.JPL_BASE_URL
        self.sbdb_url = settings.SBDB_URL
        self.sbdb_query_url = settings.SBDB_QUERY_URL

    async def _get(self, url: str, params: dict) -> Optional[dict]:
        """Make an HTTP GET request with retries."""
        for attempt in range(JPL_RETRIES):
            try:
                async with httpx.AsyncClient(timeout=JPL_TIMEOUT) as client:
                    response = await client.get(url, params=params)
                    response.raise_for_status()
                    return response.json()
            except httpx.HTTPStatusError as e:
                logger.warning(f"HTTP error {e.response.status_code} on attempt {attempt + 1}: {url}")
            except httpx.TimeoutException:
                logger.warning(f"Timeout on attempt {attempt + 1}: {url}")
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
        return None

    async def get_asteroid(self, designation: str) -> Optional[dict]:
        """
        Fetch detailed data for a single asteroid by designation.
        Returns raw SBDB JSON or None on failure.
        """
        params = {
            "sstr": designation,
            "cov": "0",
            "phys-par": "1",
            "full-prec": "0",
        }
        data = await self._get(self.sbdb_url, params)
        if data and "object" in data:
            return data
        logger.warning(f"Asteroid not found: {designation}")
        return None

    async def search_asteroids(self, query: str, limit: int = 20) -> list[dict]:
        """
        Search asteroids by name/designation using SBDB.
        Returns list of matching asteroid objects.
        """
        params = {
            "sstr": query,
            "cov": "0",
            "phys-par": "0",
        }
        data = await self._get(self.sbdb_url, params)
        if not data:
            return []
        # SBDB returns list when multiple matches
        if "list" in data:
            return data["list"][:limit]
        if "object" in data:
            return [data]
        return []

    async def query_asteroids(
        self,
        is_neo: bool = True,
        orbit_class: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> dict:
        """
        Bulk query asteroids using SBDB Query API.
        Returns dict with count and data.
        """
        fields = "spkid,full_name,pdes,name,prefix,neo,pha,class,e,a,q,i,om,w,ma,period,moid,H,diameter,albedo"
        
        params = {
            "fields": fields,
            "limit": limit,
            "limit-from": offset,
        }

        if is_neo:
            params["sb-group"] = "neo"

        if orbit_class:
            params["sb-class"] = orbit_class

        data = await self._get(self.sbdb_query_url, params)
        return data or {"count": 0, "data": [], "fields": []}

    def parse_asteroid_data(self, raw: dict) -> dict:
        """
        Parse raw SBDB API response into a clean dictionary.
        """
        result = {}

        # Object identification
        obj = raw.get("object", {})
        result["designation"] = obj.get("des", "")
        result["full_name"] = obj.get("fullname", "")
        result["spkid"] = str(obj.get("spkid", ""))
        result["is_neo"] = obj.get("neo", "N") == "Y"
        result["is_pha"] = obj.get("pha", "N") == "Y"
        result["orbit_class"] = obj.get("orbit_class", {}).get("code", "") if isinstance(obj.get("orbit_class"), dict) else ""

        # Orbital elements
        orbit = raw.get("orbit", {})
        elements = orbit.get("elements", [])
        elem_map = {e["name"]: e.get("value") for e in elements if "name" in e}

        result["orbital_elements"] = {
            "epoch": self._safe_float(orbit.get("epoch")),
            "eccentricity": self._safe_float(elem_map.get("e")),
            "semi_major_axis": self._safe_float(elem_map.get("a")),
            "perihelion": self._safe_float(elem_map.get("q")),
            "inclination": self._safe_float(elem_map.get("i")),
            "long_asc_node": self._safe_float(elem_map.get("om")),
            "arg_perihelion": self._safe_float(elem_map.get("w")),
            "mean_anomaly": self._safe_float(elem_map.get("ma")),
            "period": self._safe_float(elem_map.get("per")),
            "moid": self._safe_float(orbit.get("moid")),
        }

        # Physical parameters
        phys = raw.get("phys_par", [])
        phys_map = {p["name"]: p.get("value") for p in phys if "name" in p}

        result["physical_params"] = {
            "abs_magnitude": self._safe_float(phys_map.get("H")),
            "diameter_km": self._safe_float(phys_map.get("diameter")),
            "albedo": self._safe_float(phys_map.get("albedo")),
            "density": self._safe_float(phys_map.get("density")),
            "rotation_period_h": self._safe_float(phys_map.get("rot_per")),
            "spectral_type_tholen": phys_map.get("spec_T"),
            "spectral_type_smass": phys_map.get("spec_B"),
        }

        return result

    @staticmethod
    def _safe_float(value) -> Optional[float]:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None


# Singleton instance
jpl_client = JPLClient()

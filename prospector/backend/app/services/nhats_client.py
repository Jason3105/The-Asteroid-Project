"""
NHATS API client - NASA Human Accessible Targets Study.
Endpoint: ssd-api.jpl.nasa.gov/nhats.api
"""
import httpx
import logging
from typing import Optional
from datetime import date
from app.config import settings

logger = logging.getLogger(__name__)
TIMEOUT = 30.0
RETRIES = 3


class NhatsClient:
    """Async HTTP client for the JPL NHATS API."""

    def __init__(self):
        self.nhats_url = settings.NHATS_URL

    async def _get(self, params: dict) -> Optional[dict]:
        for attempt in range(RETRIES):
            try:
                async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                    resp = await client.get(self.nhats_url, params=params)
                    resp.raise_for_status()
                    return resp.json()
            except httpx.HTTPStatusError as e:
                logger.warning(f"NHATS HTTP {e.response.status_code} attempt {attempt+1}")
            except httpx.TimeoutException:
                logger.warning(f"NHATS timeout attempt {attempt+1}")
            except Exception as e:
                logger.error(f"NHATS error attempt {attempt+1}: {e}")
        return None

    async def get_accessible_asteroids(
        self,
        dv_max: float = 12.0,
        dur_min: int = 60,
        dur_max: int = 450,
    ) -> list[dict]:
        """
        Fetch list of accessible NEAs from NHATS.
        Returns parsed list of asteroid trajectory summaries.
        """
        params = {
            "dv": dv_max,
            "dur": dur_max,
            "stay": 8,
            "launch": "2025,2035",
            "plot": "0",
        }
        data = await self._get(params)
        if not data or "data" not in data:
            return []
        return [self._parse_nhats_entry(entry) for entry in data["data"]]

    async def get_asteroid_trajectories(self, designation: str) -> Optional[dict]:
        """
        Fetch detailed trajectory data for a specific asteroid.
        """
        params = {
            "sstr": designation,
            "dv": 12.0,
            "dur": 450,
            "stay": 8,
            "plot": "0",
        }
        data = await self._get(params)
        if not data or "data" not in data:
            return None
        if data["data"]:
            return self._parse_nhats_entry(data["data"][0])
        return None

    def _parse_nhats_entry(self, entry: dict) -> dict:
        """Parse a single NHATS data entry into a clean dict."""
        return {
            "designation": entry.get("des", ""),
            "min_delta_v": self._sf(entry.get("min_dv")),
            "min_duration_days": self._sf(entry.get("min_dur")),
            "n_viable_trajectories": int(entry.get("n_via_traj", 0) or 0),
            "occ_code": int(entry.get("occ", 0) or 0),
            "launch_date": self._parse_date(entry.get("launch")),
            "outbound_days": int(entry.get("out_days", 0) or 0),
            "stay_days": int(entry.get("stay_days", 8) or 8),
            "return_days": int(entry.get("ret_days", 0) or 0),
            "c3": self._sf(entry.get("c3")),
            "departure_v_inf": self._sf(entry.get("vinf")),
        }

    @staticmethod
    def _sf(value) -> Optional[float]:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _parse_date(date_str) -> Optional[date]:
        if not date_str:
            return None
        try:
            parts = str(date_str).split("-")
            if len(parts) == 3:
                return date(int(parts[0]), int(parts[1]), int(parts[2]))
        except Exception:
            pass
        return None


nhats_client = NhatsClient()

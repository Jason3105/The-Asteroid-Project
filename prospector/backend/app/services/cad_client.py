"""
Close Approach Data API client.
Endpoint: ssd-api.jpl.nasa.gov/cad.api
"""
import httpx
import logging
from typing import Optional
from app.config import settings
from app.utils.unit_converter import au_to_km, au_to_ld

logger = logging.getLogger(__name__)
TIMEOUT = 30.0
RETRIES = 3


class CadClient:
    """Async HTTP client for JPL Close Approach Data (CAD) API."""

    def __init__(self):
        self.cad_url = settings.CAD_URL

    async def _get(self, params: dict) -> Optional[dict]:
        for attempt in range(RETRIES):
            try:
                async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                    resp = await client.get(self.cad_url, params=params)
                    resp.raise_for_status()
                    return resp.json()
            except httpx.HTTPStatusError as e:
                logger.warning(f"CAD HTTP {e.response.status_code} attempt {attempt+1}")
            except httpx.TimeoutException:
                logger.warning(f"CAD timeout attempt {attempt+1}")
            except Exception as e:
                logger.error(f"CAD error attempt {attempt+1}: {e}")
        return None

    async def get_close_approaches(
        self,
        designation: Optional[str] = None,
        date_min: str = "now",
        date_max: str = "+10",
        dist_max: str = "0.05",
        body: str = "Earth",
    ) -> list[dict]:
        """
        Fetch close approach events.
        Returns list of parsed approach events.
        """
        params = {
            "date-min": date_min,
            "date-max": date_max,
            "dist-max": dist_max,
            "body": body,
            "sort": "date",
            "limit": 100,
            "fullname": 1,
        }
        if designation:
            params["des"] = designation

        data = await self._get(params)
        if not data or "data" not in data:
            return []

        fields = data.get("fields", [])
        field_index = {name: i for i, name in enumerate(fields)}

        results = []
        for row in data["data"]:
            try:
                dist_au = self._sf(row[field_index.get("dist", -1)] if field_index.get("dist") is not None else None)
                results.append({
                    "designation": row[field_index.get("des", 0)] if "des" in field_index else "",
                    "full_name": row[field_index.get("fullname", 1)] if "fullname" in field_index else "",
                    "date": row[field_index.get("cd", 2)] if "cd" in field_index else "",
                    "dist_au": dist_au,
                    "dist_km": au_to_km(dist_au) if dist_au else None,
                    "dist_ld": au_to_ld(dist_au) if dist_au else None,
                    "v_rel": self._sf(row[field_index.get("v_rel", -1)] if "v_rel" in field_index else None),
                    "v_inf": self._sf(row[field_index.get("v_inf", -1)] if "v_inf" in field_index else None),
                    "h": self._sf(row[field_index.get("h", -1)] if "h" in field_index else None),
                })
            except Exception as e:
                logger.warning(f"Failed to parse CAD row: {e}")
        return results

    @staticmethod
    def _sf(value) -> Optional[float]:
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None


cad_client = CadClient()

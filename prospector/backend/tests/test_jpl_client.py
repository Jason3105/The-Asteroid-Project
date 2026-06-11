"""Tests for JPL client."""
import pytest
from unittest.mock import AsyncMock, patch
from app.services.jpl_client import JPLClient


@pytest.mark.asyncio
async def test_get_asteroid_success():
    """Test successful asteroid fetch."""
    mock_data = {
        "object": {
            "des": "433",
            "fullname": "433 Eros",
            "spkid": "2000433",
            "neo": "Y",
            "pha": "N",
            "orbit_class": {"code": "AMO"},
        },
        "orbit": {
            "epoch": 2460200.5,
            "moid": "0.1491",
            "elements": [
                {"name": "e", "value": "0.22278"},
                {"name": "a", "value": "1.4581"},
                {"name": "q", "value": "1.1333"},
                {"name": "i", "value": "10.828"},
                {"name": "om", "value": "304.30"},
                {"name": "w", "value": "178.66"},
                {"name": "ma", "value": "37.0"},
                {"name": "per", "value": "643.22"},
            ],
        },
        "phys_par": [
            {"name": "H", "value": "10.4"},
            {"name": "diameter", "value": "16.84"},
            {"name": "albedo", "value": "0.25"},
        ],
    }

    client = JPLClient()
    with patch.object(client, "_get", return_value=mock_data):
        result = await client.get_asteroid("433")
        assert result is not None
        assert result["object"]["des"] == "433"


def test_parse_asteroid_data():
    """Test parsing of raw SBDB response."""
    client = JPLClient()
    mock_data = {
        "object": {
            "des": "433",
            "fullname": "433 Eros",
            "spkid": "2000433",
            "neo": "Y",
            "pha": "N",
            "orbit_class": {"code": "AMO"},
        },
        "orbit": {
            "epoch": 2460200.5,
            "moid": "0.1491",
            "elements": [
                {"name": "e", "value": "0.22278"},
                {"name": "a", "value": "1.4581"},
            ],
        },
        "phys_par": [
            {"name": "H", "value": "10.4"},
            {"name": "diameter", "value": "16.84"},
        ],
    }

    parsed = client.parse_asteroid_data(mock_data)
    assert parsed["designation"] == "433"
    assert parsed["full_name"] == "433 Eros"
    assert parsed["is_neo"] is True
    assert parsed["orbital_elements"]["eccentricity"] == 0.22278
    assert parsed["physical_params"]["abs_magnitude"] == 10.4

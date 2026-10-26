import pytest


@pytest.mark.asyncio
async def test_list_incidents(client):
    response = await client.get("/api/v1/incidents")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 4  # Seeded items


@pytest.mark.asyncio
async def test_track_incident_by_reference(client):
    response = await client.get("/api/v1/incidents/track/DR360-2026-FL001")
    assert response.status_code == 200
    data = response.json()
    assert data["reference_number"] == "DR360-2026-FL001"
    assert data["category"] == "flooding"
    assert data["status"] == "in_progress"


@pytest.mark.asyncio
async def test_create_incident_report(client):
    new_report = {
        "title": "Severe Flash Flooding near Musi River Bank",
        "description": "Rising water levels entered ground-floor homes. Rescue boats requested.",
        "category": "flooding",
        "severity": "high",
        "district": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3750,
        "longitude": 78.4720,
    }
    response = await client.post("/api/v1/incidents", json=new_report)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == new_report["title"]
    assert "DR360-" in data["reference_number"]
    assert data["status"] == "submitted"

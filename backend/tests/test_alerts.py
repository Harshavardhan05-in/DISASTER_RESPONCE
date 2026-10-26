import pytest


@pytest.mark.asyncio
async def test_list_alerts(client):
    response = await client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)
    assert len(alerts) >= 2


@pytest.mark.asyncio
async def test_analytics_overview(client):
    response = await client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    overview = response.json()
    assert "total_incidents" in overview
    assert overview["total_incidents"] >= 4
    assert "by_category" in overview
    assert "resolution_rate_percent" in overview

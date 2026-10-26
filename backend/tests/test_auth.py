import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Disaster Response 360" in data["app"]


@pytest.mark.asyncio
async def test_login_seeded_admin(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@dr360.local",
        "password": "AdminPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_invalid_password(client):
    response = await client.post("/api/v1/auth/login", json={
        "email": "admin@dr360.local",
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_profile(client):
    # First login
    login_resp = await client.post("/api/v1/auth/login", json={
        "email": "citizen@dr360.local",
        "password": "CitizenPass123!"
    })
    token = login_resp.json()["access_token"]

    # Call /me with Bearer token
    profile_resp = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert profile_resp.status_code == 200
    user_data = profile_resp.json()
    assert user_data["email"] == "citizen@dr360.local"
    assert user_data["role"] == "citizen"

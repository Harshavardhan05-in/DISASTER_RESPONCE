import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app as fastapi_app
from app.db.session import engine
from app.db.base import Base
import app.models


@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac

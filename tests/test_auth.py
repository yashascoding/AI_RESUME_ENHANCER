"""Tests for JWT authentication endpoints (integration tests against running server)."""
import uuid
import httpx
import pytest
from httpx import AsyncClient

BASE = "http://localhost:8001"


def _email(prefix: str) -> str:
    """Generate a unique email to avoid 409 conflicts."""
    return f"{prefix}_{uuid.uuid4().hex[:8]}@example.com"


@pytest.mark.anyio
async def test_health_check():
    async with AsyncClient(base_url=BASE) as c:
        resp = await c.get("/")
        assert resp.status_code == 200
        assert resp.json()["status"] == "Healthy"


@pytest.mark.anyio
async def test_register_success():
    async with AsyncClient(base_url=BASE) as c:
        email = _email("reg")
        resp = await c.post("/auth/register", json={
            "name": "Test User",
            "email": email,
            "password": "secure123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["name"] == "Test User"


@pytest.mark.anyio
async def test_register_duplicate_email():
    async with AsyncClient(base_url=BASE) as c:
        email = _email("dup")
        await c.post("/auth/register", json={
            "name": "Dup A",
            "email": email,
            "password": "pass123",
        })
        resp = await c.post("/auth/register", json={
            "name": "Dup B",
            "email": email,
            "password": "pass456",
        })
        assert resp.status_code == 409


@pytest.mark.anyio
async def test_register_short_password():
    async with AsyncClient(base_url=BASE) as c:
        resp = await c.post("/auth/register", json={
            "name": "Short",
            "email": _email("short"),
            "password": "ab",
        })
        assert resp.status_code == 422


@pytest.mark.anyio
async def test_login_success():
    async with AsyncClient(base_url=BASE) as c:
        email = _email("login")
        await c.post("/auth/register", json={
            "name": "Login User",
            "email": email,
            "password": "mypass123",
        })
        resp = await c.post("/auth/login", json={
            "email": email,
            "password": "mypass123",
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()


@pytest.mark.anyio
async def test_login_wrong_password():
    async with AsyncClient(base_url=BASE) as c:
        email = _email("wrong")
        await c.post("/auth/register", json={
            "name": "Wrong",
            "email": email,
            "password": "correct123",
        })
        resp = await c.post("/auth/login", json={
            "email": email,
            "password": "incorrect",
        })
        assert resp.status_code == 401


@pytest.mark.anyio
async def test_login_nonexistent_user():
    async with AsyncClient(base_url=BASE) as c:
        resp = await c.post("/auth/login", json={
            "email": _email("noexist"),
            "password": "pass123",
        })
        assert resp.status_code == 401


@pytest.mark.anyio
async def test_get_me_with_token():
    async with AsyncClient(base_url=BASE) as c:
        email = _email("me")
        reg = await c.post("/auth/register", json={
            "name": "Me User",
            "email": email,
            "password": "pass123",
        })
        token = reg.json()["access_token"]
        resp = await c.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["email"] == email


@pytest.mark.anyio
async def test_get_me_without_token():
    async with AsyncClient(base_url=BASE) as c:
        resp = await c.get("/auth/me")
        assert resp.status_code in (401, 403)


@pytest.mark.anyio
async def test_get_me_invalid_token():
    async with AsyncClient(base_url=BASE) as c:
        resp = await c.get("/auth/me", headers={"Authorization": "Bearer invalidtoken"})
        assert resp.status_code == 401


@pytest.mark.anyio
async def test_protected_analyze_without_token():
    async with AsyncClient(base_url=BASE) as c:
        resp = await c.post("/analyze", json={
            "resume_text": "test resume",
            "job_description": "test jd",
        })
        assert resp.status_code in (401, 403)


@pytest.mark.anyio
async def test_protected_analyze_with_token():
    async with AsyncClient(base_url=BASE, timeout=10.0) as c:
        email = _email("analyze")
        reg = await c.post("/auth/register", json={
            "name": "Analyze User",
            "email": email,
            "password": "pass123",
        })
        token = reg.json()["access_token"]
        try:
            resp = await c.post("/analyze", json={
                "resume_text": "test resume",
                "job_description": "test jd",
            }, headers={"Authorization": f"Bearer {token}"})
            # Should NOT be 401/403 (auth passed), may be 200 or 500
            assert resp.status_code not in (401, 403)
        except httpx.ReadTimeout:
            # Groq pipeline may timeout in tests — that's fine, auth passed
            pass

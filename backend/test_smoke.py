import asyncio
import httpx
from app.main import app

async def main():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.get("/api/health")
        print("Health Status:", r.status_code, r.json())
        
        r2 = await client.get("/api/public/latest-news")
        print("Latest News Count:", len(r2.json()))

        r3 = await client.get("/api/public/editions/en/latest")
        print("Latest English Edition:", r3.json()["title"])

        login = await client.post("/api/auth/login", json={"email": "admin@risenshine.com", "password": "RiseAdmin@2026!"})
        print("Login Status:", login.status_code)
        token = login.json()["access_token"]
        print("Token prefix:", token[:20])

        dash = await client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
        print("Admin Dashboard Stats:", dash.json()["stats"])

if __name__ == "__main__":
    asyncio.run(main())

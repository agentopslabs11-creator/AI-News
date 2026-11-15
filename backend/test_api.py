import asyncio
import httpx
from app.main import app

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("1. Health check:")
        res = await client.get("/api/health")
        print("Status:", res.status_code, res.json())
        assert res.status_code == 200

        print("2. Public editions:")
        res = await client.get("/api/public/editions")
        data = res.json()
        print("Found published editions:", len(data))
        assert len(data) >= 3

        print("3. Latest news:")
        res = await client.get("/api/public/latest-news")
        print("Found latest news:", len(res.json()))

        print("4. Latest e-paper for English:")
        res = await client.get("/api/public/editions/en/latest")
        assert res.status_code == 200
        epaper = res.json()
        print("Title:", epaper["title"])
        assert "Rise ’n’ Shine" in epaper["html_content"]

        print("5. Login Admin:")
        login_res = await client.post(
            "/api/auth/login",
            json={"email": "admin@risenshine.com", "password": "RiseAdmin@2026!"}
        )
        assert login_res.status_code == 200
        auth_data = login_res.json()
        token = auth_data["access_token"]
        print("Admin authenticated! Token received.")

        print("6. Admin Dashboard:")
        dash_res = await client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert dash_res.status_code == 200
        print("Dashboard stats:", dash_res.json()["stats"])

        print("7. HTML Validation:")
        sample_html = b"<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Sample News</h1><p>Body text</p></body></html>"
        val_res = await client.post(
            "/api/admin/editions/validate",
            files={"file": ("test.html", sample_html, "text/html")},
            headers={"Authorization": f"Bearer {token}"}
        )
        assert val_res.status_code == 200
        print("Validation response:", val_res.json())

        print("\nALL IN-MEMORY ASGI INTEGRATION TESTS PASSED 100%!")

if __name__ == "__main__":
    asyncio.run(run_tests())

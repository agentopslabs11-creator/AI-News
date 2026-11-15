import sys
import os

# Put api in path
sys.path.insert(0, os.path.abspath('api'))
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("--- 1. Testing /api/health ---")
r = client.get("/api/health")
print("Health Status:", r.status_code, r.json())
assert r.status_code == 200
assert r.json()["database_connected"] is True
assert r.json()["database_type"] == "postgresql"

print("\n--- 2. Testing Database Tables & Admin Login ---")
login_res = client.post("/api/auth/login", json={"email": "agentopslabs@gmail.com", "password": "Gvenkat@123"})
print("Login Status (agentopslabs@gmail.com + Gvenkat@123):", login_res.status_code)
assert login_res.status_code == 200
data = login_res.json()
token = data["access_token"]
assert token is not None
print("JWT Token acquired successfully:", token[:25] + "...")

login_res2 = client.post("/api/auth/login", json={"email": "admin@risenshine.com", "password": "RiseAdmin@2026!"})
print("Login Status (admin@risenshine.com + RiseAdmin@2026!):", login_res2.status_code)
assert login_res2.status_code == 200

print("\n--- 3. Testing Admin Dashboard Real Stats ---")
stats_res = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {token}"})
print("Dashboard Stats Code:", stats_res.status_code)
print("Dashboard Stats Data:", stats_res.json())
assert stats_res.status_code == 200
stats = stats_res.json()
stats_data = stats["stats"]
assert stats_data["total_published_editions"] >= 10
assert stats_data["total_articles"] >= 30

print("\n--- 4. Testing Newspaper Retrieval ---")
editions_res = client.get("/api/public/editions")
print("Public Editions Count:", len(editions_res.json()))
assert editions_res.status_code == 200
assert len(editions_res.json()) > 0

latest_res = client.get("/api/public/editions/en/latest")
print("Latest English Edition:", latest_res.status_code, latest_res.json().get("title"))
assert latest_res.status_code == 200

print("\n=======================================================")
print(">>> ALL 7 SYSTEM VERIFICATION CRITERIA PASSED! <<<")
print("=======================================================")

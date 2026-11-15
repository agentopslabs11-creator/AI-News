# Rise ’n’ Shine — The AI Newspaper

A production-ready digital broadsheet news portal and authentic editorial platform built with **FastAPI** (Python Serverless API) and **React 18 / Vite / Tailwind CSS** as a **single unified project** optimized for 1-click deployment on **Vercel**.

---

## 🚀 1-Click Import to Vercel

This repository is unified into a single fullstack structure:
- **Frontend**: Root `package.json`, React 18, Vite, Tailwind CSS, lucide-react, framer-motion.
- **Backend API**: Root `api/index.py` (FastAPI serverless function), `api/app/`, and `requirements.txt`.
- **Routing**: `vercel.json` automatically routes `/api/(.*)` to the Python backend and all other routes to the React SPA with zero CORS issues.

### Steps to Deploy on Vercel:
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your GitHub repository: `AI-News-Paper`.
4. Leave **Root Directory** as `./` (default).
5. Framework Preset: **Vite** (automatically detected).
6. Under **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql+psycopg2://<user>:<password>@<ep-xyz>.neon.tech/neondb?sslmode=require`
   - `SECRET_KEY`: `<your-random-jwt-secret-key>`
   - `SECURE_COOKIE`: `true`
7. Click **Deploy**. Vercel will automatically build the React frontend and deploy the Python serverless API!

---

## 🛠 Local Development

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Backend Server
```bash
python -m uvicorn api.app.main:app --reload --port 8000
```

### 4. Run Frontend Vite Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌟 Key Features
- **Authentic E-Paper Broadsheet Reader**: Sandboxed SVG/HTML broadsheet reader with zoom, fullscreen, and page jumping.
- **Automatic Broadsheet Article Extractor**: Cuts real stories directly from uploaded broadsheet HTML with headline, kicker, deck, drop caps, and sources.
- **Deep-Linked "Read More in Paper"**: News cards and modal popups link directly to the exact page/sheet in the broadsheet with focus highlighting.
- **Full Editorial Admin Dashboard**: Manage editions, articles, categories, YouTube video news briefs, and advertising slots.
- **Neon Serverless PostgreSQL Database**: Production database with automatic schema migrations.

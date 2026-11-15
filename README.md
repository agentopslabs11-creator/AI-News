# Rise ’n’ Shine – The AI Newspaper

**Rise ’n’ Shine – The AI Newspaper** is a production-oriented digital newspaper platform delivering a high-fidelity digital broadsheet reading experience across three independent language editions: **English**, **Telugu (తెలుగు)**, and **Hindi (हिंदी)**.

The platform provides a public newspaper website with real-time editorial feeds, YouTube video broadcasts, a historical archive, a sandboxed digital E-Paper reader, and a secure administration dashboard for verified editors.

---

## Brand Identity & Visual Design

- **Dominant Design:** **Maximum Pure White Background (`#FFFFFF`)**
- **Primary Brand Blue:** Royal Blue (`#1719D9`) – used for editorial headlines, brand wordmarks, and primary actions
- **Primary Accent:** Lime Green (`#C6FD04`) – used for active navigation indicators, edition badges, and highlights
- **Secondary Accent:** Sunshine Yellow (`#FFD21A`) – used for breaking news badges, special announcements, and highlights
- **Text:** Charcoal (`#242424`)
- **Secondary Text:** Muted Gray (`#747474`)
- **Borders:** Light Gray (`#EEEEEE`)
- **Typography:**
  - Headlines: *Playfair Display*
  - UI / Body: *Inter*
  - Telugu Content: *Noto Sans Telugu*
  - Hindi Content: *Noto Sans Devanagari*

---

## Critical Storage Requirement

**Neon PostgreSQL is the sole permanent storage system.**
All daily newspaper broadsheet HTML content is stored directly in PostgreSQL using a `TEXT` column (`newspaper_editions.html_content`).

- **No AWS S3, Cloudflare R2, Firebase, Supabase Storage, or permanent local disk storage is used.**
- Uploaded HTML files are validated, processed, and sanitized in-memory by FastAPI and saved directly into Neon PostgreSQL.
- The Digital E-Paper Reader renders the stored HTML inside an isolated, sandboxed `<iframe>` (`sandbox="allow-same-origin"` without script execution) to maintain layout fidelity while preventing script injection.

---

## Technology Stack

### Frontend
- **Framework:** React.js 18 with Vite & TypeScript
- **Styling:** Tailwind CSS with custom brand palette
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Router:** React Router v6
- **HTTP Client:** Axios with CSRF & credential support

### Backend
- **Framework:** Python 3.13 / FastAPI
- **ORM & Migrations:** SQLAlchemy 2.0
- **Validation:** Pydantic v2
- **HTML Sanitization:** BeautifulSoup4 (explicit allowlist stripping scripts, events, and unsafe protocols)
- **Password Hashing:** Argon2 (`argon2-cffi`)
- **Authentication:** JWT tokens via HttpOnly, Secure, SameSite cookies with CSRF validation
- **Database Driver:** `psycopg2-binary` (compatible with Neon serverless connection pooler)

### Cloud Deployment
- **Frontend:** Vercel (SPA fallback via `vercel.json`)
- **Backend:** Render (configured via `render.yaml` and `Procfile`)
- **Database:** Neon PostgreSQL (serverless PostgreSQL with SSL)

---

## Project Structure

```
e:\AI News\
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # App settings & environment validation
│   │   │   ├── database.py       # SQLAlchemy engine & session maker
│   │   │   └── security.py       # Argon2 password hashing & JWT handling
│   │   ├── models/
│   │   │   ├── admin.py          # Administrator accounts
│   │   │   ├── newspaper.py      # Editions (HTML stored in TEXT column)
│   │   │   ├── article.py        # Wire stories & articles
│   │   │   ├── category.py       # News categories
│   │   │   ├── video.py          # YouTube video entries
│   │   │   └── activity_log.py   # Admin audit logs
│   │   ├── schemas/              # Pydantic validation schemas
│   │   ├── routers/
│   │   │   ├── auth.py           # Admin login, logout, me
│   │   │   ├── public.py         # Public editions, articles, breaking ticker
│   │   │   ├── editions.py       # HTML upload, validation, replace, publish
│   │   │   ├── articles.py       # Article management
│   │   │   ├── categories.py     # Category management
│   │   │   ├── videos.py         # YouTube video management
│   │   │   ├── admin.py          # Dashboard metrics & logs
│   │   │   └── archive.py        # Year/Month/Date archive tree
│   │   ├── services/
│   │   │   ├── html_processor.py # BeautifulSoup4 HTML validation & sanitization
│   │   │   └── auth_service.py   # Credentials & audit logging
│   │   ├── dependencies/
│   │   │   └── authentication.py # HttpOnly cookie & CSRF validation
│   │   └── main.py               # FastAPI entrypoint & CORS
│   ├── seed_data.py              # Seeds admin, categories, broadsheets & wire
│   ├── requirements.txt
│   ├── Procfile                  # Render startup
│   ├── render.yaml               # Render infrastructure blueprint
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── public/
│   │   ├── rise-logo.svg         # Official Rise 'n' Shine SVG logo
│   │   ├── sample_epaper_en.html # Sample broadsheet for testing upload
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Logo, Modal, Toast, Skeleton, Badges
│   │   │   ├── layout/           # Header, Navigation, Footer, AdminLayout
│   │   │   ├── newspaper/        # BreakingTicker, Hero, NewsCard, VideoCard
│   │   │   └── admin/            # AdminSidebar, StatsCard
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Public homepage with 3-language tabs
│   │   │   ├── LatestNews.tsx    # Combined multilingual wire feed
│   │   │   ├── EnglishEdition.tsx# Dedicated English desk
│   │   │   ├── TeluguEdition.tsx # Dedicated Telugu desk (తెలుగు ఎడిషన్)
│   │   │   ├── HindiEdition.tsx  # Dedicated Hindi desk (हिंदी संस्करण)
│   │   │   ├── EpaperReader.tsx  # Sandboxed HTML reader with zoom & nav
│   │   │   ├── Videos.tsx        # Video broadcasts with YouTube modal
│   │   │   ├── Archive.tsx       # Date-based newspaper archive
│   │   │   ├── About.tsx         # Editorial charter & ethics
│   │   │   ├── AdminLogin.tsx    # Secure staff sign-in
│   │   │   ├── AdminDashboard.tsx# Publishing metrics & activity logs
│   │   │   ├── UploadEdition.tsx # HTML upload & validation workflow
│   │   │   ├── ManageEditions.tsx# Table, HTML replacement, preview, delete
│   │   │   ├── ManageArticles.tsx# Article CRUD & category assignment
│   │   │   ├── ManageCategories.tsx # Category CRUD
│   │   │   ├── ManageVideos.tsx  # YouTube video CRUD
│   │   │   └── AdminSettings.tsx # Security profile & password change
│   │   ├── services/             # API client, auth & newspaper calls
│   │   ├── hooks/                # useAuth hook & AuthProvider
│   │   ├── types/                # TypeScript interfaces
│   │   ├── App.tsx               # Routing
│   │   ├── main.tsx
│   │   └── index.css             # Tailwind base & continuous marquee
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json               # SPA fallback configuration
│   ├── .env.example
│   └── .env
└── README.md
```

---

## Local Development Setup

### 1. Backend Setup

```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with initial administrator and daily editions
python seed_data.py

# Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

The interactive API documentation is available at `http://127.0.0.1:8000/api/docs`.

### 2. Frontend Setup

```bash
cd frontend

# Install node packages
npm install

# Start Vite dev server (proxies /api to http://127.0.0.1:8000)
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Default Administrative Credentials

The platform is seeded with an initial Chief Editorial Administrator account:

- **Email:** `admin@risenshine.com`
- **Password:** `RiseAdmin@2026!`
- **Role:** `admin`

Public registration is permanently disabled. Administrators can update their password at any time from **Admin Settings**.

---

## Publishing Workflow

1. Navigate to `http://localhost:5173/admin/login` and log in.
2. Select **Upload Newspaper** from the sidebar.
3. Choose the target language (**English**, **తెలుగు**, or **हिंदी**).
4. Select the publication date.
5. Upload an HTML file (e.g. `frontend/public/sample_epaper_en.html`).
6. The system automatically validates UTF-8 encoding, strips dangerous tags, and calculates content size.
7. Click **Live Broadsheet Preview** to inspect the layout inside an isolated sandbox.
8. Choose **Save as Draft** or **Publish Immediately**.
9. Click **Publish Edition** — the HTML is saved directly into the `newspaper_editions` table in PostgreSQL.
10. The edition appears immediately on the public website, language desk, and historical archive.
11. If an edition already exists for that language and date, the system prompts for explicit confirmation before replacing the HTML.

---

## Deployment Guide

### A. Neon PostgreSQL Database
1. Create a serverless PostgreSQL project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string (e.g. `postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require`).
3. Set this connection string as the `DATABASE_URL` environment variable in your backend.

### B. Render (Backend)
1. Link your repository to [render.com](https://render.com).
2. Create a new **Web Service** pointing to the `backend/` directory.
3. Configuration:
   - **Environment:** Python
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `SECRET_KEY`: A secure random 64-character string
   - `SECURE_COOKIE`: `true`
   - `COOKIE_SAMESITE`: `none` (for cross-site cookies between Render backend and Vercel frontend)
   - `MAX_UPLOAD_SIZE_MB`: `5`
   - `BACKEND_CORS_ORIGINS`: `["https://your-app.vercel.app"]`
5. Run `python seed_data.py` once via Render Shell to initialize tables and initial admin.

### C. Vercel (Frontend)
1. Import your repository into [vercel.com](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Configuration:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-render-backend-api.onrender.com`
5. Deploy. `vercel.json` automatically ensures all client-side routes fallback to `index.html`.

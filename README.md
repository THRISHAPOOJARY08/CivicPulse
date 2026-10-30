# CivicPulse — AI-Powered Civic Complaint Management Platform

> Hackathon submission · 8-hour solo build · Supabase + Gemini + React + Express

CivicPulse connects citizens directly with municipal departments using AI-assisted triage to resolve potholes, streetlights, water leaks, and public safety issues faster. Citizens report problems, Gemini AI categorises and summarises them, a deterministic engine calculates priority, and administrators manage resolution — all visible on a live Leaflet map with geographic hotspot detection.

---

## Four Lifecycle Stages

| Stage | What it does |
|-------|-------------|
| **CAPTURE** | Citizen submits a complaint with GPS location via Leaflet map |
| **UNDERSTAND** | Gemini AI categorises, summarises, extracts keywords; deterministic engine scores priority |
| **REVEAL** | Leaflet map shows complaint markers colour-coded by priority; 0.01° grid hotspot detection |
| **ACT** | Admin reviews AI analysis, updates status with notes, citizen tracks progress in real time |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS via CDN (Google Stitch design system) |
| Backend | Node.js 18 + Express 4 |
| Auth + Database | Supabase (Spark free tier — no billing) |
| AI | Google Gemini `gemini-1.5-flash` (free tier) |
| Maps | Leaflet 1.9 + OpenStreetMap |

---

## Quick Start

> **Full instructions:** see [`LOCAL_SETUP.md`](LOCAL_SETUP.md)

### 1. Prerequisites
- Node.js ≥ 18
- Free [Supabase](https://supabase.com) account
- Free [Google AI Studio](https://aistudio.google.com) API key

### 2. Database
Apply `backend/supabase/schema.sql` in your Supabase project's SQL Editor.

### 3. Environment files
```bash
cp backend/.env.example backend/.env     # fill in Supabase + Gemini keys
cp frontend/.env.example frontend/.env   # fill in Supabase URL + anon key
```

### 4. Run both servers
```bash
# Terminal 1
cd backend && npm install && npm run dev    # → http://localhost:5000

# Terminal 2
cd frontend && npm install && npm run dev   # → http://localhost:5173
```

### 5. Create admin account
```bash
# Register first at http://localhost:5173/register, then:
node scripts/set-admin-supabase.js your@email.com
```

### 6. (Optional) Seed demo data
```bash
node scripts/seed-demo-data.js <your-supabase-user-uuid>
```

---

## Application Routes

| URL | Description | Auth |
|-----|-------------|------|
| `/` | Landing page | Public |
| `/register` | Create citizen account | Public |
| `/login` | Sign in | Public |
| `/map` | Public complaint map with hotspot circles | Public |
| `/submit` | Submit new complaint with GPS map picker | Citizen |
| `/complaints` | My complaints list with status filters | Citizen |
| `/complaints/:id` | Complaint detail, AI analysis, priority, duplicates | Citizen |
| `/admin` | Admin dashboard — all complaints, status updates | Admin only |

---

## Key Features

### AI Analysis (Gemini `gemini-1.5-flash`)
- Category classification from 8 civic categories
- Concise plain-language summary
- Keyword extraction
- Department recommendation
- Graceful fallback if Gemini is unavailable — complaint is always stored

### Deterministic Priority Engine
- Calculated independently of Gemini
- Factors: category urgency, keywords, description severity signals
- Produces: Low / Medium / High / Critical with explanation reasons
- Deterministic — same input always produces same result

### Duplicate Detection
- Haversine distance calculation
- 300-metre geographic threshold
- 30-day time window
- 100-complaint candidate cap
- Graduated similarity scoring (0–100)

### Geographic Hotspot Detection
- 0.01° grid cell grouping (~1.1 km × 1.1 km)
- Threshold: ≥ 3 complaints per cell
- Calculated in-memory on every `/api/analytics/hotspots` call — no stored state
- Visualised as dashed red circles on the Leaflet map (admin only)

### Role-Based Access
- Citizens: own complaints only, no admin endpoints
- Admins: all complaints, status updates, analytics, hotspots
- Role stored server-side in `public.users` — never trusted from JWT payload
- Admin bootstrap via one-time local script only

---

## Project Structure

```
CivicPulse/
├── backend/                   Express API (port 5000)
│   ├── .env.example           Configuration template
│   ├── src/
│   │   ├── routes/            REST endpoints
│   │   ├── controllers/       Business logic
│   │   ├── services/          Gemini, hotspot, duplicate, priority
│   │   └── middleware/        Auth, validation, error handling
│   └── supabase/schema.sql    Database schema
├── frontend/                  React + Vite (port 5173)
│   ├── .env.example           Configuration template
│   └── src/
│       ├── pages/             9 page components
│       ├── components/        NavBar, Footer, Layout, UI primitives
│       ├── context/           AuthContext (Supabase + role)
│       └── lib/               api.js, supabaseClient.js
├── scripts/
│   ├── set-admin-supabase.js  Admin role bootstrap
│   └── seed-demo-data.js      Synthetic demo dataset (40 complaints)
├── stitch-designs/            Original Google Stitch HTML exports (reference)
├── docs/                      Architecture, AI approach, test plan, project plan
├── LOCAL_SETUP.md             Detailed setup guide
└── README.md                  This file
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Health check |
| GET | `/api/me` | Citizen | Current user profile + role |
| POST | `/api/complaints` | Citizen | Submit complaint |
| GET | `/api/complaints/mine` | Citizen | Own complaints |
| GET | `/api/complaints` | Admin | All complaints |
| GET | `/api/complaints/:id` | Owner/Admin | Complaint detail |
| PATCH | `/api/complaints/:id/status` | Admin | Update status + note |
| POST | `/api/complaints/:id/analyze` | Owner/Admin | Run/re-run AI analysis |
| GET | `/api/complaints/:id/duplicates` | Owner/Admin | Duplicate candidates |
| GET | `/api/analytics/overview` | Admin | KPI counts |
| GET | `/api/analytics/hotspots` | Admin | Geographic hotspots |

---

## Free-Tier Limits

| Service | Limit |
|---------|-------|
| Supabase Spark | 500 MB DB, 50,000 MAU, 2 GB bandwidth |
| Gemini `gemini-1.5-flash` | 15 req/min, 1,500 req/day, 1M tokens/min |
| OpenStreetMap tiles | Fair-use public tiles |

No billing activation is required for any service used in this project.

---

## Limitations

- No email notifications (postponed per PROJECT_PLAN.md §8)
- No image upload (postponed)
- No real-time updates — page refresh required to see status changes
- Admin hotspot circles visible only to authenticated admins
- Gemini analysis is not instant — expect 2–5 seconds per request

---

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, API spec, security model |
| [`docs/AI_APPROACH.md`](docs/AI_APPROACH.md) | Gemini integration, prompt design, fallback |
| [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) | Full test plan with 80+ test cases |
| [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) | Requirements, user stories, schedule |
| [`LOCAL_SETUP.md`](LOCAL_SETUP.md) | Step-by-step local setup guide |

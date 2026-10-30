# CivicPulse — Local Setup Guide

> End-to-end setup for running CivicPulse locally: Supabase database, backend API, and frontend UI.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | Included with Node.js |
| Git | Any | For cloning |

You also need two free online accounts:

- **Supabase** — [supabase.com](https://supabase.com) (Spark free tier, no credit card)
- **Google AI Studio** — [aistudio.google.com](https://aistudio.google.com) (Gemini free tier)

---

## Step 1 — Create a Supabase Project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to fully provision (~1 minute).
3. Go to **Project Settings → API** and copy:
   - **Project URL** (e.g. `https://abc123.supabase.co`)
   - **anon / public** key
   - **service_role** key *(keep this secret — never commit it)*

---

## Step 2 — Apply the Database Schema

1. In your Supabase project, go to **SQL Editor**.
2. Open `backend/supabase/schema.sql` from this repo.
3. Copy the entire file content and paste it into the SQL Editor.
4. Click **Run**. This creates the `users` and `complaints` tables with all indexes and triggers.

---

## Step 3 — Configure the Backend

```bash
# From the project root
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173

# From Supabase Project Settings → API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# From Google AI Studio → Get API Key
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
```

> ⚠️ **Never commit `backend/.env` to version control.**  
> The `SUPABASE_SERVICE_ROLE_KEY` bypasses all row-level security — treat it like a root password.

---

## Step 4 — Install Backend Dependencies & Start

```bash
# From the backend/ directory
npm install
npm run dev
```

The backend will start at **http://localhost:5000**.  
Verify it's running: open [http://localhost:5000/api/health](http://localhost:5000/api/health) — you should see `{ "status": "ok" }`.

---

## Step 5 — Configure the Frontend

```bash
# From the project root
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_BASE_URL=http://localhost:5000/api
```

> The `VITE_SUPABASE_ANON_KEY` here is the same **anon/public** key — safe to use in the browser.  
> The service_role key goes **only** in `backend/.env`.

---

## Step 6 — Install Frontend Dependencies & Start

```bash
# From the frontend/ directory
npm install
npm run dev
```

The frontend will start at **http://localhost:5173**.  
Open it in your browser — you should see the CivicPulse landing page.

---

## Step 7 — Register Your First User (Admin)

1. Open [http://localhost:5173/register](http://localhost:5173/register).
2. Create an account with your email and a strong password.
3. You can verify the email in **Supabase Dashboard → Authentication → Users**, or temporarily disable email confirmation in **Supabase → Auth → Settings → Email confirmation**.

> By default all new users have `role: citizen`. To grant admin access, see Step 8.

---

## Step 8 — Grant Admin Role

Run the admin bootstrap script from the **project root** (not from inside `backend/`):

```bash
node scripts/set-admin-supabase.js your-email@example.com
```

**Important:** The user must have registered first (Step 7) before running this script.

You can also pass a UUID:
```bash
node scripts/set-admin-supabase.js xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

After this, log out and log back in to pick up the admin role. The admin dashboard will then be accessible at [http://localhost:5173/admin](http://localhost:5173/admin).

---

## Step 9 — Verify Gemini AI Integration

1. Go to [aistudio.google.com](https://aistudio.google.com) and create an API key.
2. Make sure `gemini-1.5-flash` is available in your region (it is free-tier eligible).
3. Paste the key into `backend/.env` as `GEMINI_API_KEY`.
4. Restart the backend: the server must be restarted to pick up `.env` changes.
5. Submit a complaint and click **Run AI Analysis** on the complaint detail page.

> **Rate limits (free tier):** 15 requests/minute, 1,500 requests/day, 1M tokens/minute.  
> If you hit limits during testing, wait 60 seconds and retry.

---

## Running Both Servers Simultaneously

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Both must be running for the application to work.

---

## Application Routes

| URL | Description | Auth required |
|-----|-------------|--------------|
| `/` | Landing page | No |
| `/register` | Create an account | No |
| `/login` | Sign in | No |
| `/map` | Public complaint map | No (authenticated for data) |
| `/submit` | Submit a new complaint | ✅ Citizen |
| `/complaints` | My complaints list | ✅ Citizen |
| `/complaints/:id` | Complaint detail & AI analysis | ✅ Citizen |
| `/admin` | Admin operations dashboard | ✅ Admin only |

---

## Common Issues

### "Network error — is the backend running on port 5000?"
The frontend cannot reach the backend. Ensure `npm run dev` is running in `backend/` and there are no port conflicts.

### "Supabase is not configured"
The `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` in `frontend/.env` is missing or contains placeholder values.

### Registration succeeds but login fails
Email confirmation may be enabled. In Supabase Dashboard → Authentication → Settings, disable **Enable email confirmations** for local testing.

### "User not found in public.users"
This happens if the `on_auth_user_created` trigger didn't fire. Run the schema SQL again to re-create the trigger, or manually insert into `public.users`.

### Admin dashboard shows "Administrator access required"
Run the set-admin script (Step 8) and then log out and back in to refresh the session.

### Gemini AI analysis returns "AI service unavailable"
Check that `GEMINI_API_KEY` is set and valid in `backend/.env`, and that you haven't exceeded the free-tier rate limit (15 req/min).

---

## Project Structure

```
CivicPulse/
├── backend/               Express API (port 5000)
│   ├── .env               Your secrets (gitignored)
│   ├── .env.example       Template
│   └── src/
│       ├── routes/        All API endpoints
│       ├── controllers/   Business logic
│       ├── services/      Gemini, hotspot, duplicate detection
│       └── middleware/    Auth, validation, error handling
├── frontend/              Vite + React (port 5173)
│   ├── .env               Your frontend config (gitignored)
│   ├── .env.example       Template
│   └── src/
│       ├── pages/         All page components
│       ├── components/    Shared UI components
│       ├── context/       AuthContext (Supabase session + role)
│       └── lib/           api.js, supabaseClient.js
├── scripts/
│   └── set-admin-supabase.js   Admin role bootstrap
└── docs/                  Architecture, AI approach, test plan
```

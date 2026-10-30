# CivicPulse — Test Results

**Tester:**  
**Date:**  
**Environment:** localhost:5173 (frontend) + localhost:5000 (backend)  
**Supabase Project:** (fill in project ref)  
**Gemini Model:** gemini-1.5-flash  

---

## Pre-Test Setup Checklist

- [ ] `backend/.env` populated with real Supabase + Gemini credentials
- [ ] `frontend/.env` populated with Supabase URL + anon key
- [ ] `backend/supabase/schema.sql` applied in Supabase SQL Editor
- [ ] Backend running on port 5000 — `GET /api/health` returns HTTP 200
- [ ] Frontend running on port 5173 — landing page loads
- [ ] Admin account bootstrapped via `node scripts/set-admin-supabase.js`
- [ ] Citizen test account registered at `/register`
- [ ] (Optional) Demo data seeded via `node scripts/seed-demo-data.js`

---

## Functional Tests

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| FT-01 | Open landing page | Page loads correctly | | |
| FT-02 | Register valid citizen | Account is created | | |
| FT-03 | Register invalid email | Validation error | | |
| FT-04 | Log in with valid credentials | Dashboard opens | | |
| FT-05 | Log in with wrong password | Authentication rejected | | |
| FT-06 | Submit valid complaint | Complaint stored | | |
| FT-07 | Submit empty description | Validation error | | |
| FT-08 | Submit description > 1,000 chars | Request rejected | | |
| FT-08b | Submit title > 120 chars | Request rejected | | |
| FT-09 | Submit invalid coordinates | Request rejected | | |
| FT-10 | Open My Complaints | Own complaints displayed | | |
| FT-11 | Open complaint details | Correct info displayed | | |
| FT-12 | Refresh page | Complaint remains | | |
| FT-13 | Log out | Protected access ends | | |
| FT-14 | View status timeline | Status changes appear | | |

---

## API Tests

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| API-01 | GET `/api/health` | HTTP 200 | | |
| API-02 | GET `/api/me` with valid token | HTTP 200 | | |
| API-03 | GET `/api/me` without token | HTTP 401 | | |
| API-04 | POST valid complaint | HTTP 201 | | |
| API-05 | POST complaint without title | HTTP 400 | | |
| API-06 | POST complaint without description | HTTP 400 | | |
| API-07 | POST complaint with invalid latitude | HTTP 400 | | |
| API-08 | GET `/api/complaints/mine` | Own complaints only | | |
| API-09 | GET invalid complaint ID | HTTP 404 | | |
| API-10 | PATCH status with invalid enum | HTTP 400 | | |
| API-11 | GET admin analytics as citizen | HTTP 403 | | |
| API-12 | GET admin analytics as admin | HTTP 200 | | |
| API-13 | Send oversized request | Safely rejected | | |
| API-14 | Repeat analysis request | Existing analysis reused | | |

---

## Authentication & Authorisation Tests

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| AT-01 | Register new account | Supabase account created | | |
| AT-02 | Log in | Valid session established | | |
| AT-03 | Access API with valid token | Request accepted | | |
| AT-04 | Access API without token | HTTP 401 | | |
| AT-05 | Send malformed token | HTTP 401 | | |
| AT-07 | Log out | Client session cleared | | |
| AUT-01 | Citizen reads own complaint | Allowed | | |
| AUT-02 | Citizen reads another citizen's complaint | Denied | | |
| AUT-03 | Citizen calls admin endpoint | HTTP 403 | | |
| AUT-04 | Citizen submits `role: admin` | No privilege escalation | | |
| AUT-05 | Citizen tries to update status | HTTP 403 | | |
| AUT-06 | Admin updates status | Successful | | |
| AUT-09 | Admin logs in after bootstrap | Admin permissions recognised | | |

---

## AI Tests

| ID | Input | Expected | Result | Notes |
|----|-------|----------|--------|-------|
| AI-01 | "Large pothole on main road" | Roads and Potholes | | |
| AI-02 | "Garbage not collected for 3 days" | Garbage and Waste Management | | |
| AI-03 | "Water leaking from pipeline" | Water Supply | | |
| AI-04 | Long complaint text | Concise summary produced | | |
| AI-05 | Clear complaint | Keywords extracted | | |
| AI-09 | Gemini unavailable | Complaint stored with fallback | | |

---

## Status Workflow Tests

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| ST-01 | Create complaint | Status: Submitted | | |
| ST-02 | Admin changes to Under Review | Status updates | | |
| ST-04 | Admin changes to In Progress | Citizen sees update | | |
| ST-05 | Admin marks Resolved | Final status appears | | |
| ST-06 | Admin rejects without reason | Request rejected (400) | | |
| ST-07 | Admin adds status note | Note in history | | |
| ST-08 | Citizen attempts status change | HTTP 403 | | |

---

## Map & Hotspot Tests

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| MT-01 | Open map | Map renders | | |
| MT-02 | Complaint with valid coordinates | Marker appears | | |
| MT-03 | Click marker | Complaint summary popup | | |
| MT-05 | 3 complaints in one grid cell | Hotspot shown | | |
| MT-06 | 2 complaints in one cell | No hotspot | | |

---

## Duplicate Detection Tests

| ID | Scenario | Expected | Result | Notes |
|----|----------|----------|--------|-------|
| DD-01 | Similar complaint at 100m | Eligible duplicate candidate | | |
| DD-02 | Similar complaint at 299m | Eligible duplicate candidate | | |
| DD-03 | Similar complaint at 301m | Excluded | | |
| DD-06 | No previous complaints | No candidate shown | | |

---

## Final Release Checklist

- [ ] Supabase authentication works
- [ ] Admin bootstrap verified
- [ ] Citizen access restrictions verified
- [ ] Complaint submission works
- [ ] Supabase PostgreSQL persistence works
- [ ] Gemini integration works when available
- [ ] AI output schema validation works
- [ ] Priority scoring works
- [ ] Duplicate detection cap enforced
- [ ] 300-metre duplicate test passes
- [ ] Map markers work
- [ ] Hotspots calculated in memory
- [ ] Admin status updates work (rejection reason enforced)
- [ ] Status note appears in complaint history
- [ ] Status history persists
- [ ] AI failure fallback works
- [ ] No credentials or secrets exposed
- [ ] Application runs locally on ports 5000 and 5173

---

## Issues Found

| # | Severity | Description | Status |
|---|----------|-------------|--------|
| 1 | | | |

---

**Overall Result:** ☐ PASS  ☐ FAIL  ☐ PARTIAL

**Tester sign-off:**  
**Date:**

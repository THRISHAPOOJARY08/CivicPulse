# CivicPulse — Software Test Plan

**Version:** 2.1
**Testing Type:** Functional, API, security, AI and integration testing
**Status:** Ready for execution

---

## 1. Testing Objectives

Verify that:

1. Citizens can securely register and submit complaints.
2. Complaints are persisted correctly.
3. Gemini produces valid and useful analysis.
4. Priority calculations are deterministic.
5. Duplicate candidates are detected within defined limits.
6. Geographic hotspots are calculated correctly.
7. Administrators can manage complaint status.
8. Citizens cannot perform administrator operations.
9. AI failures do not prevent complaint submission.
10. The deployed application works without paid services.

## 2. Pre-Test Setup

The project owner must complete the following before an independent evaluator starts.

### 2.1 Supabase setup

- Create a Supabase project on the free Spark tier (no billing required).
- In the SQL Editor, apply `backend/supabase/schema.sql` to create tables and triggers.
- Copy `backend/.env.example` to `backend/.env` and populate `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
- Copy `frontend/.env.example` to `frontend/.env` and populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Verify the backend health endpoint: `GET /api/health` → HTTP 200.

### 2.2 Administrator account setup

The administrator account must be provisioned before testing.

Procedure:

1. Register an account at `http://localhost:5173/register`.
2. From the project root, run: `node scripts/set-admin-supabase.js <email>`.
3. Verify the `public.users` table has `role = 'admin'` for that user.
4. Log out and log back in to refresh the session token.
5. Verify access to `/api/analytics/overview` returns HTTP 200.

### 2.3 Demo credentials procedure

No credentials are assumed or included in this document.

The project owner must:

1. Choose a dedicated demo administrator email.
2. Set a strong, unique password.
3. Verify that the administrator can log in.
4. Create a separate citizen test account.
5. Verify both accounts independently.
6. Provide the evaluator with the demo URL and administrator credentials through a private channel.
7. Never publish credentials in GitHub, README files, screenshots or public documentation.
8. Rotate or disable the demo administrator credentials after the evaluation if they are no longer needed.

The evaluator must not receive the Supabase service-role key or Gemini API key.

### 2.4 Synthetic demonstration dataset

Prepare 30–50 synthetic complaints where practical.

The dataset should include:

- Road complaints.
- Garbage complaints.
- Water supply complaints.
- Drainage complaints.
- Electrical complaints.
- Deliberate duplicate descriptions.
- Several urgent safety-related examples.
- At least one geographic cluster containing three or more complaints.

All demo data must be synthetic. Do not use real citizens' personal information.

### 2.5 Gemini setup

- Verify the configured model is accessible.
- Verify the account's free-tier eligibility.
- Inspect actual model limits in AI Studio.
- Verify one test complaint can be analysed.
- Confirm the Gemini API key is not exposed to the browser.

If Gemini access is unavailable without enabling billing, mark the integration unavailable rather than upgrading the account.

## 3. Functional Tests

| ID | Scenario | Expected result |
|---|---|---|
| FT-01 | Open landing page | Page loads correctly |
| FT-02 | Register valid citizen | Account is created |
| FT-03 | Register invalid email | Validation error |
| FT-04 | Log in with valid credentials | Dashboard opens |
| FT-05 | Log in with wrong password | Authentication rejected |
| FT-06 | Submit valid complaint | Complaint stored |
| FT-07 | Submit empty description | Validation error |
| FT-08 | Submit description above 1,000 characters | Request rejected |
| FT-08b | Submit title above 120 characters | Request rejected |
| FT-09 | Submit invalid coordinates | Request rejected |
| FT-10 | Open My Complaints | Own complaints displayed |
| FT-11 | Open complaint details | Correct information displayed |
| FT-12 | Refresh page | Stored complaint remains available |
| FT-13 | Log out | Protected access ends |
| FT-14 | View status timeline | Stored status changes appear |

## 4. API Tests

| ID | Scenario | Expected result |
|---|---|---|
| API-01 | GET `/api/health` | HTTP 200 |
| API-02 | GET `/api/me` with valid token | HTTP 200 |
| API-03 | GET `/api/me` without token | HTTP 401 |
| API-04 | POST valid complaint | HTTP 201 |
| API-05 | POST complaint without title | HTTP 400 |
| API-06 | POST complaint without description | HTTP 400 |
| API-07 | POST complaint with invalid latitude | HTTP 400 |
| API-08 | GET `/api/complaints/mine` | Own complaints only |
| API-09 | GET invalid complaint ID | HTTP 404 |
| API-10 | PATCH status with invalid enum | HTTP 400 |
| API-11 | GET admin analytics as citizen | HTTP 403 |
| API-12 | GET admin analytics as admin | HTTP 200 |
| API-13 | Send oversized request | Safely rejected |
| API-14 | Repeat analysis request | Existing analysis reused |

## 5. Authentication Tests

| ID | Scenario | Expected result |
|---|---|---|
| AT-01 | Register new account | Supabase account created |
| AT-02 | Log in | Valid session established |
| AT-03 | Access API with valid token | Request accepted |
| AT-04 | Access API without token | HTTP 401 |
| AT-05 | Send malformed token | HTTP 401 |
| AT-06 | Send expired token | HTTP 401 |
| AT-07 | Log out | Client session cleared |
| AT-08 | Access API as disabled user | Request rejected when server-side disabled-user/revocation checks are applied |

## 6. Authorisation Tests

| ID | Scenario | Expected result |
|---|---|---|
| AUT-01 | Citizen reads own complaint | Allowed |
| AUT-02 | Citizen reads another citizen's private complaint | Denied |
| AUT-03 | Citizen calls admin endpoint | HTTP 403 |
| AUT-04 | Citizen submits `role: admin` | No privilege escalation |
| AUT-05 | Citizen tries to update status | HTTP 403 |
| AUT-06 | Admin updates status | Successful |
| AUT-07 | Unauthenticated user accesses admin API | HTTP 401 |
| AUT-08 | Client attempts unauthenticated direct Supabase table write | Denied by Row Level Security |
| AUT-09 | Admin account logs in after bootstrap script | Admin permissions recognised after token refresh |

## 7. AI Tests

| ID | Input | Expected result |
|---|---|---|
| AI-01 | "There is a large pothole on the main road." | Roads and Potholes |
| AI-02 | "Garbage has not been collected for three days." | Garbage and Waste Management |
| AI-03 | "Water is leaking from a pipeline." | Water Supply |
| AI-04 | Long complaint | Concise summary |
| AI-05 | Clear complaint keywords | Relevant keywords extracted |
| AI-06 | Ambiguous complaint | Other or an appropriately uncertain result |
| AI-07 | Malformed Gemini JSON | Rejected by backend validation |
| AI-08 | Unsupported category | Rejected or normalised to Other |
| AI-09 | Gemini unavailable | Complaint remains stored |
| AI-10 | AI suggests unsupported department | Backend rejects or replaces suggestion using configured mapping |
| AI-11 | Complaint contains prompt-injection text | Output remains constrained by backend schema and allowed values |
| AI-12 | Gemini returns unexpected extra fields | Extra fields are discarded or response rejected |

The test must evaluate both the AI's usefulness and the backend's ability to reject unsafe output.

## 8. Priority Tests

| ID | Scenario | Expected result |
|---|---|---|
| PR-01 | Routine pothole complaint | Baseline score |
| PR-02 | Fallen electrical wire | Safety escalation |
| PR-03 | Severe flooding | Appropriate urgency escalation |
| PR-04 | No urgency indicators | No unjustified critical score |
| PR-05 | Same complaint processed twice | Same deterministic result |
| PR-06 | AI suggests low priority for an explicit hazard | Safety rule takes precedence |
| PR-07 | Administrator changes priority | Change requires a recorded reason if priority override is implemented |

Priority must be calculated independently of Gemini.

## 9. Duplicate Detection Tests

### Fixed test configuration

- Candidate retrieval cap: 100 recent relevant complaints.
- Recent time window: 30 days.
- Geographic duplicate threshold: 300 metres.
- Similarity score: 0–100.

| ID | Scenario | Expected result |
|---|---|---|
| DD-01 | Similar pothole complaint at 100 metres | Eligible duplicate candidate |
| DD-02 | Similar pothole complaint at 299 metres | Eligible duplicate candidate |
| DD-03 | Similar pothole complaint at 301 metres | Excluded by initial distance threshold |
| DD-04 | Same description at distant location | Not a likely duplicate |
| DD-05 | Same location but different issue | Not automatically considered duplicate |
| DD-06 | No previous complaints | No candidate |
| DD-07 | More than 100 recent complaints exist | At most 100 candidates retrieved |
| DD-08 | Old complaint outside recent window | Excluded |
| DD-09 | Duplicate candidate is rejected by admin | Both original complaints remain separate |
| DD-10 | Repeat candidate detection | Does not create uncontrolled duplicate records |

The exact boundary test should use the calculated distance, allowing only a small numerical tolerance for coordinate conversion.

## 10. Map and Hotspot Tests

| ID | Scenario | Expected result |
|---|---|---|
| MT-01 | Open map | Map renders |
| MT-02 | Complaint has valid coordinates | Marker appears |
| MT-03 | Click marker | Complaint summary appears |
| MT-04 | Open map with invalid coordinates in data | Invalid marker skipped |
| MT-05 | Three complaints in one grid cell | Potential hotspot appears |
| MT-06 | Two complaints in one cell | No hotspot at threshold three |
| MT-07 | Complaints in separate cells | Separate groups |
| MT-08 | OpenStreetMap tile service unavailable | Graceful map error |
| MT-09 | Request hotspot endpoint | Results match current complaint dataset |
| MT-10 | Hotspot endpoint called again | Recalculates from current data without requiring stored hotspot documents |

## 11. Status Workflow Tests

| ID | Scenario | Expected result |
|---|---|---|
| ST-01 | Create complaint | Status Submitted |
| ST-02 | Admin changes status to Under Review | Current status updates |
| ST-03 | Admin assigns department | Department is stored |
| ST-04 | Admin changes status to In Progress | Citizen sees updated status |
| ST-05 | Admin marks complaint Resolved | Final status appears |
| ST-06 | Admin rejects complaint without reason | Request rejected |
| ST-07 | Admin adds status note | Note appears in status history |
| ST-08 | Citizen attempts status change | HTTP 403 |

Only essential status transitions and their notes are maintained. A separate activity log is outside MVP scope.

## 12. Accessibility Tests

| ID | Scenario | Expected result |
|---|---|---|
| AX-01 | Keyboard navigation | Essential controls reachable |
| AX-02 | Form labels | Inputs have accessible labels |
| AX-03 | Button labels | Actions are understandable |
| AX-04 | Colour contrast | Text remains readable |
| AX-05 | Validation errors | Clearly communicated |
| AX-06 | Mobile viewport | Essential content usable |
| AX-07 | Map alternatives | Complaint information also available as text |

## 13. Performance Tests

| ID | Scenario | Expected result |
|---|---|---|
| PT-01 | Load landing page | No blocking errors |
| PT-02 | Display 30–50 complaints | Dashboard remains usable |
| PT-03 | Render map markers | No significant lag |
| PT-04 | Submit sequential complaints | Valid submissions persist |
| PT-05 | Repeat AI request | Cached result reused |
| PT-06 | Duplicate detection | Never retrieves more than 100 candidates |
| PT-07 | Gemini responds slowly | Loading state displayed |
| PT-08 | Gemini fails | Complaint remains available |
| PT-09 | API fails | User receives an error message, not a blank screen |

## 14. Independent AI Browser-Agent Evaluator Scenarios

The independent evaluator should use the deployed application and pre-provisioned test accounts. They should not need access to source code or secrets.

### Scenario 1 — Citizen registration

1. Open the application.
2. Navigate to registration.
3. Register a citizen account.
4. Log in.

Expected result: Citizen dashboard appears.

### Scenario 2 — Complaint capture

1. Open Submit Complaint.
2. Enter a pothole complaint.
3. Select a location.
4. Submit.

Expected result:
- Complaint is stored.
- Complaint ID appears.
- Complaint appears in the citizen's list.

### Scenario 3 — AI understanding

1. Open complaint details.
2. Inspect category and summary.
3. Inspect priority and explanation.
4. Inspect department recommendation.

Expected result: Relevant AI analysis and deterministic priority are displayed.

### Scenario 4 — Duplicate detection

1. Submit another similar complaint.
2. Select a location within **300 metres** of the first complaint.
3. Use a similar issue description.
4. Inspect duplicate candidates.

Expected result: The original complaint appears as a possible candidate if its similarity score meets the configured threshold.

The evaluator must not use a location more than 300 metres away for this test.

### Scenario 5 — Geographic hotspot

1. Open the map.
2. Inspect complaint markers.
3. Find the seeded geographic cluster.

Expected result: A cell containing at least three complaints is highlighted.

### Scenario 6 — Administrator workflow

1. Open the application using the privately supplied demo administrator credentials.
2. Navigate to the admin dashboard.
3. Open a complaint.
4. Confirm its department.
5. Change status to In Progress.
6. Add a short status note.

Expected result:
- Administrator access succeeds.
- Status is updated.
- Status history is stored.
- The citizen can see the update.

### Scenario 7 — Citizen permission restriction

1. Log out of the administrator.
2. Log in as a citizen.
3. Attempt to access an administrator-only API operation.

Expected result: HTTP 403.

### Scenario 8 — AI failure handling

> **This scenario is a developer self-test only.** It cannot be executed by a remote evaluator on the deployed application, because it requires local source-code access and a correctly configured `.env` file with `ENABLE_AI_FAILURE_TEST=true`. A remote evaluator should verify AI failure handling by observing the `aiStatus` field on a complaint stored when Gemini is unavailable, or by accepting the developer's live demonstration.

This test must use a local development environment or a non-production test environment where the guarded simulation is available.

Do not invalidate the real API key in the production deployment.

Steps:
1. Start the application with the test-only failure switch enabled.
2. Log in with a test citizen account.
3. Submit a complaint with the designated simulation header.
4. Inspect the response and stored complaint.

Expected result:
- Complaint is saved.
- AI analysis is marked unavailable.
- Priority is calculated.
- User receives a clear fallback message.

### Scenario 9 — Responsive design

1. Open desktop view.
2. Resize to mobile.
3. Submit a complaint.
4. View complaint status.

Expected result: Essential workflows remain usable.

### Scenario 10 — Persistence

1. Submit a complaint.
2. Refresh the page.
3. Log out.
4. Log in again.

Expected result: Complaint remains stored and visible to its owner.

## 15. Safe AI Failure Simulation

The AI failure simulation is strictly a development/testing feature.

Required controls:

- Default: `ENABLE_AI_FAILURE_TEST=false`.
- Test mode is accepted only when `NODE_ENV !== "production"`.
- A separate `AI_FAILURE_TEST_TOKEN` is required locally.
- Simulation is triggered through a dedicated test header.
- Simulation affects only the selected request.
- It must never disable Gemini globally.
- The production API must reject or ignore the simulation header.
- Production deployment must not contain the test token.

If any condition is missing, simulation must not run.

Example test request header:

`X-CivicPulse-Test-AI-Failure: <local-test-token>`

A test header must never be sufficient to trigger simulated failure in production.

## 16. Final Release Checklist

- [ ] Supabase authentication works.
- [ ] Admin bootstrap verified.
- [ ] Citizen access restrictions verified.
- [ ] Complaint submission works.
- [ ] Supabase PostgreSQL persistence works.
- [ ] Gemini integration works when available.
- [ ] AI output schema validation works.
- [ ] Priority scoring works.
- [ ] Duplicate detection cap is enforced.
- [ ] 300-metre duplicate test passes.
- [ ] Map markers work.
- [ ] Hotspots are calculated in memory.
- [ ] Admin status updates work (including rejection reason enforcement).
- [ ] Status note appears in complaint history.
- [ ] Status history persists.
- [ ] AI failure fallback works.
- [ ] AI failure simulation is unavailable in production.
- [ ] No credentials or secrets are exposed.
- [ ] Application runs locally on ports 5000 and 5173.
- [ ] Demo credentials are shared privately.

**Release decision:** Core authentication, authorisation, complaint persistence and administrator workflow tests are mandatory. AI and map features must pass their corresponding tests or clearly communicate their unavailable state.

---

**End of TEST_PLAN.md**
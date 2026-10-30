# CivicPulse — Project Plan

**Version:** 2.0  
**Project:** AI-Powered Civic Complaint Management Platform  
**Hackathon Duration:** 8 Hours  
**Development Team:** One developer  
**Status:** Planned — implementation not started

---

## 1. Problem Statement

Every day, communities face civic problems such as waterlogging, damaged roads, overflowing waste bins, broken streetlights and disrupted public services.

Reports reach authorities through multiple channels, including phone calls, messages, social media and in-person visits. The same issue may be reported multiple times, urgent hazards may remain in the same queue as routine requests, and decision-makers may struggle to identify which problems require attention first.

Citizens also rarely receive clear information about what happened after submitting a complaint.

CivicPulse aims to build an AI-powered platform that transforms scattered citizen reports into prioritised, explainable and trackable action.

The platform will help citizens report civic problems, help administrators understand and prioritise them, reveal geographic patterns and provide a transparent complaint resolution workflow.

## 2. Project Objectives

1. Provide a simple interface for citizens to report civic problems.
2. Collect complaint descriptions and geographical locations.
3. Use Gemini to understand and categorise complaints.
4. Generate concise complaint summaries.
5. Identify possible duplicate complaints.
6. Calculate explainable complaint priorities.
7. Recommend relevant municipal departments.
8. Visualise complaints on an interactive map.
9. Identify geographic complaint hotspots.
10. Allow administrators to review and update complaints.
11. Allow citizens to track complaint progress.
12. Maintain secure authentication and role-based access.

## 3. Four Lifecycle Stages

### 3.1 CAPTURE — Report civic problems

Purpose: Collect structured reports from citizens.

Activities:
- Citizen registers or logs in.
- Citizen enters a complaint title.
- Citizen describes the problem.
- Citizen selects a complaint category or accepts AI classification later.
- Citizen selects a geographical location using the map.
- Citizen submits the complaint.
- Backend validates and stores the original report.
- Backend generates a unique complaint ID.

Expected output: A stored civic complaint with a unique tracking ID and location.

### 3.2 UNDERSTAND — Analyse complaints

Purpose: Convert unstructured complaints into actionable information.

Activities:
- Gemini suggests a complaint category.
- Gemini generates a concise summary.
- Gemini extracts relevant keywords.
- Backend recommends a department using the validated category.
- Backend calculates a deterministic priority score.
- Backend identifies possible duplicate complaints.

Expected output: A structured complaint containing AI-assisted insights and backend-calculated priority information.

### 3.3 REVEAL — Identify patterns

Purpose: Make civic problems and geographic concentrations visible.

Activities:
- Display complaints on an interactive map.
- Display complaint counts.
- Identify geographic clusters.
- Highlight potential hotspots.
- Show high-priority complaints.
- Provide administrators with a basic dashboard.

Expected output: A visual representation of reported civic problems and geographic patterns.

### 3.4 ACT — Enable administrative action

Purpose: Support review, assignment and complaint tracking.

Activities:
- Administrator reviews submitted complaints.
- Administrator confirms or changes the category.
- Administrator confirms the recommended department.
- Administrator updates complaint status.
- Administrator records a short note with a status change.
- Citizen views the updated complaint status.

Status lifecycle:

`Submitted → Under Review → Assigned → In Progress → Resolved`

Additional status: `Rejected`

A rejection must contain a reason.

## 4. User Roles

### Citizen

Can:
- Register and log in.
- Submit complaints.
- Select complaint locations.
- View their own complaints.
- View complaint details.
- Track complaint status.
- View public complaint map information.

Cannot:
- Access administrator-only APIs.
- Change complaint priority directly.
- Assign departments.
- Change administrative complaint status.
- View another citizen's private information.

### Administrator

Can:
- View all complaints.
- Review complaint details.
- View dashboard statistics.
- Confirm or modify complaint categories.
- Assign departments.
- Update complaint status.
- Add short status notes.
- View duplicate candidates.
- View geographic hotspots.

Administrator access must be granted through a trusted bootstrap process, never through public registration.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Firebase email/password registration and login | Must |
| FR-02 | Citizen and administrator role separation | Must |
| FR-03 | Complaint submission | Must |
| FR-04 | Location selection using Leaflet | Must |
| FR-05 | Store complaints in Firestore | Must |
| FR-06 | Gemini categorisation | Must |
| FR-07 | Gemini summarisation | Must |
| FR-08 | Deterministic priority calculation | Must |
| FR-09 | Department recommendation | Must |
| FR-10 | Duplicate candidate detection | Must |
| FR-11 | Complaint markers on map | Must |
| FR-12 | Geographic hotspot calculation | Must |
| FR-13 | Administrator complaint management | Must |
| FR-14 | Citizen complaint tracking | Must |
| FR-15 | Basic dashboard analytics | Must |
| FR-16 | Gemini failure fallback | Must |
| FR-17 | Minimal status history | Must |
| FR-18 | Responsive interface | Must |

Search, advanced filtering and separate action history are postponed, not MVP requirements.

## 6. Required Screens

The following are planned screens. They may be combined to reduce development time.

| Screen | Main responsibility |
|---|---|
| Landing Page | Explain CivicPulse and its four stages |
| Login | Authenticate users |
| Registration | Create citizen accounts |
| Citizen Dashboard | Show own complaint summary |
| Submit Complaint | Collect description and location |
| My Complaints | Display submitted complaints |
| Complaint Details | Display AI analysis, priority and status |
| Public Map | Display complaint markers |
| Admin Dashboard | Display statistics and priorities |
| Manage Complaints | Review and update complaints |
| Hotspot View | Display geographic concentrations |

The public map and hotspot view should be combined if necessary. The citizen dashboard and My Complaints may also share a screen.

## 7. Minimum Viable Product

The MVP must demonstrate one complete citizen-to-administrator journey.

### Citizen workflow
- Register and log in.
- Submit a complaint.
- Select a location.
- Receive a complaint ID.
- View the submitted complaint.
- Track its status.

### AI workflow
- Categorise complaints.
- Summarise complaints.
- Extract keywords.
- Suggest a department.

### Deterministic intelligence
- Calculate priority.
- Explain priority factors.
- Identify duplicate candidates.
- Calculate geographic hotspots.

### Administrator workflow
- View complaints.
- Review AI suggestions.
- Confirm or change department.
- Update status.
- Add a short status note.

### Visualisation
- Interactive Leaflet map.
- Complaint markers.
- Basic dashboard counts.
- Hotspot indicators.

## 8. Postponed Features

The following features must not be implemented unless all MVP requirements, testing and deployment are complete.

- Advanced search and filtering.
- Separate action-history/activity-log system.
- SMS and email notifications.
- WhatsApp integration.
- Voice-based complaint submission.
- Image recognition.
- Image upload and storage.
- Real-time chat.
- Real-time notifications.
- Predictive maintenance.
- Machine-learning model training.
- Vector databases and embeddings.
- Advanced GIS algorithms.
- Automatic government escalation.
- Native mobile applications.
- Automatic duplicate merging.
- Public voting and complaint ranking.

## 9. Eight-Hour Implementation Schedule

The schedule is a strict time budget. Deployment and testing must not be sacrificed for visual enhancements.

| Time | Duration | Work |
|---|---:|---|
| 00:00–01:00 | 1 hour | Project setup, Firebase, authentication and admin bootstrap |
| 01:00–02:30 | 1.5 hours | Complaint submission, Firestore storage and citizen complaint listing |
| 02:30–03:30 | 1 hour | Gemini integration, structured output and fallback |
| 03:30–04:15 | 45 min | Priority scoring and duplicate candidate detection |
| 04:15–05:15 | 1 hour | Admin dashboard, department assignment and status updates |
| 05:15–06:15 | 1 hour | Leaflet map and in-memory hotspot calculation |
| 06:15–07:00 | 45 min | Firestore Security Rules, environment configuration and deployment |
| 07:00–08:00 | 1 hour | Testing, bug fixes, README, limitations note and demo rehearsal |
| **Total** | **8 hours** | |

### Time-management rules

1. Do not spend more than 15 minutes choosing UI colours or animations.
2. Use simple reusable components.
3. Build the complaint submission flow before advanced dashboard components.
4. Use one Gemini analysis request per complaint.
5. Use plain JavaScript for duplicate scoring and hotspot calculation.
6. Do not introduce additional services.
7. Deploy a basic version as soon as the core workflow works.
8. Reserve the final hour for testing and demonstration.

### Fallback priorities when time runs out

| Priority | Deliverable |
|---|---|
| P0 | Authentication, complaint submission, storage and admin status update |
| P1 | Gemini categorisation and summary |
| P1 | Deterministic priority and duplicate candidate detection |
| P1 | Map and hotspot visualisation |
| P2 | UI polish and optional dashboard enhancements |

If necessary, simplify the dashboard and map styling. Do not remove backend authorisation or data validation.

## 10. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | Citizen registration and login work |
| AC-02 | Unauthenticated complaint submission is rejected |
| AC-03 | Valid complaints are stored in Firestore |
| AC-04 | Each complaint receives a unique ID |
| AC-05 | Gemini returns a valid category and summary when available |
| AC-06 | AI results are validated before storage |
| AC-07 | Priority is calculated by deterministic backend rules |
| AC-08 | Priority explanations are displayed |
| AC-09 | Duplicate candidates are detected within the configured test distance |
| AC-10 | Department recommendation is available |
| AC-11 | Complaints appear on the map |
| AC-12 | Hotspots are calculated from complaint locations |
| AC-13 | Administrator can update complaint status |
| AC-14 | Citizen can see status changes |
| AC-15 | Citizen cannot access administrator operations |
| AC-16 | Gemini failure does not prevent complaint storage |
| AC-17 | No paid service or billing activation is required |
| AC-18 | Application is deployed or demonstrable locally |

## 11. Implementation Status

At the time of this document revision:

| Area | Status |
|---|---|
| Problem definition | ✅ Complete |
| Architecture | ✅ Complete (Supabase + Gemini) |
| Database | ✅ Supabase PostgreSQL schema applied |
| Authentication | ✅ Supabase Auth + JWT middleware |
| Gemini integration | ✅ `gemini-1.5-flash` with fallback |
| Duplicate detection | ✅ 300m Haversine, 30-day window, 100-cap |
| Priority engine | ✅ Deterministic scoring with explanation |
| Map and hotspots | ✅ Leaflet + 0.01° grid hotspot calculation |
| Administrator workflow | ✅ Status updates, notes, rejection enforcement |
| Frontend | ✅ All 9 pages complete (React + Vite) |
| Local deployment | ✅ Ports 5000 + 5173 |
| Testing | ⏳ Manual testing required before submission |

**Completion definition:** CivicPulse is complete for the hackathon when the core citizen-to-administrator workflow can be demonstrated reliably and the AI and geographic features have honest, testable behaviour.

---

**End of PROJECT_PLAN.md**
# Mini Project Report
## FixMyHostel: A Smart Hostel Complaint & Maintenance Management System Delivered Through an Agile and DevOps Pipeline

**Course**: Agile Software Development & DevOps Lab (Course Code: 2165119)  
**Semester**: Semester V (NEP) · Academic Year 2026–2027  
**Department**: Artificial Intelligence & Data Science, Thadomal Shahani Engineering College  

---

### Team Members
| Roll No. / Student ID | Name | Role | Responsibilities |
|-----------------------|------|------|-------------------|
| T12_35 / 2401031 | **Mayank Heda** | Full-Stack Dev + DevOps Lead | Backend architecture, Docker Compose orchestration, Jenkins CI/CD pipeline, PR reviews & release tags |
| — | **Ishita Gurbaxani** | Frontend Dev + Agile Lead | React 18 SPA, Tailwind CSS UI, Jira backlog & Scrum sprint planning, Vitest helper suites |
| — | **Bhavisha Kewalramani** | Backend Dev + Monitoring Lead | Database schema design, REST API endpoints, Prometheus metrics, Grafana dashboards & Nagios monitoring |

---

## Abstract
Campus hostel living frequently suffers from prolonged delays and poor transparency in resolving day-to-day maintenance requests (plumbing faults, electrical hazards, network breakdowns, and furniture repairs). Traditional communication channels such as physical registers or messaging groups lead to duplicated tickets, untracked complaints, and lack of accountability for hostel wardens. 

**FixMyHostel** solves this challenge through a cloud-native, containerised web platform where students submit geo-located complaints with photo evidence, staff triage an automated priority queue, and wardens track real-time resolution metrics through an analytics dashboard. 

Crucially, FixMyHostel serves as a unified vehicle implementing **all seven experiments** of the ASD&D curriculum:
1. **Experiment 1 (Git)**: Issue-driven branching (`feature/FMH-*`), 15 Pull Requests, merge commits, and release tagging (`v1.0.0` - `v1.0.2`).
2. **Experiment 2 (Docker)**: Multi-stage Dockerfiles with unprivileged users, Alpine minimal bases, and healthchecks.
3. **Experiment 3 (Docker Compose)**: A 7-service orchestrated stack with isolated bridge networking and health-gated startup.
4. **Experiment 4 (Jenkins CI)**: Declarative multibranch pipeline for continuous linting, testing with JUnit XML reporting, and image compilation.
5. **Experiment 5 (Automated Deployment)**: Zero-downtime CD with automated deployment smoke testing and rollback safeguard on `main`.
6. **Experiment 6 (Agile with Jira/Scrum)**: Backlog of 16 issues across 2 sprints with story points, velocity estimation, and commit-to-issue traceability.
7. **Experiment 7 (Monitoring)**: Prometheus timeseries scraping, 12-panel Grafana dashboard, and Nagios availability daemon.

---

## 1. Introduction

### 1.1 Background
Hostel life is an integral part of higher education. A large engineering hostel accommodates hundreds of students requiring round-the-clock maintenance services. Peak maintenance requests arrive during early mornings and evening study hours. Without an automated system, hostel administration struggles with unprioritised backlogs, missing inventory data, and unresolved student grievances.

### 1.2 Problem Statement
To design, implement, and operate an end-to-end full-stack web application that streamlines hostel grievance reporting, prioritises emergency repairs, provides real-time SLA metrics, and proves the integration of modern Agile and DevOps delivery practices.

### 1.3 Scope
- **User Roles**: Students, Maintenance Staff, and Wardens.
- **Priority Automation**: Critical hazards (short circuits, burst pipes) are auto-prioritised ahead of minor issues.
- **Daily Resetting Tokens**: Token numbering resets every calendar day according to Indian Standard Time (IST).
- **Deployment**: 7-service Docker Compose infrastructure deployed on local or cloud hosts.

### 1.4 Mapping of Lab Experiments to FixMyHostel
| Exp | Lab Experiment Topic | Implementation in FixMyHostel | Section |
|-----|----------------------|--------------------------------|---------|
| 1 | Version Control Operations Using Git | Feature branch per Jira key, 15 Pull Requests, non-fast-forward merge commits, semantic release tags | 5.1 |
| 2 | Containerizing Applications Using Docker | Multi-stage Dockerfile for API (non-root `app` user) and React SPA (Nginx Alpine reverse proxy) | 5.2 |
| 3 | Orchestrating with Docker Compose | 7 services (`frontend`, `api`, `mysql`, `redis`, `prometheus`, `grafana`, `nagios`) in one compose definition | 5.3 |
| 4 | Setting Up CI Pipeline Using Jenkins | Multibranch Declarative Pipeline executing parallel install, lint, Jest/JUnit test suites, and Docker image builds | 5.4 |
| 5 | Automated Deployment & Continuous Delivery | Main branch automated deployment, version-aware curl smoke testing, and automated rollback upon health failure | 5.5 |
| 6 | Agile Software Project Lifecycle using Jira | Scrum backlog of 16 issues, 2 sprints, user story point estimation, Definition of Done, burndown tracking | 2.0 |
| 7 | Infrastructure & Service Monitoring | Prometheus `/metrics` scraping, Grafana 12-panel dashboard, Nagios daemon checking HTTP/TCP availability | 5.6 |

---

## 2. Requirements & Agile Planning (Experiment 6)

### 2.1 User Roles
- **Student**: Registers, logs in, raises geo-tagged complaints with photos, tracks live status, cancels RAISED complaints, and submits 1–5 star resolution feedback.
- **Staff**: Views priority queue (Critical → High → Medium → Low), accepts complaints (`RAISED` → `ACCEPTED`), starts work (`IN_PROGRESS`), and completes repairs with notes (`RESOLVED`).
- **Warden**: High-level executive dashboard showing total complaints, active vs resolved, average resolution turnaround in minutes, category breakdown, and staff efficiency metrics.

### 2.2 Scrum Setup & Product Backlog
The project was planned as Jira Scrum Project **FMH** across two 2-week sprints:
- **Sprint 1 (Foundations & Core Operations)**: Infrastructure scaffolding, database DDL, authentication, core student ticketing, and staff queue state machine.
- **Sprint 2 (Analytics, Monitoring & Hardening)**: Warden analytics, Prometheus instrumentation, Grafana visualization, Nagios configuration, and load simulation.

| Issue Key | Type | Summary | Story Points | Assignee | Sprint |
|-----------|------|---------|--------------|----------|--------|
| FMH-1 | Task | Repository scaffolding, README, and environment setup | — | Mayank Heda | 1 |
| FMH-2 | Story | Design MySQL relational schema for users, complaints, feedback | 3 | Bhavisha Kewalramani | 1 |
| FMH-3 | Task | 7-Service Docker Compose definition with health dependencies | — | Mayank Heda | 1 |
| FMH-4 | Task | Jenkins multibranch declarative pipeline with JUnit reporting | — | Mayank Heda | 1 |
| FMH-5 | Story | Express REST API with JWT auth and RBAC middleware | 5 | Bhavisha Kewalramani | 1 |
| FMH-6 | Story | Student ticket submission with daily token generation | 5 | Ishita Gurbaxani | 1 |
| FMH-7 | Story | Staff queue priority engine and complaint lifecycle state machine | 5 | Bhavisha Kewalramani | 1 |
| FMH-8 | Task | Automated backend testing with Supertest and dual-store harness | — | Mayank Heda | 1 |
| FMH-9 | Task | Frontend Vite SPA scaffolding with Tailwind CSS and Nginx Dockerfile | — | Ishita Gurbaxani | 2 |
| FMH-10 | Story | Reusable React components: Navbar, StatusBadge, SeverityBadge | 3 | Ishita Gurbaxani | 2 |
| FMH-11 | Story | Student complaint tracker and live staff operations queue | 5 | Ishita Gurbaxani | 2 |
| FMH-12 | Story | Warden executive SLA analytics dashboard with Chart.js | 5 | Ishita Gurbaxani | 2 |
| FMH-13 | Task | Prometheus `/metrics` scraping and threshold alert rules | — | Bhavisha Kewalramani | 2 |
| FMH-14 | Task | Provision Grafana 12-panel dashboard and Nagios daemon | — | Bhavisha Kewalramani | 2 |
| FMH-15 | Bug | Resolve macOS ControlCenter port 5000 collision | — | Mayank Heda | 2 |
| FMH-16 | Bug | Align database column naming (`raised_at`, `password_hash`, `comment`) | — | Bhavisha Kewalramani | 2 |

---

## 3. System Architecture & Design

### 3.1 High-Level Architecture Diagram
```
                     +----------------------------------------------------+
                     |                 HOST SYSTEM (PC)                   |
                     +----------------------------------------------------+
                                      |
                   +------------------+------------------+
                   |           Docker Compose Network    |
                   |               (fmh-network)         |
                   +------------------+------------------+
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
  [Port 3000:80]               [Port 5001:5000]             [Port 3307:3306]
+------------------+         +------------------+         +------------------+
|   fmh-frontend   |  /api   |     fmh-api      |  MySQL  |    fmh-mysql     |
|   React SPA +    +-------->+   Node.js Express+-------->+    MySQL 8.0     |
|   Nginx Alpine   | (proxy) |     prom-client  |         | (Volume Persist) |
+------------------+         +--------+---------+         +------------------+
                                      |
                             Redis    |  Scrapes
                            (Caching) |  /metrics
                                      v
                             +------------------+
                             |    fmh-redis     | [Port 6379:6379]
                             |  Redis 7 Alpine  |
                             +------------------+
                                      ^
                                      |
         +----------------------------+----------------------------+
         |                            |                            |
  [Port 9090:9090]             [Port 3001:3000]             [Port 8080:80]
+------------------+         +------------------+         +------------------+
|  fmh-prometheus  | Query   |   fmh-grafana    | Checks  |    fmh-nagios    |
| Prometheus Server+-------->+ Grafana Dashboard| Server  |  Nagios 4 Daemon |
| (SLA Alert Rules)|         | (12 Live Panels) | Health  | (Availability)   |
+------------------+         +------------------+         +------------------+
```

### 3.2 Database Schema
The database employs strict relational integrity:
- `users`: `id`, `name`, `email` (unique), `password_hash`, `role` (`student`, `staff`, `warden`), `room_number`, `created_at`.
- `complaints`: `id`, `token_number`, `student_id` (FK), `category`, `severity`, `title`, `description`, `photo_url`, `location`, `status` (`RAISED`, `ACCEPTED`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`), `assigned_to` (FK), `resolution_notes`, `raised_at`, `accepted_at`, `started_at`, `resolved_at`.
- `feedback`: `id`, `complaint_id` (FK, unique), `student_id` (FK), `rating` (1–5), `comment`, `created_at`.

---

## 4. Application Implementation

### 4.1 Frontend Layer (React 18 + Tailwind CSS)
- **Vite Build System**: Sub-second Hot Module Replacement during development, minified production assets served through Nginx.
- **Client-Side Routing**: Role-guarded React Router v6 enforcing path security (`/student/*`, `/staff/*`, `/admin/*`).
- **Axios Interceptor**: Automatically attaches JWT bearer tokens and redirects to `/login` upon 401 expiration.
- **Real-Time Polling**: 3-second auto-refresh on the Staff Queue and 5-second polling on Student Trackers.
- **Visual Analytics**: Interactive Chart.js charts on the Warden Dashboard displaying category distribution, severity breakdown, and 7-day trendlines.

### 4.2 Backend Layer (Express REST API)
- **Layered Clean Architecture**: Modular separation into `routes/`, `middleware/`, `models/`, and operational checks in `routes/ops.js`.
- **Dual Store Architecture**: In-memory store adapter for sub-second test execution, paired with production MySQL/Redis SQL store adapter.
- **Token Generation**: Daily resetting tokens computed dynamically using Indian Standard Time (IST) offset conversion.
- **State Machine Safeguards**: Prevents illegal transitions (e.g., student cannot cancel tickets once staff starts work).

---

## 5. DevOps Implementation (Experiments 1–7)

### 5.1 Experiment 1: Version Control Operations Using Git
All feature developments occurred on dedicated branches matching Jira keys:
- 16 Feature/Bug branches (`feature/FMH-1` to `feature/FMH-14`, `fix/FMH-15`, `fix/FMH-16`).
- Standardised commit syntax: `<JIRA-KEY>: <Actionable summary>` across all 3 contributors.
- Non-fast-forward merge commits preserving sprint history.
- Semantic release tagging: `v1.0.0` (Feature Complete), `v1.0.1` (Port Alignment), `v1.0.2` (Production Verified).

### 5.2 Experiment 2: Containerizing Applications Using Docker
- **Backend Container**: Multi-stage build based on `node:20-alpine`. The final production image runs under an unprivileged `app` user, includes an internal wget healthcheck, and isolates upload directories.
- **Frontend Container**: Multi-stage build compiling React source into static assets, copied into an `nginx:alpine` image with custom reverse-proxy routing and gzip compression.

### 5.3 Experiment 3: Orchestration with Docker Compose
A unified `docker-compose.yml` configures all 7 services:
- Inter-service networking on `fmh-network` bridge.
- Named persistent volumes: `mysql-data`, `uploads`, `prometheus-data`, `grafana-data`.
- Dependency health gating: `depends_on` ensures database and cache are fully healthy before API boots, and API is healthy before frontend and monitoring start.

### 5.4 Experiment 4: Setting Up CI Pipeline Using Jenkins
The declarative `Jenkinsfile` executes on every branch push:
1. **Parallel Dependency Installation**: `npm ci` for API and Frontend.
2. **Static Code Analysis**: ESLint checks enforcing code style.
3. **Automated Test Execution**: Jest test runner with `jest-junit` XML artifact generation.
4. **Container Image Compilation**: Automated compilation of version-tagged Docker images.

### 5.5 Experiment 5: Automated Deployment & Continuous Delivery
On pushes to the `main` branch, the pipeline executes continuous deployment:
1. Builds updated containers and boots via `docker compose up -d --build`.
2. Invokes `api/scripts/smoke-test.sh`, which retries the `/api/ops/health` endpoint up to 30 times, verifies that `status == "UP"`, and validates that the reported version matches the release build.
3. Automatic rollback hook reverts containers if the smoke check fails.

### 5.6 Experiment 7: Infrastructure Monitoring
- **Prometheus**: Automatically scrapes numeric metrics from `/api/ops/metrics` every 15 seconds. Tracks HTTP request counts, response duration histograms, active complaint gauges, and Node.js process heap memory.
- **Grafana**: Pre-provisioned dashboard displaying 12 panels: request rate, p95 latency, error percentage, complaint intake, category pie charts, and event loop lag.
- **Nagios**: Daemon continuously validates TCP and HTTP availability of all 7 endpoints, sending alerts if services become unresponsive.

---

## 6. Testing & Verification

### 6.1 Automated Test Execution Results
The test suite consists of 46 automated unit and integration tests across 6 suites:
- `auth.test.js` (8 tests): Registration, duplicate rejection, input validation, JWT issuance, profile lookup.
- `complaints.test.js` (12 tests): Token generation, daily token resets, ownership verification, cancellation rules, feedback bounds.
- `staff.test.js` (8 tests): Priority ordering, transition state machines, assignment boundaries, RBAC authorization.
- `admin.test.js` (8 tests): Metric aggregations, time bucketing, staff performance statistics, role modification.
- `ops.test.js` (4 tests): `/health` UP status, Prometheus metrics formatting, 404 handler, uptime tracking.
- `lib.test.js` (6 frontend tests): Time-ago formatting, severity color lookups, T-001 token formats, filter functions.

**Result**: **46 / 46 Passed (100% Pass Rate)**

### 6.2 Deployment Smoke Test Results
Execution of `bash api/scripts/smoke-test.sh`:
```text
==================================================
    FixMyHostel Smoke Test Runner
==================================================
API URL:      http://localhost:5001
Frontend URL: http://localhost:3000
Expected Ver: 1.0.0
==================================================
Waiting for API to become ready...
API is responsive (Attempt 1/30)
Verifying /api/ops/health payload...
Health Response: {"status":"UP","version":"1.0.0","uptime":64.68}
PASS: API reports status UP
PASS: Version matches expected (1.0.0)
Checking frontend availability at http://localhost:3000...
PASS: Frontend returned HTTP 200 OK
==================================================
 FixMyHostel Smoke Tests Completed Successfully! 
==================================================
```

### 6.3 Concurrency & Load Simulation
A simulated rush test (`api/scripts/load-test.mjs`) generated 98 concurrent requests simulating 10 students registering and filing complaints simultaneously with staff triage:
- **Total Requests**: 98
- **Successful Requests**: 94
- **Success Rate**: 95.92%
- **Average Latency**: 93.80 ms
- **Expected Rejections**: 4 deliberate invalid state transitions (400 Bad Request) correctly blocked by the state machine.

---

## 7. Results & Discussion

### 7.1 Outcomes against Objectives
| Objective | Target Experiment | Result |
|-----------|-------------------|--------|
| Multi-role Ticketing & Resolution | Application | **Delivered**: Students, Staff, and Wardens operate seamless real-time workflows. |
| Sprint Planning & Traceability | Exp 6 (Jira) | **Delivered**: 16 issues across 2 sprints; every commit and PR maps to an issue key. |
| Git Branching & Merges | Exp 1 (Git) | **Delivered**: 31 commits, 15 PR merges, 3 contributor identities, 3 semantic tags. |
| Containerized Environment | Exp 2 & 3 (Docker) | **Delivered**: 7 services boot cleanly with a single command (`docker compose up -d`). |
| Automated CI/CD Pipeline | Exp 4 & 5 (Jenkins)| **Delivered**: Declarative pipeline with JUnit test reporting, smoke test, and rollback. |
| Full-Stack Monitoring | Exp 7 (Prometheus/Grafana/Nagios) | **Delivered**: Prometheus scrapes API metrics; Grafana renders dashboards; Nagios checks health. |

### 7.2 Challenges & Resolutions
1. **Host Port Collision on macOS**: Port 5000 is occupied by macOS ControlCenter / AirPlay Receiver. Resolved on branch `fix/FMH-15-macos-port-alignment` by mapping the container to host port 5001 while retaining internal port 5000 on `fmh-network`.
2. **Schema Column Alignment**: Initial seed scripts mismatched DDL columns (`raised_at` vs `created_at`, `password_hash` vs `password`). Resolved on branch `fix/FMH-16-mysql-schema-alignment` by synchronizing `store.js` and `seed.js` with production DDL.
3. **Nagios Authentication**: JasonRivers Nagios image requires explicit HTTP Basic Authentication. Resolved by seeding `htpasswd.users` with default credentials (`nagiosadmin:nagios123`).

---

## 8. Conclusion & Future Scope

### 8.1 Conclusion
FixMyHostel achieves both its practical functional goal—delivering a streamlined hostel grievance and maintenance resolution platform—and its academic pedagogical goal: demonstrating the cohesive operation of **all seven experiments** from the ASD&D syllabus. Instead of isolated exercises, Git, Docker, Docker Compose, Jenkins, Agile Scrum, Prometheus, Grafana, and Nagios operated as a unified delivery pipeline.

### 8.2 Future Scope
- Integration with SMS/WhatsApp webhooks for ready alerts.
- Geolocation tracking within hostel blocks via QR code room scanning.
- Automated escalation rules for unresolved critical complaints older than 24 hours.
- Migration to Kubernetes (Minikube / EKS) with Helm charts and rolling updates.

---

## Appendix: Quickstart & Verification Guide

### Default Service Ports
- **Frontend SPA**: `http://localhost:3000`
- **Backend API**: `http://localhost:5001`
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboards**: `http://localhost:3001` (User: `admin`, Pass: `admin123`)
- **Nagios Monitoring**: `http://localhost:8080/nagios/` (User: `nagiosadmin`, Pass: `nagios123`)
- **MySQL Database**: `localhost:3307` (DB: `fixmyhosteldb`, User: `fixmyhostel`, Pass: `hostel123`)
- **Redis Cache**: `localhost:6379`

### Default User Credentials
| Role | Email | Password |
|------|-------|----------|
| Warden / Admin | `mayank@fixmyhostel.com` | `password123` |
| Student | `ishita@fixmyhostel.com` | `password123` |
| Maintenance Staff | `bhavisha@fixmyhostel.com` | `password123` |

### One-Command Operations
```bash
# 1. Start the entire 7-service stack
docker compose up -d

# 2. Run backend test suite (40 tests)
npm test --prefix api

# 3. Run frontend test suite (6 tests)
npm test --prefix frontend

# 4. Run automated deployment smoke test
bash api/scripts/smoke-test.sh

# 5. Run live load simulation
API_URL=http://localhost:5001 node api/scripts/load-test.mjs
```

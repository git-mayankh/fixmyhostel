# FixMyHostel 🏢🔧
> **Smart Hostel Complaint & Maintenance Management System**  
> Comprehensive end-to-end multi-service full-stack web application integrated with agile methodologies, automated CI/CD pipelines, container orchestration, and multi-tier monitoring.

---

## 👥 Project Team & Roles

| Member | Role | Core Responsibilities |
| :--- | :--- | :--- |
| **Mayank Heda** | Full-Stack Dev + DevOps Lead | Backend architecture, Docker Compose orchestration, Jenkins CI/CD pipeline, Nagios alerting |
| **Ishita Gurbaxani** | Frontend Dev + Agile Lead | React UI/UX design, Scrum lifecycle, Jira sprint management, user story workflows |
| **Bhavisha Kewalramani** | Backend Dev + Monitoring Lead | Database models, REST API controllers, Prometheus metrics instrumentation, Grafana dashboards |

---

## 🛠️ Tech Stack & Badges

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24+-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-CI%2FCD-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-v2.x-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-v10-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Nagios](https://img.shields.io/badge/Nagios-Core-4682B4?style=for-the-badge&logo=nagios&logoColor=white)

---

## 📐 System Architecture

```
                       [ Students / Staff / Wardens ]
                                      │
                                      ▼
                      ┌───────────────────────────────┐
                      │    Nginx / React Frontend     │
                      │         (Port 3000)           │
                      └──────────────┬────────────────┘
                                     │ REST / JSON
                                     ▼
                      ┌───────────────────────────────┐
                      │    Node.js / Express API      │ ◄─── Scrapes (/metrics)
                      │         (Port 5000)           │            │
                      └───────┬──────────────┬────────┘            │
                              │              │                     │
                     SQL Query│              │ Cache               │
                              ▼              ▼                     ▼
                       ┌─────────────┐ ┌─────────────┐   ┌───────────────────┐
                       │  MySQL 8.0  │ │ Redis Cache │   │ Prometheus (9090) │
                       │ (Port 3307) │ │ (Port 6379) │   └─────────┬─────────┘
                       └─────────────┘ └─────────────┘             │
                                                                   ▼
                                                         ┌───────────────────┐
                                                         │  Grafana (3001)   │
                                                         └───────────────────┘

 ── [ Nagios Core Engine (Port 8080) ] ──> Health & TCP Checks across all containers
```

---

## 🧪 ASD&D Lab Experiment Mapping

FixMyHostel demonstrates the practical implementation of all 7 Agile Software Development & DevOps experiments:

| Exp # | Experiment Name | Implementation Details in FixMyHostel |
| :---: | :--- | :--- |
| **Exp 1** | **Git Version Control** | Branching strategy (`feature/*`, `bugfix/*`, `main`), semantic commits, tag releases. |
| **Exp 2** | **Docker Containerization** | Multi-stage Dockerfiles for both `api` (Alpine Node) and `frontend` (Nginx + static build). |
| **Exp 3** | **Docker Compose Stack** | 7 unified services (`frontend`, `api`, `mysql`, `redis`, `prometheus`, `grafana`, `nagios`) with healthchecks and dependencies. |
| **Exp 4** | **Jenkins CI Pipeline** | Declarative `Jenkinsfile` parallelizing linting, unit/integration testing with JUnit XML test reporting. |
| **Exp 5** | **Automated CI/CD Deployment** | Automated zero-downtime deployment on `main` merge, smoke tests, automatic failure rollback. |
| **Exp 6** | **Agile Lifecycle with Jira/Scrum** | Sprints, user stories (student filing, warden workflow), acceptance criteria, burndown tracking. |
| **Exp 7** | **Monitoring Stack** | Prometheus metrics scraping (`/api/ops/metrics`), 12-panel Grafana dashboard, Nagios daemon health checks. |

---

## 📋 Prerequisites

Before running the application, ensure the following are installed on your host machine:
- **Docker Engine** (v24.0 or higher)
- **Docker Compose** (v2.20 or higher)
- **Node.js** (v18.x or v20.x LTS) & **npm** (for local CLI development)

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fixmyhostel/fixmyhostel.git
   cd fixmyhostel
   ```

2. **Copy environment configuration:**
   ```bash
   cp .env.example .env
   ```

3. **Start all 7 services:**
   ```bash
   docker compose up -d --build
   ```

4. **Verify container health:**
   ```bash
   docker compose ps
   ```

5. **Access the applications:**
   - **Student / Warden Portal:** [http://localhost:3000](http://localhost:3000)
   - **REST API & Swagger:** [http://localhost:5000](http://localhost:5000)
   - **Grafana Dashboards:** [http://localhost:3001](http://localhost:3001)
   - **Prometheus Metrics:** [http://localhost:9090](http://localhost:9090)
   - **Nagios Monitoring:** [http://localhost:8080](http://localhost:8080)

---

## 🔑 Default Credentials

| Service | Access URL | Username / Email | Password |
| :--- | :--- | :--- | :--- |
| **FixMyHostel (Warden)** | `http://localhost:3000` | `mayank@fixmyhostel.com` | `password123` |
| **FixMyHostel (Student)** | `http://localhost:3000` | `ishita@fixmyhostel.com` | `password123` |
| **FixMyHostel (Staff)** | `http://localhost:3000` | `bhavisha@fixmyhostel.com` | `password123` |
| **Grafana** | `http://localhost:3001` | `admin` | `admin123` |
| **Nagios Core** | `http://localhost:8080` | `nagiosadmin` | `nagios123` |
| **MySQL (Root)** | `localhost:3307` | `root` | `root123` |
| **MySQL (App User)** | `localhost:3307` | `fixmyhostel` | `hostel123` |

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Role / Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new student / staff | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/complaints` | Retrieve complaints list | Authenticated |
| `POST` | `/api/complaints` | File a new complaint with photo | Student |
| `PATCH` | `/api/complaints/:id/status`| Update status (RAISED ➔ RESOLVED) | Staff / Warden |
| `POST` | `/api/complaints/:id/feedback` | Submit student satisfaction review | Student |
| `GET` | `/api/ops/health` | Service health status check | Public (Monitoring) |
| `GET` | `/api/ops/metrics` | Prometheus metrics scrape | Public (Prometheus) |

---

## 📁 Project Structure

```
fixmyhostel/
├── .env.example
├── .gitignore
├── Jenkinsfile
├── README.md
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── package.json
│   ├── uploads/
│   │   └── .gitkeep
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── services/
│   └── scripts/
│       └── smoke-test.sh
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── src/
├── monitoring/
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   └── fixmyhostel.json
│   │   └── provisioning/
│   │       ├── dashboards/
│   │       │   └── dashboard.yml
│   │       └── datasources/
│   │           └── datasource.yml
│   ├── nagios/
│   │   └── conf.d/
│   │       └── fixmyhostel.cfg
│   └── prometheus/
│       ├── alerts.yml
│       └── prometheus.yml
└── mysql/
    └── init.sql
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

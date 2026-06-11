# PROSPECTOR - Asteroid Mining Feasibility Engine
## "Which asteroid should humanity mine first?"

---

## 🚀 Overview

PROSPECTOR is a full-stack web platform that:
- Ingests **live NASA JPL asteroid data** (no API keys required)
- Scores every accessible **Near-Earth Asteroid** using a proprietary **EVS (Economic Viability Score)**
- Visualizes mining missions in **interactive 3D**
- Estimates **mineral composition and economic value**
- Generates **full mission plans** with cost breakdowns

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11 + FastAPI |
| **Frontend** | Next.js 15 + TypeScript + TailwindCSS |
| **Database** | PostgreSQL 15 (Supabase) |
| **Cache** | Redis |
| **3D Engine** | Three.js via @react-three/fiber |
| **ORM** | SQLAlchemy 2.0 (async) |
| **Migrations** | Alembic |
| **Container** | Docker + Docker Compose |

---

## 📦 Project Structure

```
prospector/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   └── utils/     # Constants & math
│   ├── alembic/       # DB migrations
│   ├── tests/         # Unit tests
│   └── requirements.txt
├── frontend/          # Next.js application
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/
│       ├── services/  # API client
│       ├── store/     # Zustand state
│       └── types/
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
# Run DB migrations
alembic upgrade head
# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker (Full Stack)

```bash
docker-compose up --build
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/asteroids` | List all asteroids |
| GET | `/api/asteroids/{des}` | Get asteroid details |
| GET | `/api/asteroids/{des}/orbit` | Orbital trajectory points |
| GET | `/api/asteroids/search?q=Eros` | Search asteroids |
| POST | `/api/asteroids/sync` | Trigger NASA data sync |
| GET | `/api/evs/leaderboard` | Top ranked asteroids |
| GET | `/api/evs/{des}` | EVS score for asteroid |
| GET | `/api/evs/stats` | Aggregate statistics |
| GET | `/api/compositions/{des}` | Mineral composition |
| GET | `/api/compositions/{des}/value` | Estimated value |
| GET | `/api/trajectories/accessible` | NHATS-accessible asteroids |
| GET | `/api/trajectories/{des}` | Trajectory data |
| GET | `/api/market/prices` | Commodity prices |
| GET | `/api/market/impact/{des}` | Market impact simulation |
| POST | `/api/mission/plan` | Generate mission plan |

Full Swagger docs: http://localhost:8000/docs

---

## 📊 EVS Scoring Algorithm

```
EVS = (0.30 × Accessibility) + (0.45 × ResourceValue) + (0.25 × Feasibility)
```

- **Accessibility**: Based on delta-v (fuel cost to reach asteroid)
- **ResourceValue**: Log-normalized mineral wealth estimate
- **Feasibility**: Duration, orbit uncertainty, spin rate, size

---

## 🗄️ Database

Using **Supabase PostgreSQL** (ap-southeast-1):
- Host: `aws-1-ap-southeast-1.pooler.supabase.com`
- Port: `5432`

Tables: `asteroids`, `orbital_elements`, `physical_params`, `compositions`, `nhats_trajectories`, `evs_scores`, `commodity_prices`

---

## 🛰️ Data Sources

All NASA JPL APIs are **free, public, no API keys required**:
- **SBDB Lookup**: `ssd-api.jpl.nasa.gov/sbdb.api` — Individual asteroid data
- **SBDB Query**: `ssd-api.jpl.nasa.gov/sbdb_query.api` — Bulk 780K+ asteroids
- **NHATS**: `ssd-api.jpl.nasa.gov/nhats.api` — 119 accessible targets
- **CAD**: `ssd-api.jpl.nasa.gov/cad.api` — Close approach events

---

## 🏆 Hackathon

Built for **Japan Hack 2026** — Space Technology + Aerospace Intelligence category.

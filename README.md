# Disaster Response 360

**Disaster Response 360** is a full-scale, premium disaster management and emergency response coordination platform. It enables citizens to report disasters, responders to coordinate relief, and administrators to monitor evolving situations in real time.

> ⚠️ **Development Notice**: This is a development deployment. It is not affiliated with any official government emergency-management authority. Do not use this system as a substitute for official emergency services. In an emergency, contact **112** (India) or your local emergency number.

---

## Architecture Overview

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + MapLibre GL JS + Three.js |
| Backend | Python 3.12+ + FastAPI + SQLAlchemy 2.x + Alembic |
| Database | PostgreSQL 15+ (PostGIS for geo queries) |
| Cache / Queue | Redis (optional, for rate limiting & background jobs) |
| Auth | JWT (access + refresh tokens) + Argon2id hashing |
| Storage | Local filesystem (dev) / S3-compatible (production) |
| Real-time | WebSockets (FastAPI native) |

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- Python ≥ 3.12
- PostgreSQL ≥ 15 (with PostGIS extension)
- Git

### 1. Clone and configure

```bash
git clone <repo-url>
cd disaster-response-360

# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and secrets

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API base URL
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 4. Access the platform

| URL | Description |
|---|---|
| http://localhost:5173 | Frontend (public website) |
| http://localhost:8000/docs | Backend API documentation (Swagger) |
| http://localhost:8000/redoc | Backend API documentation (ReDoc) |

---

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the complete list.

### Critical backend variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (generate with `openssl rand -hex 32`) |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |

---

## Project Structure

```
disaster-response-360/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/   # Shared reusable UI components
│   │   ├── features/     # Feature-area modules
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities, API client, stores
│   │   ├── pages/        # Route-level page components
│   │   └── styles/       # Global styles and design tokens
│   └── public/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # Route handlers (versioned)
│   │   ├── core/         # Config, security, logging
│   │   ├── db/           # Database session, base models
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── integrations/ # External service adapters
│   │   └── workers/      # Background task workers
│   ├── alembic/          # Database migrations
│   └── tests/            # Backend test suite
├── docs/                  # Architecture and operational docs
├── scripts/               # Dev and deployment scripts
└── tests/                 # Integration and E2E tests
```

---

## Documentation

- [Architecture](docs/architecture.md)
- [Security](docs/security.md)
- [API Conventions](docs/api-conventions.md)
- [Deployment](docs/deployment.md)
- [External Integrations](docs/integrations.md)

---

## Development Status

See the [Project Checklist](docs/checklist.md) for current implementation status across all features.

---

## License

This project is developed for disaster management and emergency response coordination. All official data sources (IMD, NDMA, etc.) are subject to their own terms and licenses.

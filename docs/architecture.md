# Architecture — Disaster Response 360

## Overview

Disaster Response 360 is a **modular monolith** with clearly separated frontend and backend concerns. The architecture is designed to be reliable, maintainable, and extensible into microservices if operational scale demands it.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  Browser (React SPA)  ·  Mobile Browser  ·  PWA            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                     FastAPI Backend                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ REST API │  │   WS     │  │  Auth &  │  │Background │  │
│  │ /api/v1  │  │ /ws      │  │  RBAC    │  │  Workers  │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Service Layer                       │  │
│  │  Incidents · Alerts · Users · NGOs · Volunteers      │  │
│  │  Shelters · Resources · Notifications · Analytics    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Repository Layer                      │  │
│  │              SQLAlchemy 2.x ORM                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────┬─────────────────────────────────┬─────────────┘
             │                                 │
┌────────────▼──────────┐       ┌──────────────▼──────────────┐
│   PostgreSQL + PostGIS │       │    External Integrations    │
│   (Primary datastore) │       │  IMD · NDMA · Open-Meteo    │
│                       │       │  MapTiler/OSM tiles         │
└───────────────────────┘       └─────────────────────────────┘
```

## Frontend Architecture

### Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React 18 | Specified; large ecosystem, concurrent features |
| Build tool | Vite 5 | Fast HMR, excellent DX, code splitting |
| Styling | Tailwind CSS 3 | Utility-first, design token integration |
| Routing | React Router v6 | Declarative, nested routes, loaders |
| State | Zustand + React Query | Lightweight global state + server state |
| HTTP | Axios | Interceptors, request cancellation |
| Maps | MapLibre GL JS | Free, open-source, WebGL-powered |
| 3D | Three.js | Selective 3D enhancement scenes |
| Icons | Lucide React | Consistent, accessible icon set |
| Charts | Recharts | Composable, accessible charts |
| i18n | react-i18next | Industry standard, lazy loading |

### Feature Module Structure

Each feature module owns its components, hooks, services, and types:

```
features/
├── auth/          # Registration, login, session management
├── incidents/     # Incident list, detail, status tracking
├── reporting/     # Citizen report submission flow
├── alerts/        # Official alert display and ingestion status
├── maps/          # MapLibre integration, marker clustering
├── emergency-services/  # Directory, calling, directions
├── shelters/      # Shelter map, detail, availability
├── ngos/          # NGO profiles, coordination workflows
├── volunteers/    # Registration, assignment management
├── resources/     # Relief inventory tracking
├── analytics/     # Charts, trends, exports
└── admin/         # Control center, user management
```

## Backend Architecture

### API Versioning

All endpoints are versioned under `/api/v1/`. A version prefix change constitutes a breaking change.

### Module Boundaries

```
app/
├── api/v1/
│   ├── auth.py          # Authentication endpoints
│   ├── users.py         # User management
│   ├── incidents.py     # Incident CRUD and workflow
│   ├── reports.py       # Citizen report submission
│   ├── alerts.py        # Official alert display
│   ├── emergency.py     # Emergency services directory
│   ├── shelters.py      # Shelter management
│   ├── ngos.py          # NGO coordination
│   ├── volunteers.py    # Volunteer management
│   ├── resources.py     # Relief inventory
│   ├── notifications.py # Notification preferences
│   ├── analytics.py     # Analytics and reporting
│   └── admin.py         # Administrative operations
├── core/
│   ├── config.py        # Pydantic Settings configuration
│   ├── security.py      # Password hashing, JWT, CORS
│   ├── logging.py       # Structured logging setup
│   ├── dependencies.py  # FastAPI dependency injection
│   └── exceptions.py    # Custom exception types
├── db/
│   ├── session.py       # SQLAlchemy engine and session
│   └── base.py          # Declarative base
├── models/              # SQLAlchemy ORM models
├── schemas/             # Pydantic request/response schemas
├── services/            # Business logic (no ORM imports)
├── repositories/        # Data access (ORM queries)
├── integrations/        # External API adapters
│   ├── imd.py           # India Meteorological Department
│   ├── ndma.py          # NDMA SACHET alerts
│   ├── open_meteo.py    # Weather data
│   └── storage.py       # Object storage adapter
└── workers/             # Background task handlers
```

### Authentication and Authorization

- **Auth mechanism**: JWT with short-lived access tokens (15 min) and refresh tokens (7 days)
- **Hashing**: Argon2id via `argon2-cffi`
- **RBAC**: Role-based permission matrix enforced at the service layer
- **Audit**: All sensitive operations logged to `audit_events` table

### Database Design Principles

1. All tables have a UUID primary key
2. All timestamps are `TIMESTAMPTZ` (UTC)
3. Soft deletes via `deleted_at` for incident and user records
4. PostGIS `GEOGRAPHY(POINT)` for location fields
5. All foreign keys have explicit `ON DELETE` behavior declared
6. Critical tables have row-level security documentation

## Deployment Architecture

### Development

```
localhost:5173  →  Vite dev server (React)
localhost:8000  →  Uvicorn (FastAPI, --reload)
localhost:5432  →  PostgreSQL
localhost:6379  →  Redis (optional)
```

### Production Target

```
CDN/Edge    →  Static frontend assets
Nginx       →  Reverse proxy, TLS termination
Uvicorn     →  Multiple workers (Gunicorn supervisor)
PostgreSQL  →  Primary + replica
Redis       →  Cache + Celery broker
S3/R2       →  Media storage
```

## Key Architectural Decisions

### ADR-001: Modular Monolith over Microservices
**Decision**: Start with a single deployable backend unit.
**Rationale**: Emergency systems require high reliability; distributed systems add failure modes. Module boundaries are enforced by directory structure.
**Migration path**: Each module boundary is designed to be extracted into a separate service if traffic demands it.

### ADR-002: Server-Sent Events for Live Updates, WebSockets for Bidirectional
**Decision**: WebSockets for admin dashboards, polling fallback for citizen views.
**Rationale**: WebSocket connections are stateful and require reconnection management; polling is simpler and more resilient for read-heavy citizen views.

### ADR-003: React Query for Server State
**Decision**: Use TanStack Query for server-side state, Zustand only for UI state.
**Rationale**: React Query handles caching, deduplication, background refetching, and optimistic updates automatically.

### ADR-004: PostGIS for Geographic Queries
**Decision**: Use PostGIS when geographic proximity, containment, or bounding-box queries are needed.
**Rationale**: Application-level geographic math is error-prone and slow at scale. PostGIS operators use spatial indexes.

# Deployment Guide — Disaster Response 360

## Development Setup

### Prerequisites

| Tool | Minimum Version |
|---|---|
| Node.js | 20.x |
| Python | 3.12 |
| PostgreSQL | 15 (with PostGIS extension) |
| Git | 2.40+ |
| Redis | 7.x (optional) |

### PostgreSQL Setup

```sql
-- Create database and enable PostGIS
CREATE USER dr360 WITH PASSWORD 'change_me_in_production';
CREATE DATABASE disaster_response_360 OWNER dr360;
\c disaster_response_360
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env — minimum required: DATABASE_URL, SECRET_KEY

# Run migrations
alembic upgrade head

# Seed development data (optional)
python scripts/seed_dev.py

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_BASE_URL=http://localhost:8000

npm run dev
# Opens at http://localhost:5173
```

## Environment Variables

### Backend (`backend/.env`)

```env
# ── Database ──────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://dr360:password@localhost:5432/disaster_response_360

# ── Security ──────────────────────────────────────────────────
SECRET_KEY=change_this_to_a_random_32_byte_hex_string
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── CORS ──────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173

# ── File Storage ──────────────────────────────────────────────
STORAGE_BACKEND=local
LOCAL_STORAGE_PATH=./uploads
# S3_BUCKET=your-bucket
# S3_REGION=ap-south-1
# S3_ACCESS_KEY=
# S3_SECRET_KEY=

# ── Redis (optional) ──────────────────────────────────────────
# REDIS_URL=redis://localhost:6379/0

# ── Weather (Open-Meteo — free tier, no key required) ─────────
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1

# ── Map Tiles ─────────────────────────────────────────────────
# MAPTILER_API_KEY=   (optional, for satellite tiles)

# ── Email (optional) ──────────────────────────────────────────
# SMTP_HOST=
# SMTP_PORT=587
# SMTP_USERNAME=
# SMTP_PASSWORD=
# SMTP_FROM=noreply@disasterresponse360.example

# ── Application ───────────────────────────────────────────────
APP_ENV=development
LOG_LEVEL=INFO
DEBUG=true
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_APP_NAME=Disaster Response 360
VITE_APP_ENV=development
# VITE_MAPTILER_KEY=   (optional, for premium map styles)
VITE_OPENSTREETMAP_ATTRIBUTION=© OpenStreetMap contributors
```

## Running Tests

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app --cov-report=html

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

## Database Operations

```bash
# Create new migration
cd backend
alembic revision --autogenerate -m "description_of_change"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# Backup
pg_dump -U dr360 -d disaster_response_360 -F c -f backup_$(date +%Y%m%d).dump

# Restore
pg_restore -U dr360 -d disaster_response_360 backup_20240115.dump
```

## Production Deployment (Reference)

> ⚠️ Production deployment requires verified credentials, security review, and explicit authorization before serving real users.

### Checklist Before Production

- [ ] `SECRET_KEY` is a cryptographically secure random value
- [ ] Database uses a non-superuser account
- [ ] `DEBUG=false` and `APP_ENV=production`
- [ ] `ALLOWED_ORIGINS` is restricted to production domain(s)
- [ ] TLS/HTTPS configured at reverse proxy
- [ ] Security headers set (HSTS, CSP, X-Frame-Options)
- [ ] File uploads are stored outside the web root
- [ ] Database backups are configured and tested
- [ ] Rate limiting is configured with Redis backend
- [ ] Monitoring and alerting is configured
- [ ] Default admin password has been changed

### Production Backend

```bash
# Production server with multiple workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 30 \
  --access-logfile - \
  --error-logfile -
```

### Frontend Build

```bash
cd frontend
npm run build
# Artifacts in frontend/dist/ — serve via CDN or Nginx
```

## Known Limitations

See [docs/integrations.md](integrations.md) for external service limitations and blockers.

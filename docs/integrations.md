# External Integrations — Disaster Response 360

## Integration Status Summary

| Integration | Purpose | Status | Config Key |
|---|---|---|---|
| Open-Meteo | Weather data | ✅ Implemented | `OPEN_METEO_BASE_URL` |
| OpenStreetMap | Map tiles | ✅ No config needed | Attribution in UI |
| IMD | Official weather alerts | 🚫 Blocked | — |
| NDMA SACHET | Disaster alerts | 🚫 Blocked | — |
| MapTiler | Premium map styles | ⬜ Optional | `MAPTILER_API_KEY` |
| Local filesystem | Dev file uploads | ✅ Implemented | `LOCAL_STORAGE_PATH` |
| AWS S3 / Cloudflare R2 | Production uploads | ⬜ Not configured | `S3_BUCKET`, `S3_*` |
| SMTP | Email notifications | ⬜ Stub | `SMTP_HOST`, `SMTP_*` |
| Web Push | Browser push | ⬜ Stub | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| Redis | Caching, rate limiting | ⬜ Optional | `REDIS_URL` |
| ClamAV | Virus scanning | ⬜ Stub | `CLAMAV_HOST` |

---

## Open-Meteo (Weather Data)

**Status**: ✅ Implemented in `backend/app/integrations/open_meteo.py`

**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**Terms**: Free for non-commercial use. Commercial use requires a subscription.
Attribution required: "Weather data by Open-Meteo.com"

**Data available**:
- Current temperature, humidity, wind speed
- Precipitation probability
- Weather condition code
- 7-day forecast

**Error handling**: Returns `None` on timeout or API error. Frontend shows "Weather unavailable" gracefully.

**Quota**: None documented for free tier, but excessive polling is discouraged.

---

## OpenStreetMap (Map Tiles)

**Status**: ✅ Used by MapLibre GL JS

**Tile URL**: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`

**Terms**: Free to use with attribution. Heavy-traffic applications should use a tile hosting service.

**Attribution required**: © OpenStreetMap contributors

**Limitation**: OSM raster tiles are not suitable for high-traffic production. Consider:
- Self-hosting with OpenTileServer
- Hosting on Maptiler, MapBox, or Stadia Maps (commercial with free tiers)
- Protomaps for self-hosted vector tiles

---

## India Meteorological Department (IMD)

**Status**: 🚫 Blocked

**Desired data**: Weather warnings, cyclone alerts, rainfall alerts

**Investigation findings**:
- IMD provides data at imd.gov.in but no documented programmatic API for third-party use
- Data available via manual download (GIS files, PDF bulletins)
- SACHET API (run by NDMA, integrates IMD data) may be the practical path

**Workaround**: Administrators can manually create official alerts through the admin interface. Alerts are clearly labeled as "Manual Entry" vs "API Feed".

**Resolution path**: Contact IMD (https://mausam.imd.gov.in/) and NDMA for data partnership or API access. Document MOU requirements.

---

## NDMA SACHET (National Disaster Alert System)

**Status**: 🚫 Blocked

**Desired data**: Multi-hazard early warning alerts

**Investigation findings**:
- SACHET (https://sachet.ndma.gov.in/) provides public-facing alerts
- No documented public REST API found as of implementation date
- Registration/partnership may be required for data feed access
- RSS/Atom feed may be available but not confirmed

**Workaround**: Same as IMD — manual alert creation by admins.

**Resolution path**: Apply through NDMA portal (https://ndma.gov.in/) for partner data access.

---

## MapTiler (Enhanced Map Styles)

**Status**: ⬜ Optional

**Configuration**: Set `VITE_MAPTILER_KEY` and `MAPTILER_API_KEY`

**Free tier**: 100,000 tile requests/month, 1 project

**Sign up**: https://maptiler.com

**What it adds**: 
- Vector tile styles (Topo, Satellite, Streets)
- Better geographic detail
- Faster rendering

**Without it**: Application uses OSM raster tiles (fully functional, slightly less visual quality).

---

## AWS S3 / Cloudflare R2 (Production File Storage)

**Status**: ⬜ Not configured (local filesystem used in development)

**Configuration** (backend/.env):
```
STORAGE_BACKEND=s3
S3_BUCKET=dr360-uploads
S3_REGION=ap-south-1
S3_ACCESS_KEY=your_key
S3_SECRET_KEY=your_secret
```

**Cloudflare R2** is a cost-effective alternative (S3-compatible, no egress fees):
```
S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET=dr360-uploads
```

**Security requirements**:
- Bucket must NOT be public
- Pre-signed URLs used for private media access
- Lifecycle rules for retention/deletion

---

## SMTP Email Notifications

**Status**: ⬜ Stub implemented, not active

**Configuration** (backend/.env):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@email.com
SMTP_PASSWORD=app_password_not_account_password
SMTP_FROM=noreply@disasterresponse360.example
```

**Development behavior**: Email delivery is logged to console but not actually sent.

**Free options**:
- Gmail SMTP (500/day with app password)
- SendGrid (100/day free)
- Mailgun (100/day free)

---

## Web Push Notifications

**Status**: ⬜ Stub

**Required**: VAPID key pair

**Generate keys**:
```bash
pip install pywebpush
python -c "from pywebpush import webpush; print(webpush.generate_keys())"
```

**Configuration**:
```
VAPID_PRIVATE_KEY=your_private_key
VAPID_PUBLIC_KEY=your_public_key
VAPID_SUBJECT=mailto:admin@dr360.example
```

---

## Development Notes on "Live" Data

When the application is running without external integrations configured:

- **Official alerts**: Show "DEMO DATA — Not from official sources" banner
- **Weather**: Show "Weather service unavailable" 
- **Map tiles**: OpenStreetMap tiles load without configuration
- **Incidents**: Show real submitted incidents from local database
- **Emergency directory**: Show seeded development records labeled as "Sample Data"
- **Shelters**: Show seeded development records labeled as "Sample Data"

These labels are enforced in the frontend display logic, not just a development convention.

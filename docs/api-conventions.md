# API Conventions — Disaster Response 360

## Base URL

```
Development:  http://localhost:8000/api/v1
Production:   https://api.disasterresponse360.example/api/v1
```

## HTTP Methods

| Method | Semantics |
|---|---|
| `GET` | Retrieve resource(s), no side effects |
| `POST` | Create resource or trigger action |
| `PUT` | Replace resource entirely |
| `PATCH` | Partial update |
| `DELETE` | Remove resource |

## Authentication

All protected endpoints require:

```
Authorization: Bearer <access_token>
```

Unauthenticated requests return `401 Unauthorized`.
Insufficiently privileged requests return `403 Forbidden`.

## Request Format

- Content-Type: `application/json` for JSON bodies
- Content-Type: `multipart/form-data` for file uploads
- All timestamps sent to the API must be ISO 8601 with timezone (`2024-01-15T14:30:00+05:30`)

## Response Envelope

### Success

```json
{
  "data": { ... },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### Paginated List

```json
{
  "data": [ ... ],
  "meta": {
    "total": 1432,
    "page": 1,
    "page_size": 20,
    "total_pages": 72,
    "request_id": "uuid",
    "timestamp": "2024-01-15T14:30:00Z"
  }
}
```

### Error

```json
{
  "error": {
    "code": "INCIDENT_NOT_FOUND",
    "message": "The requested incident could not be found.",
    "details": null,
    "request_id": "uuid"
  }
}
```

## Error Codes

| HTTP Status | Error Code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body failed validation |
| 401 | `NOT_AUTHENTICATED` | Missing or invalid token |
| 401 | `TOKEN_EXPIRED` | Access token has expired |
| 403 | `PERMISSION_DENIED` | Authenticated but not authorized |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate resource or state conflict |
| 422 | `UNPROCESSABLE_ENTITY` | Semantically invalid request |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |
| 503 | `SERVICE_UNAVAILABLE` | Dependency outage |

## Pagination

Query parameters: `page` (default 1), `page_size` (default 20, max 100)

```
GET /api/v1/incidents?page=2&page_size=50
```

## Filtering and Sorting

```
GET /api/v1/incidents?status=in_progress&category=flooding&sort=-created_at
```

- Prefix with `-` for descending sort
- Multiple filter values: `status=submitted&status=acknowledged`

## Geographic Queries

```
GET /api/v1/incidents?lat=17.3850&lon=78.4867&radius_km=25
```

## Field Selection

```
GET /api/v1/incidents?fields=id,title,status,location
```

## Timestamps

All timestamps in API responses are UTC ISO 8601:
```
"created_at": "2024-01-15T09:00:00Z"
```

## Idempotency

POST requests to `/api/v1/reports` support an `Idempotency-Key` header to prevent duplicate submissions:

```
Idempotency-Key: <client-generated-uuid>
```

## WebSocket Protocol

Connection: `ws://localhost:8000/ws/incidents?token=<access_token>`

### Message Format

```json
{
  "type": "incident.status_changed",
  "payload": { ... },
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Event Types

| Event | Description |
|---|---|
| `incident.created` | New incident reported |
| `incident.status_changed` | Incident status transition |
| `incident.assigned` | Responder assigned |
| `alert.created` | New official alert ingested |
| `alert.expired` | Alert has expired |
| `resource.updated` | Inventory level changed |
| `connection.ack` | Connection established |
| `connection.ping` | Keep-alive ping |

## Versioning Policy

- Breaking changes require a new major version (`/api/v2/`)
- Additive changes (new fields, new endpoints) do not require a version bump
- Deprecated fields are marked with `"deprecated": true` in OpenAPI schema
- Old versions receive security patches for 12 months after deprecation announcement

# Security Architecture — Disaster Response 360

## Threat Model

This platform handles sensitive emergency incident data, personally identifiable information (PII) of reporters, location data, and access to emergency coordination workflows.

Primary threats:
1. **Unauthorized access** to incident data or contact information
2. **Privilege escalation** by authenticated but unprivileged users
3. **Data exfiltration** via insecure APIs or exported files
4. **Injection attacks** via malicious report content or file uploads
5. **Account takeover** via credential attacks
6. **Denial of service** targeting emergency reporting endpoints
7. **PII exposure** of disaster reporters

## Authentication

### Token Architecture
- **Access token**: JWT, 15-minute lifetime, signed with HS256 using `SECRET_KEY`
- **Refresh token**: Opaque random token, 7-day lifetime, stored hashed in database
- **Token rotation**: Refresh tokens are single-use and rotated on each refresh

### Password Security
- **Algorithm**: Argon2id (memory-hard, resistant to GPU/ASIC attacks)
- **Parameters**: memory=65536, iterations=3, parallelism=4 (OWASP recommendation)
- **No password hints or security questions**

### Session Lifecycle
- Logout invalidates the specific refresh token
- Account deletion invalidates all refresh tokens
- Administrative account lock invalidates all active sessions

## Authorization (RBAC)

### Role Hierarchy

| Role | Code | Description |
|---|---|---|
| Citizen | `citizen` | Public reporter, read-only incident tracking |
| Volunteer | `volunteer` | Registered volunteer, receives assignments |
| NGO Member | `ngo_member` | Organization-affiliated responder |
| Field Responder | `field_responder` | Assigned to specific incident response |
| Department Operator | `dept_operator` | Reviews and assigns incidents within jurisdiction |
| Department Admin | `dept_admin` | Manages department users and settings |
| Platform Admin | `platform_admin` | Full administrative access |
| Auditor | `auditor` | Read-only access to audit logs and analytics |

### Permission Matrix (Key Operations)

| Operation | Citizen | Volunteer | NGO Member | Field Resp | Dept Op | Dept Admin | Platform Admin |
|---|---|---|---|---|---|---|---|
| Submit incident report | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View own reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View all incidents | — | — | — | ✓ (assigned) | ✓ (jurisdiction) | ✓ | ✓ |
| Update incident status | — | — | — | ✓ (assigned) | ✓ | ✓ | ✓ |
| View reporter PII | — | — | — | — | ✓ | ✓ | ✓ |
| Assign incidents | — | — | — | — | ✓ | ✓ | ✓ |
| Manage users | — | — | — | — | — | ✓ (dept) | ✓ |
| Export data | — | — | — | — | — | ✓ | ✓ |
| View audit logs | — | — | — | — | — | — | ✓ |

## API Security Controls

### Input Validation
- All request bodies validated via Pydantic models with strict constraints
- File uploads: type whitelist, size limits, server-side MIME detection
- Geographic coordinates: validated ranges (lat: -90..90, lon: -180..180)

### Rate Limiting
| Endpoint Group | Limit |
|---|---|
| Authentication (login/register) | 10 req/min per IP |
| Report submission | 5 req/min per authenticated user |
| File uploads | 3 req/min per authenticated user |
| Public read endpoints | 60 req/min per IP |
| Admin operations | 30 req/min per user |

### CORS
- Development: `http://localhost:5173`
- Production: Explicit allowlist from `ALLOWED_ORIGINS` env var
- Credentials mode enabled only for same-origin or explicitly allowed origins

### Upload Security
- File type validated by content inspection (python-magic), not extension alone
- Allowed types: JPEG, PNG, WebP, MP4, MOV
- Maximum file size: 50 MB per file, 200 MB per report
- Files stored with random UUID filenames, never original names
- Uploads stored outside the web root
- Virus scanning: configurable (ClamAV integration stub provided)

## Data Protection

### PII Handling
- Reporter contact information (phone, email) stored encrypted at rest (application-level AES-256-GCM)
- Reporter identity never exposed in public-facing API responses
- Report geographic location is rounded to neighborhood level for public display

### Sensitive Data in Logs
- No passwords, tokens, or PII in application logs
- Request logging excludes body content for auth endpoints
- Audit logs are append-only (no delete API)

### Data Retention
- Incident reports: retained for 7 years (configurable, regulatory compliance)
- User sessions: purged after expiry
- Audit events: retained for 3 years (configurable)
- Media uploads: retained per incident lifecycle + 30-day grace period

## Security Checklist

- [ ] SECRET_KEY is a cryptographically random value, minimum 32 bytes
- [ ] DATABASE_URL does not use a superuser account in production
- [ ] ALLOWED_ORIGINS is restricted in production
- [ ] File upload directory is not web-accessible
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced (TLS termination at proxy)
- [ ] Security headers configured at proxy (HSTS, CSP, X-Frame-Options)
- [ ] Database backups are encrypted at rest
- [ ] Audit logging is active
- [ ] Default admin credentials changed before production use

## Incident Response

If a security incident is suspected:
1. Rotate `SECRET_KEY` (invalidates all active sessions)
2. Rotate database credentials
3. Review audit logs for unauthorized access patterns
4. Revoke suspicious refresh tokens via admin interface

## Known Limitations (Development)

- Refresh tokens are stored in the database; production should consider Redis for faster revocation
- Application-level encryption for PII is a stub that must be completed with a proper key management system (AWS KMS, HashiCorp Vault) before production
- Rate limiting uses in-memory counters in development; Redis-backed limiting required for multi-process production deployment

# API reference

Base URL: `/api` on the same host. All JSON write requests require `Content-Type: application/json`.

## Public

### `GET /health`

```json
{ "status": "ok", "database": "connected", "adminEnabled": true }
```

`database` is `connected`, `demo` (no URI), or `unavailable` (configured but not connected). `status` is `degraded` when a configured database is unavailable. No credentials are returned.

### `GET /projects`

Optional query parameters:

- `category=fullstack|backend|frontend|design`
- `featured=true`

```json
{
  "projects": [
    {
      "title": "EmployeeMS",
      "slug": "employeems",
      "summary": "Employee management system with role-based access, secured with JWT, deployed live.",
      "highlights": ["JWT authentication with role-based access control (RBAC)"],
      "stack": ["React", "Node.js", "Express", "MongoDB", "JWT"],
      "category": "fullstack",
      "liveUrl": "https://employee-ms-chi.vercel.app/",
      "repoUrl": "https://github.com/AditiTomar11/EmployeeMS",
      "featured": true,
      "order": 1
    }
  ],
  "source": "mongodb"
}
```

MongoDB documents also have `_id`, and may have timestamps. Results are ordered by `order` ascending, then newest creation time. Unrecognized filter values are ignored, not passed to MongoDB.

### `GET /projects/:slug`

Returns `{ "project": { ... } }`. A missing slug returns 404; an invalid format returns 400. Valid slugs are lowercase letters, numbers and hyphens.

### `POST /contact`

```json
{
  "name": "Visitor Name",
  "email": "visitor@example.com",
  "interest": "UI / UX",
  "message": "I would like to talk about an opportunity on our team.",
  "website": ""
}
```

`name`: 2–100 characters; valid email up to 254; `interest` up to 80; `message`: 10–5000. `website` is a honeypot and must be absent or empty.

Returns **201** with `{ "message": "...", "id": "<MongoDB message ID>" }` only after successful MongoDB storage. Without MongoDB it returns 503 — no pretend submission. Rate limit: five requests per IP per 15 minutes. Optional email delivery is a separate notification, not the storage guarantee.

## Authentication

### `POST /admin/login`

```json
{ "password": "<your server-configured admin password>" }
```

Returns `{ "token": "<JWT>", "expiresIn": 7200 }`.

Requires configured `ADMIN_PASSWORD` (12+ characters) and `JWT_SECRET` (32+). Returns 503 if disabled, 401 on an incorrect password. Rate limit: eight requests per IP per 15 minutes.

For every protected request send:

```http
Authorization: Bearer <JWT>
```

### `GET /admin/me`

Returns `{ "role": "admin" }` after JWT verification.

## Projects — protected

### `POST /admin/projects`

Body is the full project object, using the fields shown in the public list example. Required: `title`, `slug`, `summary`, `stack` (at least one item), and `category`. Optional: `highlights`, `liveUrl`, `repoUrl`, `imageUrl`, `featured`, `order`.

- Title: 2–120 characters
- Slug: 2–120, lowercase alphanumeric segments with hyphens, unique
- Summary: 10–700
- Highlights: up to 12 entries, each 1–300
- Stack: 1–20 entries, each 1–60
- Category: `fullstack`, `backend`, `frontend`, `design`
- URLs: empty or valid `http://` / `https://`, up to 2048 characters
- Order: integer 0–9999
- Featured: boolean

Returns **201** with `{ "project": { ... } }`. Duplicate slug: 409.

### `PUT /admin/projects/:id`

Full replacement of the editable fields, with the same validation. ID is the MongoDB `_id` returned by the list endpoint. Returns `{ "project": { ... } }`. Unknown ID: 404; invalid ID format: 400.

### `DELETE /admin/projects/:id`

Permanently deletes the project. Returns `{ "message": "Project deleted." }`.

## Messages — protected

### `GET /admin/messages`

Returns `{ "messages": [...] }`, newest first, up to the latest 200 messages. Each includes `_id`, `name`, `email`, `interest`, `message`, `read`, and timestamps. This small-portfolio starter has no inbox pagination; extend it if you expect a large volume of inquiries.

### `PATCH /admin/messages/:id`

```json
{ "read": true }
```

Returns `{ "message": { ...updated document... } }`. `read` must be a boolean.

### `DELETE /admin/messages/:id`

Permanently deletes the inquiry. Returns `{ "message": "Message deleted." }`.

## Errors

Errors consistently return `{ "error": "Human-readable message" }`. Validation errors may also include `fields`.

- 400: invalid input / malformed JSON
- 401: missing, invalid or expired JWT / incorrect password
- 403: disallowed cross-origin request
- 404: missing resource or API route
- 409: duplicate project slug
- 413: body exceeds 48 KB
- 429: rate limit
- 503: database unavailable or administration not configured
- 500: unexpected failure, without internal details or credentials

All API routes additionally have a 100-request-per-IP-per-minute limit. Same-origin browser requests are allowed. Separate frontend domains must be listed in `CLIENT_ORIGIN`; development additionally permits the Arena preview origin. Configure `TRUST_PROXY` correctly for your hosting topology.

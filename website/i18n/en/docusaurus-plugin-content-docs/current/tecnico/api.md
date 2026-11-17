---
id: api
title: API
sidebar_position: 3
---

# API

Base: `http://localhost:5000` in development. JSON responses; errors look like `{"message": "..."}`. 🔒 requires `Authorization: Bearer <token>`; 🛡️ requires an admin user (the role is checked in the database on every request).

## Routes

| Method and path | Access | Description |
|---|---|---|
| `GET /health` | public | Server and database status. |
| `POST /api/auth/register` | public | Creates an account (`name`, `email`, `password` of 8 to 128 characters). |
| `POST /api/auth/login` | public | Returns a JWT `token` and the user (with `role`). |
| `GET /api/auth/me` | 🔒 | The token's user, to restore a session. |
| `GET /api/projects` | public | Published projects. Filters `type` and `q`. |
| `GET /api/projects/:id` | public | One published project. |
| `GET /api/projects/:id/feedback` | public | Average, count and recent comments, with no author data. |
| `POST /api/feedback` | public | `projectId`, `rating` (1 to 5) and `comments`. A token, if present, links the user. |
| `POST /api/events` | public | `action` (`project_view`, `qr_scan`, `ar_launch`, `video_play`, `share`) and `projectId`. |
| `GET /api/admin/projects` | 🛡️ | Every project, including drafts and archived ones. |
| `POST /api/projects` | 🛡️ | Creates a project. |
| `PUT /api/projects/:id` | 🛡️ | Updates a project (use `status: "archived"` to retire it). |
| `GET /api/analytics/summary` | 🛡️ | Totals, per-project metrics and activity for the last 14 days. |
| `GET /api/analytics` | 🛡️ | Raw event log (latest 500). |
| `POST /api/notifications/send-notification` | 🛡️ | Sends a push (`token`, `title`, `body`) through Firebase. |

### Project shape

```json
{
  "id": 1,
  "title": "Astronaut (3D model)",
  "description": "A 3D model you can rotate...",
  "type": "model",
  "status": "published",
  "thumbnail_url": "https://.../Astronaut.webp",
  "model_url": "https://.../Astronaut.glb",
  "ios_model_url": "https://.../Astronaut.usdz",
  "video_url": null,
  "page_url": null,
  "avg_rating": 4,
  "feedback_count": 1
}
```

URLs must be `http` or `https`; any other scheme (such as `javascript:`) is rejected.

## Example

```bash
curl -X POST http://localhost:5000/api/feedback \
  -H 'Content-Type: application/json' \
  -d '{"projectId":1,"rating":5,"comments":"Really good!"}'
```

## Errors

| Code | When |
|---|---|
| `400` | Invalid body (missing field, email, short password, rating outside 1 to 5, invalid URL, unknown type). |
| `401` | No token, invalid or expired token, wrong credentials. |
| `403` | Authenticated, but not an admin. |
| `404` | Unknown route, or a project that does not exist or is not published. |
| `409` | An account with that email already exists. |
| `413` | Body larger than 100 KB. |
| `429` | Rate limit: 30 per 15 min on `/api/auth`, 20 per hour on feedback, 300 per 15 min on events. |
| `500` | Internal error; the message is generic. |

---
id: api
title: API
sidebar_position: 3
---

# API

Base: `http://localhost:5000` in development. JSON responses. Routes marked 🔒 require the `Authorization: Bearer <token>` header.

## Routes

| Method and path | Access | Description |
|---|---|---|
| `GET /` | public | Service info and list of routes. |
| `GET /health` | public | Server and database status. |
| `POST /api/auth/register` | public | Creates an account (`name`, `email`, `password` with 8+ characters). |
| `POST /api/auth/login` | public | Returns a JWT `token` and the user data. |
| `GET /api/projects` | public | Projects with AR URLs (`marker_image_url`, `model_3d_url`). |
| `GET /api/projects/:id` | public | One project; records the view (with the user, if a token is sent). |
| `POST /api/feedback` | 🔒 | Sends `projectId`, `rating` (1 to 5) and `comments`. |
| `GET /api/analytics` | 🔒 | Engagement records. |
| `POST /api/notifications/send-notification` | 🔒 | Sends a push (`token`, `title`, `body`). |
| `GET /api/notifications/test-notification` | public | Sample payload. |

## Example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.com","password":"a-long-password"}'
```

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {"id": 1, "email": "ana@example.com", "name": "Ana"}
}
```

## Errors

| Code | When |
|---|---|
| `400` | Invalid body (missing fields, email, short password, rating outside 1 to 5). |
| `401` | No token, invalid or expired token, wrong credentials. |
| `404` | Unknown route or project. |
| `429` | Too many attempts on `/api/auth` (30 per 15 minutes per IP). |
| `500` | Internal error; in production the message is generic. |

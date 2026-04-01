# Backend API Specification for W!ntAi Frontend

What your backend must implement to work with the frontend at www.wintaibot.com.

**Base URL:** `https://api.wintaibot.com` (or `REACT_APP_API_BASE`)

**Auth:** Most endpoints require `Authorization: Bearer <JWT>` header.

---

## 1. Auth

### POST /api/auth/login
**No auth required.**

| Request | |
|---------|--|
| Method | POST |
| Headers | `Content-Type: application/json` |
| Body | `{ "email": "user@example.com", "password": "..." }` |

| Response 200 | `{ "token": "...", "email": "...", "membershipType": "FREE" \| "MEMBER", "userId": 1, "emailVerified": true }` |
| Response 401 | `{ "error": "Invalid email or password" }` |

**Note:** Frontend also accepts `accessToken` instead of `token`. `userId` or `id` used for user id.

---

### GET /api/auth/me
**Requires auth.**

| Request | `Authorization: Bearer <JWT>` |
|---------|-------------------------------|
| Response 200 | `{ "id": 1, "email": "...", "firstName": "...", "lastName": "...", "membershipType": "FREE" \| "MEMBER", "emailVerified": true }` |
| Response 401 | No body (treated as not logged in) |
| Response 404 | No body (backend not available) |

---

### POST /api/auth/register
**No auth required.**

| Request | `{ "email": "...", "password": "...", "name": "...", "firstName": "...", "lastName": "" }` |
| Response 200 | `{ "message": "...", "token": "...", "user": {...} }` (optional token/user) |

---

### POST /api/auth/admin-reset-password
**No auth. Requires `X-Admin-Reset-Key` header matching `ADMIN_RESET_SECRET`.**

| Request | `{ "email": "...", "newPassword": "..." }` |
| Response 200 | `{ "message": "Password reset. You can now log in." }` |
| Response 403 | `{ "error": "Invalid key" }` |

---

## 2. Social (Connect / Status)

### GET /api/social/status
**Requires auth.**

| Response 200 | `{ "connected": ["facebook", "instagram", ...] }` |

---

### GET /api/social/connect/{platform}
**Requires auth.** Platform: `facebook`, `instagram`, `linkedin`, `youtube`, etc.

| Response 200 | `{ "url": "https://..." }` — OAuth URL for popup |
| Response 500 | `{ "error": "..." }` |

---

### DELETE /api/social/disconnect/{platform}
**Requires auth.**

| Response 200 | OK (no body) |

---

## 3. OAuth Callback (no auth)

### GET /api/social/callback/{platform}
Called by OAuth provider (Facebook, etc.) after user approves. Must redirect to:

- Success: `{APP_BASE_URL}?social_connect=success&platform={platform}`
- Error: `{APP_BASE_URL}?social_connect=error&platform={platform}&error={message}`

---

## 4. Video Content (Video Publisher)

### POST /api/video-content/upload
**Requires auth.** `multipart/form-data`: `file` (required), optional `prompt`.

| Response 200 | `{ "id": "...", "videoId": "..." }` |
| Response 500 | `{ "error": "..." }` |

---

### GET /api/video-content/videos/{id}
**Requires auth.**

| Response 200 | `{ "id": "...", "variants": [{ "platform": "instagram", "caption": "...", "hashtags": "...", "id": "..." }] }` |

---

### POST /api/video-content/publish/{platform}
**Requires auth.** `multipart/form-data`: `file`, `caption`, `hashtags`.

Platform: `instagram`, `facebook`, `youtube`, etc.

| Response 200 | `{ "status": "ok", "platform": "..." }` |
| Response 401 | `{ "error": "...", "requiresConnect": true }` — frontend shows "reconnect" |
| Response 401 body `{"error":"Unauthorized"}` | Frontend treats as session expired |

---

### POST /api/video-content/publish/{platform}/variant
**Requires auth.** JSON body: `{ "variantId": "...", "caption": "...", "hashtags": "..." }`

| Response 200 | `{ "status": "ok", "platform": "..." }` |
| Response 401 | Same as above |

---

### POST /api/video-content/variants/{id}/schedule
**Requires auth.** JSON: `{ "platform": "instagram", "scheduledAt": "2026-03-25T18:00:00.000Z" }`

| Response 200 | `{ "status": "scheduled" }` or similar |

---

### GET /api/video-content/trends
**Requires auth.** Returns `{ "trends": [...], "news": [...] }` (optional).

---

### GET /api/video-content/analytics
**Requires auth.** Returns `{ "views": ..., "likes": ..., "comments": ... }` (optional).

---

### GET /api/video-content/analytics/insights
**Requires auth.** Returns insights (optional).

---

## 5. AI (optional)

| Endpoint | Purpose |
|----------|---------|
| GET /api/ai/ask-ai?prompt=... | Chat/AI response |
| POST /api/ai/analyze-pdf | PDF analysis |
| POST /api/ai/transcribe | Audio transcription |
| GET /api/ai/generate-image?prompt=... | Image generation |
| POST /api/ai/prepare-interview | Interview prep |
| POST /api/ai/reply | Content reply |
| POST /api/ai/reply | Content generation |

---

## 6. Subscription (optional)

| Endpoint | Purpose |
|----------|---------|
| POST /api/subscription/checkout | Create Stripe checkout |
| GET /api/subscription/portal | Billing portal URL |
| POST /api/subscription/verify-session?session_id=... | Verify Stripe session |
| POST /api/subscription/cancel | Cancel at period end |
| POST /api/subscription/reactivate | Undo cancel |

---

## 7. JWT Requirements

- **Header:** `Authorization: Bearer <token>`
- **Token format:** Must support both:
  - `sub` = userId (numeric string)
  - `sub` = email + `userId` claim (number)
- **Principal:** Controllers expect `auth.getPrincipal()` to be `Long userId`.
- **Validation:** Use same `JWT_SECRET` for signing and validation.

---

## 8. CORS

- Allow origin: `https://www.wintaibot.com`
- Allow headers: `Authorization`, `Content-Type`
- Allow methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## 9. Error Response Format

- **401:** `{ "error": "Unauthorized" }` or `{ "error": "...", "requiresConnect": true }`
- **400:** `{ "error": "..." }`
- **500:** `{ "error": "..." }`

---

## 10. Minimum Required for Video Publisher + Login

| Endpoint | Required |
|----------|----------|
| POST /api/auth/login | ✅ |
| GET /api/auth/me | ✅ |
| POST /api/auth/register | ✅ |
| GET /api/social/status | ✅ |
| GET /api/social/connect/{platform} | ✅ |
| GET /api/social/callback/{platform} | ✅ |
| DELETE /api/social/disconnect/{platform} | ✅ |
| POST /api/video-content/upload | ✅ |
| GET /api/video-content/videos/{id} | ✅ |
| POST /api/video-content/publish/{platform} | ✅ |
| POST /api/video-content/publish/{platform}/variant | ✅ |
| POST /api/video-content/variants/{id}/schedule | ✅ |

# Video Publisher — Full Pipeline Architecture

## Overview

```
USER UPLOADS VIDEO
        ↓
[1] AI PROCESSING PIPELINE
        ↓
[2] CONTENT GENERATION (10 variants)
        ↓
[3] APPROVAL WORKFLOW (Role-based)
        ↓
[4] PUBLISH via APIs
        ↓
[5] ANALYTICS LOOP (AI Performance Engine)
        ↓
[6] AI REPORT TO USER
```

---

## [1] AI Processing Pipeline

| Step | Description | Backend / Tech |
|------|-------------|----------------|
| Transcribe audio | Speech → text | **Whisper** (you have this in backend) |
| Extract key moments | Scene detection, timestamps | FFmpeg + optional vision/CLIP or heuristics |
| Generate captions | Timed subtitles (.srt) | Whisper timestamps or GPT + timestamps |
| Generate hashtags | From transcript + topic | **GPT** (OpenAI) |
| Resize/clip video | Per-platform specs | **FFmpeg** (aspect ratio, duration, crop) |

**Backend endpoints (your backend):**

- `POST /api/video-content/upload` — accept video file; save to S3, transcribe (Whisper), generate SRT, generate 10 platform variants (GPT), store Video + VideoVariants; return `{ id: videoId, variants?: [...] }`.
- `GET /api/video-content/videos/{id}` — return video + variants (if upload returns only id).

---

## [2] Content Generation (10 Variants)

| Platform | Output | Specs |
|----------|--------|--------|
| **YouTube** | Full video + description + tags | 16:9, no time limit |
| **YouTube Shorts** | 60s clip + vertical crop | 9:16, ≤60s |
| **Instagram Post** | Square clip + caption + hashtags | 1:1, caption ≤2200 |
| **Instagram Reel** | Vertical 30s clip | 9:16, ≤90s |
| **TikTok** | 15–60s vertical + trending hashtags | 9:16, ≤60s |
| **LinkedIn** | Horizontal clip + professional caption | 16:9, ≤10 min |
| **Facebook** | Full video + long caption | 16:9 |
| **X (Twitter)** | 2 min clip + short punchy caption | 16:9, ≤2:20, caption ≤280 |
| **Threads** | Text post from transcript summary | Text only |
| **Pinterest** | Thumbnail image + description | 2:3 image |

**Frontend:** `VideoPublisher.js` — calls `POST /api/video-content/upload`, then `GET /api/video-content/videos/{id}` if needed; shows variants with status DRAFT.  
**Backend:** Returns variants (id, platform, caption, hashtags, status).

---

## [3] Approval Workflow (Role-based)

| Role | Responsibility |
|------|----------------|
| **Creator** | Uploads video, sees AI drafts, edits captions/hashtags, submits for review |
| **Manager** | Reviews/edits/approves each platform post |
| **Buffer** | Schedules and publishes approved posts |

**Frontend:** Creator → “Submit for review” (`POST /api/video-content/variants/{id}/submit`). Manager → Approve/Reject (`POST .../variants/{id}/approve`, `.../reject`). Buffer → “Publish approved (now)” or schedule (`POST .../variants/{id}/schedule` with `scheduledAt`).  
**Backend:** Store status DRAFT → PENDING_REVIEW → APPROVED/REJECTED → PUBLISHED.

---

## [4] Publish via APIs

| Platform | API | Auth |
|----------|-----|------|
| YouTube | **YouTube Data API v3** | OAuth 2.0 (Google) |
| Instagram | **Instagram Graph API** (Meta) | Facebook Login + Page/IG Business |
| TikTok | **TikTok Content Posting API** | OAuth 2.0 |
| LinkedIn | **LinkedIn Videos API** | OAuth 2.0 |
| Facebook | **Facebook Graph API** | Facebook Login |
| X (Twitter) | **X API v2** (Upload + Tweet) | OAuth 2.0 |
| Threads | Meta Graph API (Threads) | Meta OAuth |
| Pinterest | **Pinterest API** | OAuth 2.0 |

**Backend:**

- **Connect accounts:** `GET /api/video/connect/:platform` → redirect to platform OAuth; callback stores tokens (per user).
- **Publish:** `POST /api/video/publish/:platform` — use stored token + upload video/post (and caption/hashtags) to that platform.
- **Schedule (per video, per platform):** User picks date/time per platform (e.g. Video A: YouTube tomorrow 4 AM, Instagram 6 PM; Video B: next week 2 AM). `POST /api/video-content/variants/{id}/schedule` with `scheduledAt`; queue (DB + cron or Redis) runs publish at that time.

**Frontend:** “Connect your accounts” (YouTube, Instagram, etc.) already in Video Publisher; publish triggers `POST /api/video/publish/:platform`.

---

## [5] Analytics Loop (AI Performance Engine)

| Task | Frequency | Implementation |
|------|-----------|----------------|
| Pull metrics | Every 24h (cron) | Per-platform APIs (views, likes, shares, comments) |
| Engagement rate | Per post / per platform | `(likes + comments + shares) / views` (or platform formula) |
| Detect viral patterns | On new metrics | Heuristics: e.g. high engagement in &lt;48h |
| Compare formats | Aggregate | Short vs long, aspect ratio, time of day |
| Feed to GPT | For recommendations | Send summary → GPT → structured recommendations |

**Backend:**

- Store: `post_id`, `platform`, `views`, `likes`, `comments`, `shares`, `engagement_rate`, `fetched_at`.
- Cron: fetch from YouTube Analytics, Instagram Insights, TikTok Analytics, etc. (per connected account).
- Service: “AI Performance Engine” — aggregate metrics, run rules or GPT, save recommendations.

---

## [5b] Viral trends and news (for the user)

- Show **lately viral trends** (hashtags, formats, topics) and **short news** (algorithm updates, trending topics) so users can decide what to post and when.
- **Backend:** `GET /api/video-content/trends` (or include in insights) returning `{ trends: [...], news: [...] }` from platform APIs, RSS, or AI-summarized sources.
- **Frontend:** Section "Viral trends and news" on the Video Publisher page (e.g. sidebar or top).

---

## [6] AI Report to User

**Examples:**

- “Your 15s clips get 4x more views than 60s clips.”
- “Best posting time: Tuesday 7PM for LinkedIn.”
- “Trending topic detected: #AITools → Create content now.”
- Next content ideas generated automatically.

**Frontend:** Already in `VideoPublisher.js` — “AI Performance Insights” and “Next Content Ideas (AI Generated)” on the analytics step.  
**Backend:** `GET /api/video-content/analytics` (metrics), `GET /api/video-content/analytics/insights` (AI recommendations).  
**Frontend:** Fetches both when entering analytics step; displays metrics + insights + next ideas.

- Summary text (or structured bullets).
- Next content ideas (array of strings or structured objects).

Engine (step 5) can write this to DB; API reads and returns it.

---

## Implementation Checklist

| # | Component | Status | Notes |
|---|------------|--------|--------|
| 1 | Frontend: Upload, platforms, roles, approve, publish UI | ✅ | `VideoPublisher.js` |
| 2 | Frontend: Connect accounts (YouTube, Instagram, …) | ✅ | Connect section in Video Publisher |
| 3 | Backend: `POST /api/video/process` | 🔲 | Whisper + GPT hashtags + clip metadata |
| 4 | Backend: FFmpeg resize/clip per platform | 🔲 | Optional; can start with single file |
| 5 | Backend: OAuth connect + token storage | 🔲 | `/api/video/connect/:platform` + callback |
| 6 | Backend: `POST /api/video/publish/:platform` | 🔲 | Call platform APIs with stored tokens |
| 7 | Backend: Schedule queue (cron) | 🔲 | For “schedule & publish” |
| 8 | Backend: Analytics cron (pull metrics) | 🔲 | Per-platform APIs |
| 9 | Backend: AI Performance Engine | 🔲 | Aggregate + GPT recommendations |
| 10 | Backend: `GET /api/video/insights` or report | 🔲 | Serve insights + next ideas to frontend |

---

## File / Service Mapping (Suggested)

- **Frontend:** `src/components/VideoPublisher.js` — upload, connect, variants, approval, analytics UI.
- **Backend (Spring):**
  - `VideoProcessController` — upload, process, variants.
  - `VideoConnectController` — OAuth connect/callback per platform.
  - `VideoPublishController` — publish to platform, optional schedule.
  - `VideoAnalyticsService` — fetch metrics, compute engagement.
  - `VideoInsightsService` — run AI engine, generate report and next ideas.
  - `VideoInsightsController` — expose report/insights to frontend.

This doc can stay as the single source of truth for the full pipeline and be updated as each piece is implemented.

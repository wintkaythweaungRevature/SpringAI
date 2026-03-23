# Video Publisher — Logic (flow & rules)

## 1. Access

- User must be **logged in**.
- Video Publisher is behind **MemberGate**: only users with **MEMBER** subscription can open it.
- If not member → show upgrade prompt.

---

## 2. Step-by-step flow

### Step 1: Upload

**User:**
- Chooses role: **Creator** | **Manager** | **Buffer**.
- Selects platforms (YouTube, Instagram, TikTok, …).
- Uploads one video file.
- Clicks **“Generate Content”**.

**Frontend:**
- `POST /api/video-content/upload` with `file` (video).
- Backend returns `{ id: videoId, variants?: [...] }`.
- If no `variants` in response → `GET /api/video-content/videos/{videoId}` to load variants.
- Map each variant to: `id`, `platform`, `caption`, `hashtags`, `clipNote`, `status`.
- If request fails → show error and use **local placeholders** (mock captions/hashtags) so user can still go through the flow.
- Go to **Review** step and show all variants (from backend or placeholders).

**Backend (your side):**
- Save video (e.g. S3).
- Transcribe (Whisper), generate SRT, generate 10 platform variants (GPT).
- Save Video + VideoVariants (status = DRAFT).
- Return video id and optionally variants.

---

### Step 2: Review (see AI drafts)

**User:**
- Sees one row per platform variant (caption, hashtags, clip note, status).
- Can switch between platforms (tabs/list on the left).
- Can **edit** caption and hashtags in the form on the right.

**Frontend:**
- List = all keys in `variants` (from backend or from selected platforms if placeholders).
- Active variant = one selected; form shows its caption/hashtags.
- Edits update only **local state** until user does Submit / Approve / Publish (then backend is called).

**No backend call** in this step except when Creator clicks “Submit for review” or Manager/Buffer acts.

---

### Step 3: Creator — Submit for review

**User (Creator):**
- After editing, clicks **“Submit for review”** (for current or selected variants).

**Frontend:**
- For the variant(s) to submit: `POST /api/video-content/variants/{variantId}/submit`.
- Backend sets status = **PENDING_REVIEW**.
- Frontend updates local status to `pending_review` so UI shows “waiting for manager”.

**Rule:** Only variants with a backend `id` can be submitted (no submit for placeholder-only flow).

---

### Step 4: Manager — Approve or reject

**User (Manager):**
- Sees variants in PENDING_REVIEW (or any status).
- Clicks **Approve** or **Reject** per variant.

**Frontend:**
- Approve → `POST /api/video-content/variants/{id}/approve` (backend sets APPROVED).
- Reject → `POST /api/video-content/variants/{id}/reject` (backend sets REJECTED).
- Update local state so badges (Approved/Rejected) and counts are correct.

**Rule:** Only **approved** variants can be published (next step).

---

### Step 5: Buffer — Publish (or schedule)

**Option A — Publish now**

**User (Buffer):**
- Clicks **“Publish approved (now)”**.

**Frontend:**
- Collect all variants with status = **approved**.
- For each: `POST /api/video-content/publish/{platform}` with `FormData(file, caption, hashtags)`.
- Backend uses stored OAuth + VideoPublishService and publishes to the platform.
- Frontend tracks which platforms returned success and moves to **Analytics** step.

**Option B — Schedule per platform (per video)**

**Logic (backend):**
- **User (Buffer):** For each variant (platform) choose **Publish now** or **Schedule** with date and time (e.g. Video A: YouTube tomorrow 4:00 AM, Instagram 6:00 PM; Video B: next week 2:00 AM).
- For each variant to schedule: `POST /api/video-content/variants/{id}/schedule` with `{ platform, scheduledAt }` (ISO).
- Backend creates a PublishJob (SCHEDULED) per variant; cron runs every minute and publishes when `scheduledAt <= now`.
- **Frontend:** Add date/time picker per platform; call `schedule` for scheduled variants and `publish` for Publish now.

---

### Step 6: Viral trends and news (optional)

**User:** Sees a section **Viral trends and news** with lately viral trends (hashtags, formats, topics), short news or algorithm updates, and tips to decide what/when to post.

**Frontend:** `GET /api/video-content/trends` (or include in insights). Show trends and news on the Video Publisher page (e.g. sidebar or top).

**Backend:** Return `{ trends: [...], news: [...] }` from platform APIs, RSS, or AI-summarized sources.

---

### Step 7: Analytics

**User:**
- Sees which platforms were published (“✓ Live”).
- Sees **metrics** (views, likes, comments, shares, engagement).
- Sees **AI insights** (e.g. “Short clips perform 4x better”, “Best time: Tuesday 7PM”).
- Sees **next content ideas** (AI-generated).
- Can click **“+ New Video”** to go back to Upload and clear state.

**Frontend:**
- On entering Analytics step:  
  - `GET /api/video-content/analytics` → total/platform metrics.  
  - `GET /api/video-content/analytics/insights` → recommendations + next ideas.
- If backend is missing or fails → show **default** numbers and copy so the screen still works.

---

## 3. Connect accounts (sidebar on Upload step)

**User:**
- Sees list: YouTube, Instagram, TikTok, LinkedIn, Facebook, X.
- Clicks **Connect** → popup opens. After OAuth, closes popup.
- Clicks **Refresh** to update list from backend.

**Frontend:**
- On load: `GET /api/social/status` (JWT in header) → response `{ "connected": ["youtube", "instagram", ...] }` → set which platforms are connected.
- Connect: `GET /api/social/connect/{platform}` (JWT in header) → backend returns `{ "url": "<OAuth URL>" }` → frontend opens that URL in popup; on popup close, call **status** again to refresh.
- Disconnect: `DELETE /api/social/disconnect/{platform}` (JWT in header) → then refresh status.
- Connected = can publish to that platform (backend uses stored token).

---

## 4. Role summary (logic)

| Role     | Can do |
|----------|--------|
| Creator  | Upload, see drafts, edit caption/hashtags, **submit for review**. |
| Manager  | See drafts, **approve** or **reject** variants. |
| Buffer   | See approved only, **publish now** (or later: schedule). |
| (Admin)  | All of the above (your backend can treat as Creator+Manager+Buffer). |

**UI rules:**
- “Submit for review” → only for Creator; only when variant has backend `id`.
- “Approve” / “Reject” → only for Manager (and Buffer if you allow).
- “Publish approved (now)” → only for Manager/Buffer; only when at least one variant is approved.

---

## 5. Data flow (one pass)

```
Login (MEMBER) → Upload video
    → Backend: save video, transcribe, create 10 variants (DRAFT)
    → Frontend: GET video + variants, show in Review

Creator: edit → Submit for review
    → Backend: variant status = PENDING_REVIEW

Manager: Approve / Reject
    → Backend: variant status = APPROVED | REJECTED

Buffer: Publish approved (now)
    → Frontend: POST /publish/{platform} per approved variant
    → Backend: use OAuth + platform API, mark PUBLISHED
    → Frontend: go to Analytics

Analytics: GET /analytics + GET /analytics/insights
    → Show metrics + AI report + next ideas

New Video → clear state, back to Upload.
```

---

## 6. Error handling (logic)

- **Upload fails:** Show error message, keep placeholders so user can still see the flow (optional: retry upload).
- **Submit/Approve/Reject fails:** Optionally show toast; keep local state in sync if backend call fails (e.g. still show “Approved” if that was the intent).
- **Publish fails for one platform:** Continue for other platforms; show which succeeded (e.g. “✓ Live” only for success).
- **Analytics/insights fail:** Show default metrics and default insight text so the Analytics step is always usable.

---

## 7. API list (for your backend)

| Method | Path | Purpose |
|--------|------|--------|
| POST | `/api/video-content/upload` | Upload video; return id (+ optional variants). |
| GET  | `/api/video-content/videos/{id}` | Get video + variants. |
| POST | `/api/video-content/variants/{id}/submit` | Creator submit → PENDING_REVIEW. |
| POST | `/api/video-content/variants/{id}/approve` | Manager approve → APPROVED. |
| POST | `/api/video-content/variants/{id}/reject` | Manager reject → REJECTED. |
| POST | `/api/video-content/variants/{id}/schedule` | Schedule this variant (body: platform, scheduledAt ISO). Per-platform, per-video. |
| GET  | `/api/video-content/trends` | Optional: viral trends + news for the user (what's trending, algorithm updates). |
| POST | `/api/video-content/publish/{platform}` | Publish now (body: file, caption, hashtags). |
| GET  | `/api/social/status` | List connected platforms (JWT in header). Response: `{ "connected": ["youtube", ...] }`. |
| GET  | `/api/social/connect/{platform}` | Get OAuth URL (JWT in header). Response: `{ "url": "..." }`. Frontend opens URL in popup. |
| DELETE | `/api/social/disconnect/{platform}` | Disconnect platform (JWT in header). |
| GET  | `/api/video-content/analytics` | Metrics (views, likes, …). |
| GET  | `/api/video-content/analytics/insights` | AI recommendations + next ideas. |

This is the logic the frontend follows; you can implement the backend to match it.

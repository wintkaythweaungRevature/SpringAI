# Delete workflow (24-hour window)

This document describes a **standard pattern**: after a delete is requested or an object is marked for removal, **wait 24 hours**, then **permanently remove** data (and backups/object storage where applicable). Use it for account deletion, media purge, or “undo” windows.

**Note:** This repo does not currently ship a scheduled job that deletes user data automatically after 24 hours. Email verification links are advertised as expiring in 24 hours (`EmailService.sendVerificationEmail`). JWT lifetime is configured separately (`jwt.expiration-ms` in `application.properties`). This file is the **intended workflow** to implement or operate against.

---

## 1. Goals

- Give users a **short undo / support** window before irreversible loss.
- Ensure **object storage** (S3, etc.) and **database** rows are removed consistently.
- Leave an **audit trail** (who/when/what) without retaining the deleted payload.

---

## 2. Triggers (examples)

| Trigger | Typical `T+0` action |
|--------|------------------------|
| User requests **account deletion** | Mark account `pending_deletion_at = now + 24h`, notify user |
| User deletes **uploaded file / draft** | Mark row `deleted_at = now`, set `purge_after = now + 24h` |
| Admin **purge** ticket | Same as above with admin id in audit log |
| **Legal / abuse** takedown | May skip or shorten window per policy; document exception |

---

## 3. Timeline

| Time | What happens |
|------|----------------|
| **T+0** | Request recorded. User-facing state: “Deletion scheduled” or item hidden from UI (soft delete). No permanent wipe yet. |
| **T+0 → T+24h** | User may **cancel** deletion (if product supports it). Support can **abort** pending purge. Dependencies (Stripe, OAuth tokens) handled per product rules. |
| **T+24h** | **Purge job** runs: delete DB rows or anonymize; delete blobs in storage; invalidate caches; revoke sessions if account-scoped. |
| **After purge** | Append-only **audit log** entry: subject id, type, completed_at (no content). |

---

## 4. Implementation checklist (backend)

1. **Schema**  
   - Columns such as `pending_deletion_at`, `purge_after`, or `deleted_at` + batch job query `purge_after <= now()`.

2. **API**  
   - `POST .../delete-request` → sets timestamps, returns confirmation.  
   - Optional `POST .../cancel-deletion` before deadline.

3. **Scheduler**  
   - Cron / Spring `@Scheduled` / queue worker: every 15–60 minutes, select rows due for purge, process idempotently.

4. **Order of operations** (per user or per asset)  
   - Stop new writes for that subject.  
   - Delete **external** objects first (S3 keys, CDN) or use lifecycle rules aligned with DB delete.  
   - Delete **database** records or replace PII with irreversible placeholders if you must keep aggregates.  
   - Clear **sessions** / JWT blocklist if needed.

5. **Failure handling**  
   - Retry with backoff; alert if blob delete fails after DB delete (or vice versa)—define **compensation** (re-queue, manual ops runbook).

6. **Frontend**  
   - Show countdown or “Completes within 24 hours”; hide deleted content immediately if soft-deleted.

---

## 5. Related behavior already in this codebase

- **Email verification:** copy states the link expires in **24 hours** (`backend` → `EmailService`). Token invalidation should match that TTL in auth logic.  
- **Password reset:** **1 hour** expiry (same service).  
- **Account deactivation:** immediate flag in `AuthService.deactivate` (not a 24h delayed delete).

---

## 6. Operations runbook (short)

1. Confirm purge job is enabled in production and logs to your monitoring.  
2. On incident: identify `user_id` or asset id; check `pending_deletion_at` / `purge_after`.  
3. To **cancel** before T+24h: clear pending flags and restore visibility flags; document in ticket.  
4. After T+24h: verify S3 prefix empty / DB row gone; spot-check audit log.

---

## 7. Privacy / policy alignment

If you promise “deleted within X hours/days,” this workflow should match **Privacy Policy** and support replies. Update `PrivacyPolicy` (and any FAQ) if you adopt a **24-hour deletion completion** commitment for account or media data.

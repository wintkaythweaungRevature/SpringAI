# Facebook & Instagram API Setup

This guide explains how to set up the **Meta (Facebook) Graph API** for publishing videos to Facebook Pages and Instagram from Wintaibot.

---

## 1. Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com) and log in.
2. Click **My Apps** → **Create App** → **Other** → **Business**.
3. Name it (e.g. "Wintaibot") and create the app.

---

## 2. Add Products

1. In the app dashboard, go to **Add Products**.
2. Add **Facebook Login** (for OAuth).
3. Add **Instagram Graph API** (for Reels).
4. Add **Marketing API** (for Pages).

---

## 3. Configure Facebook Login (required for Connect to work)

1. Go to [developers.facebook.com](https://developers.facebook.com) → your app → **Facebook Login** → **Settings**.
2. Under **Valid OAuth Redirect URIs**, add these **exact** URLs (one per line):
   ```
   https://api.wintaibot.com/api/social/callback/facebook
   https://api.wintaibot.com/api/social/callback/instagram
   http://localhost:8080/api/social/callback/facebook
   http://localhost:8080/api/social/callback/instagram
   ```
3. Under **Client OAuth Settings**, enable:
   - **Client OAuth Login**: ON
   - **Web OAuth Login**: ON
4. Under **Settings** → **Basic**, add to **App Domains**:
   - `wintaibot.com`
   - `api.wintaibot.com`
5. **Save Changes**.

---

## 4. Request Permissions

In **App Review** → **Permissions and Features**, request:

| Permission | Purpose |
|------------|---------|
| `pages_manage_posts` | Publish to Facebook Pages |
| `pages_read_engagement` | Read Page info |
| `pages_show_list` | List user's Pages |
| `instagram_basic` | Access Instagram Business account |
| `instagram_content_publish` | Publish Reels to Instagram |

---

## 5. Get Credentials

1. **App ID** and **App Secret**: **Settings** → **Basic**.
2. **Long-lived Page token** (for server-side publishing):
   - Use [Graph API Explorer](https://developers.facebook.com/tools/explorer/) to get a User token.
   - Exchange for a long-lived token.
   - Use `GET /me/accounts` to list Pages, then get a Page token with `pages_manage_posts`.

---

## 6. Environment Variables

Add to your backend `.env` or `backend.env` (on EC2):

```bash
# Backend API base URL - full absolute URL for OAuth callback (RFC 3986).
# Local:  APP_API_BASE_URL=http://localhost:8080
# Prod:   APP_API_BASE_URL=https://api.wintaibot.com
APP_API_BASE_URL=https://api.wintaibot.com

# Frontend URL - where users land after OAuth (MUST be production in prod, not localhost).
APP_FRONTEND_URL=https://wintaibot.com

# Facebook App (from Meta Developer Console)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# Long-lived Page token (for publishing - same token works for Facebook + Instagram)
FACEBOOK_ACCESS_TOKEN=your_long_lived_page_token

# Instagram Business Account ID (from Graph API: GET /me/accounts?fields=instagram_business_account)
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_business_id
```

---

## 7. Get Instagram Business Account ID

1. In Graph API Explorer, use your Page token.
2. Call: `GET /me/accounts?fields=id,name,instagram_business_account`
3. Copy the `instagram_business_account.id` value.

---

## 8. OAuth Flow (Connect Button)

**Important:** Use the **Connect** button in the Video Publisher or Connected Accounts page. Do NOT paste the OAuth URL manually in the browser — the flow requires a `state` parameter that ties the callback to your session.

The backend now implements:

1. **Connect** → Returns Facebook OAuth URL with `state` (session binding).
2. **Callback** → Exchanges `code` for access token, gets long-lived token, gets Page token.
3. **Storage** → Stores tokens per user in memory (use DB for production).
4. Connects both **Facebook** and **Instagram** in one flow (same token).

---

## 9. Publishing via Graph API

**Facebook Page video:**
```
POST /{page-id}/videos
  ?access_token={page_token}
  source: video file (multipart)
  description: caption
```

**Instagram Reel:**
```
POST /{ig-user-id}/media
  ?access_token={page_token}
  media_type=REELS
  video_url={uploaded_video_url}
  caption={caption}
```

---

## 10. Webhook Verification

For Meta webhooks (Instagram, etc.), use the **same callback URL** and add a verify token:

- **Callback URL:** `https://api.wintaibot.com/api/social/callback/instagram`
- **Verify token:** Any secret string you choose (e.g. `U9MbEhZASU13YWJ4...`)

Set `FACEBOOK_VERIFY_TOKEN` in backend.env to **exactly** match the verify token you enter in Meta. When Meta sends a GET to validate, the backend checks the token and returns the challenge.

## 11. Common Errors

| Error | Fix |
|-------|-----|
| **URL Blocked** / **redirect URI not whitelisted** | Add `https://api.wintaibot.com/api/social/callback/facebook` and `https://api.wintaibot.com/api/social/callback/instagram` to **Valid OAuth Redirect URIs** in Facebook Login → Settings. Enable Client OAuth Login and Web OAuth Login. Add `api.wintaibot.com` to App Domains. |
| **Token expired** | Reconnect in Connected Accounts; get a new long-lived token. |
| **No Facebook pages found** | User must create a Facebook Page at [facebook.com/pages](https://www.facebook.com/pages) and connect it. |
| **Instagram requires Business account** | Convert Instagram to Business/Creator and link to a Facebook Page. |

---

## Quick Reference

- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [Instagram Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

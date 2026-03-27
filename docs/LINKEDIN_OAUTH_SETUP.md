# LinkedIn OAuth (Connect)

This guide configures **Sign in with LinkedIn** and the scopes needed so users can connect LinkedIn from Video Publisher. The app already implements `GET /api/social/connect/linkedin` and `GET /api/social/callback/linkedin`; you only need a LinkedIn app and environment variables on the API server.

---

## 1. Create a LinkedIn Developer App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps) and sign in.
2. Click **Create app** and fill in name, LinkedIn Page, logo, and legal agreement.
3. Open your app → **Auth** tab.

---

## 2. Verify company (LinkedIn Page)

Some products and reviews require LinkedIn to confirm the app belongs to your organization. LinkedIn issues a **one-time verification URL** (shape: `https://www.linkedin.com/developers/apps/verification/<uuid>`).

- That link is **not** something you host on `wintaibot.com` like a TikTok meta tag. It opens inside LinkedIn’s developer flow.
- **Send the link to a [super admin](https://www.linkedin.com/help/linkedin/answer/a1665329) of the LinkedIn Page** tied to the app. They open it and approve the association (often within 30 days).
- If you regenerate verification, old links can stop working.

**Where to find or generate the link (LinkedIn UI):**

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps) → **My apps** → open your app.
2. Open the **Settings** tab → click **Verify** (in the “Verify company” flow).
3. In the dialog, click **Generate URL** → **Copy URL**. (Official steps: [Send an app verification request](https://www.linkedin.com/help/linkedin/answer/a1665329).)
4. Alternatively, on the app overview, the **LinkedIn Page** card may show a **Verify** button—use the same **Generate URL** / **Copy URL** steps there if shown.

Keep your current verification link in a password manager or team doc; do not commit secrets or per-app UUIDs to the repo unless your team explicitly wants that.

---

## 3. Authorized redirect URLs (must match exactly)

Add these under **OAuth 2.0 settings** → **Authorized redirect URLs for your app**:

```
https://api.wintaibot.com/api/social/callback/linkedin
http://localhost:8080/api/social/callback/linkedin
```

The production URL must match what the backend uses when building the OAuth `redirect_uri`. That value comes from `APP_API_BASE_URL` plus `/api/social/callback/linkedin` (see `SocialController`). If your API hostname differs, substitute it in both the LinkedIn portal and `APP_API_BASE_URL`.

---

## 4. Products and scopes

1. In the app, open the **Products** tab and request access to what LinkedIn currently offers for your use case, typically:
   - **Sign In with LinkedIn using OpenID Connect** — for `openid`, `profile`, `email`.
   - **Share on LinkedIn** (or the current equivalent for member posting) — for `w_member_social` (UGC / posting).

2. Default scopes in this project (override with `LINKEDIN_SCOPE` if needed):

   `openid profile email w_member_social`

If LinkedIn rejects a scope, remove or replace it per [LinkedIn OAuth documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication) and update `LINKEDIN_SCOPE` on the server.

---

## 5. Credentials

On **Auth** → **Application credentials**, copy:

- **Client ID** → `LINKEDIN_CLIENT_ID`
- **Primary Client Secret** → `LINKEDIN_CLIENT_SECRET`

---

## 6. Environment variables (backend)

Add to `backend.env` on the server or your secrets manager (see `backend/env.example`):

```bash
# Must match the public API URL used for OAuth (no trailing slash).
APP_API_BASE_URL=https://api.wintaibot.com

# Where users land after OAuth (your SPA origin). Use the same host you use in the browser (e.g. www vs apex).
APP_FRONTEND_URL=https://www.wintaibot.com

LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Optional — defaults to: openid profile email w_member_social
# LINKEDIN_SCOPE=openid profile email w_member_social
```

Restart the API after changing variables.

---

## 7. Verify the flow

1. Log in to the app, open **Video Publisher**, click **Connect** on LinkedIn.
2. Approve on LinkedIn; you should be redirected to  
   `{APP_FRONTEND_URL}?social_connect=success&platform=linkedin`.
3. Connections should show LinkedIn as connected after refresh.

If you see **LinkedIn OAuth not configured**, the API does not have `LINKEDIN_CLIENT_ID` (and secret) set. If you see **redirect_uri mismatch**, the URL in the LinkedIn portal does not match `APP_API_BASE_URL` + `/api/social/callback/linkedin`.

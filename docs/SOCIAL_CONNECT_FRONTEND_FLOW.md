# Social Connect Frontend Flow

OAuth flow for connecting social platforms (LinkedIn, Instagram, Facebook, etc.) from the Video Publisher.

## Correct Flow (fix "popup shows wintaibot.com, Connect does nothing")

1. **User clicks "Connect"** in the main window (where they are logged in).
2. **Main window** calls `GET /api/social/connect/{platform}` with Bearer token.
3. **Backend returns** `{ "url": "https://www.linkedin.com/oauth/v2/authorization?..." }`.
4. **Main window** opens the popup **directly with that URL** (do NOT open to frontend first):
   ```javascript
   const { url } = await res.json();
   const popup = window.open(url, 'social-connect', 'width=600,height=700');
   ```
5. User signs in on **LinkedIn** (in the popup). LinkedIn redirects to backend callback.
6. Backend exchanges code, redirects popup to frontend: `?social_connect=success&platform=linkedin`.
7. **Popup** (your frontend with query params): `postMessage` to opener, then `window.close()`.
8. **Main window**: On `SOCIAL_CONNECT_DONE` message, refresh connected platforms.

## What NOT to do

- Do **not** open the popup to your own site first (e.g. `about:blank` then navigate). Open directly to the provider URL.
- Do **not** have the popup call `/api/social/connect` itself—the popup often has no auth context.

## Implementation

### Connect (from main window)

```javascript
const res = await fetch(`/api/social/connect/${platformId}`, { headers: authHeaders() });
if (!res.ok) {
  const err = await res.json().catch(() => ({}));
  setError(err.message || 'Could not start connect. Please log in.');
  return;
}
const { url } = await res.json();
const popup = window.open(url, 'social-connect', 'width=600,height=700');
```

### Callback (in popup)

```javascript
if (window.opener && social_connect === 'success' && platform) {
  window.opener.postMessage({ type: 'SOCIAL_CONNECT_DONE', platform }, origin);
  window.close();
}
```

### Opener (main window)

```javascript
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  if (e.data?.type === 'SOCIAL_CONNECT_DONE') {
    fetchConnectedPlatforms();
  }
});
```

## Supported Platforms

- LinkedIn (real OAuth with `client_id`)
- Instagram, Facebook, TikTok, YouTube (callback URL stub; configure OAuth per platform)

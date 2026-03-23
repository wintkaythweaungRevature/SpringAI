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

## Popup callback: spec and implementation

The backend redirects with `?social_connect=error&platform=...` (or `success`) when the OAuth callback fails or succeeds. The frontend must handle these params so the popup closes and the user sees a clear message.

### Success (`?social_connect=success&platform=linkedin`)
- `postMessage` to opener, then `window.close()`.
- Show "Closing..." only (no full app).

### Error (`?social_connect=error&platform=linkedin`)
- Show red banner with message, "Closing in a few seconds...", then `window.close()` after 4 seconds.
- LinkedIn message: "LinkedIn didn't connect. If the popup showed an error or blank page, it may be a temporary LinkedIn issue. Try again in a few minutes."
- Other platforms: "{Platform} connection failed. Try again later."

### Copy-paste implementation

At top of root component (App.js), before rendering the rest of the app:

```javascript
const params = new URLSearchParams(window.location.search);
const socialConnect = params.get('social_connect');
const platform = params.get('platform');
const isPopup = !!window.opener;

const errorMessage =
  platform === 'linkedin'
    ? "LinkedIn didn't connect. If the popup showed an error or blank page, it may be a temporary LinkedIn issue. Try again in a few minutes."
    : `${platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : ''} connection failed. Try again later.`;

if (socialConnect && platform && isPopup) {
  if (socialConnect === 'success') {
    try {
      window.opener.postMessage({ type: 'SOCIAL_CONNECT_DONE', platform }, window.location.origin);
    } catch (_) {}
    window.close();
    return <div style={{ padding: 24, textAlign: 'center' }}>Closing...</div>;
  }
  if (socialConnect === 'error') {
    setTimeout(() => window.close(), 4000);
    return (
      <div style={{ padding: 24 }}>
        <div style={{ padding: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 14, color: '#991b1b' }}>
          {errorMessage}
          <div style={{ marginTop: 8 }}>Closing in a few seconds...</div>
        </div>
      </div>
    );
  }
}

const mainWindowError = !isPopup && socialConnect === 'error' && platform ? errorMessage : null;
```

Then in your normal layout, render `{mainWindowError && <div>...</div>}` at the top when `mainWindowError` is set.

---

## Supported Platforms

- LinkedIn (real OAuth with `client_id`)
- Instagram, Facebook, TikTok, YouTube (callback URL stub; configure OAuth per platform)

# Frontend: Social Connect Popup – Rewrite Instructions

Use this as the spec when rewriting the frontend so the LinkedIn (and other platform) connect popup works correctly and the console "Unsafe attempt to initiate navigation" errors go away.

---

## 1. App.js (or root component) – Popup callback only

**Goal:** When the user lands back on your site in the **popup** with `?social_connect=success&platform=...` or `?social_connect=error&platform=...`, render **only** a minimal view. Do **not** mount the full app (no router, no VideoPublisher, no Connect button). That avoids the "Unsafe attempt to initiate navigation" and gives a clear UX.

**Do this at the very top of your root component (before any router or main layout):**

1. Read `social_connect` and `platform` from `window.location.search` (e.g. `new URLSearchParams(window.location.search)`).
2. If `window.opener` is set (we're in a popup) **and** both `social_connect` and `platform` are present:
   - **Success:** Render only a short message like "Closing...", call `window.opener.postMessage({ type: 'SOCIAL_CONNECT_DONE', platform }, window.location.origin)`, then `window.close()`. Return this minimal JSX and **do not render** the rest of the app (no `<Router>`, no `<VideoPublisher>`, etc.).
   - **Error:** Render only a **red error banner** with:
     - LinkedIn: *"LinkedIn didn't connect. If the popup showed an error or blank page, it may be a temporary LinkedIn issue. Try again in a few minutes."*
     - Other platforms: *"{Platform} connection failed. Try again later."*
     - Plus the line: *"Closing in a few seconds..."*
     - After 4 seconds call `window.close()`. Again, **do not render** the rest of the app.
3. If we're **not** in a popup but the URL has `?social_connect=error&platform=...`, show the same **red banner at the top** of your normal layout (no auto-close).
4. Otherwise render your normal app (router, VideoPublisher, etc.).

**Important:** The check must be **synchronous at render time** (read URL and `window.opener` once at the top). Do not use a `useEffect` that shows the callback view after the full app has already started rendering; that can cause the navigation errors and the Connect button to appear in the popup.

Exact copy-paste for the callback branch is in `docs/SOCIAL_CONNECT_FRONTEND_FLOW.md` (section "Popup callback: spec and implementation" → "Copy-paste implementation").

---

## 2. VideoPublisher.js – What to keep and what to avoid

**Keep as-is:**

- **connectPlatform:** You already call `GET ${base}/api/social/connect/${platformId}` with auth, get `data.url`, and open the popup with `window.open(url, 'social-connect', ...)`. Do **not** change that. Never open the popup to your frontend URL (e.g. wintaibot.com); only to the `url` returned by the API (LinkedIn OAuth URL, etc.).
- **Same-tab redirect handling:** Your `useEffect` that runs when `!window.opener` and `social_connect === 'success'` (refresh connections, clean URL with `history.replaceState`) is fine. Keep it.
- **Listen for popup success:** You currently listen for a custom event `social-connect-success` with `e.detail.platform` and then call `refreshConnections(...)`. That's fine **if** your App.js (or whoever receives the popup's `postMessage`) dispatches that custom event when it receives `postMessage` with `type: 'SOCIAL_CONNECT_DONE'`. Otherwise, add a `window.addEventListener('message', ...)` in VideoPublisher (or in a single place in the app) that checks `e.origin === window.location.origin` and `e.data?.type === 'SOCIAL_CONNECT_DONE'`, then calls `refreshConnections()` with the platform from `e.data.platform`.

**Do not add / remove if present:**

- **Do not** set the popup's location from the main window. Remove any code that does:
  - `popup.location = '...'` or `popup.location.href = '...'`
  - Redirecting the popup to `https://www.wintaibot.com/?social_connect=...` (or any URL) from the opener.
- **Do not** use a `setInterval` or polling that redirects the popup when you think the flow failed or when the popup has loaded a certain URL. You may keep a simple interval that only checks `popup.closed` and then clears itself; do **not** set `popup.location` inside it.
- The **backend** is the only thing that should send the user's browser (the popup) to your frontend with `?social_connect=...`. The main window must never do that.

---

## 3. PostMessage contract (popup → opener)

When the popup lands on your site with `?social_connect=success&platform=linkedin` (or any platform), the **popup** should send:

```javascript
window.opener.postMessage(
  { type: 'SOCIAL_CONNECT_DONE', platform: 'linkedin' },  // or youtube, instagram, etc.
  window.location.origin
);
```

The **opener** (main window) should listen with:

```javascript
window.addEventListener('message', (e) => {
  if (e.origin !== window.location.origin) return;
  if (e.data?.type === 'SOCIAL_CONNECT_DONE' && e.data.platform) {
    // Refresh connected accounts (e.g. call your existing refreshConnections())
  }
});
```

If you prefer to keep using a custom event (e.g. `social-connect-success`), then in the place where you handle `message` events, when you receive `type: 'SOCIAL_CONNECT_DONE'`, dispatch:

```javascript
window.dispatchEvent(new CustomEvent('social-connect-success', { detail: { platform: e.data.platform } }));
```

so VideoPublisher's existing listener still works.

---

## 4. Checklist for the person rewriting

- [x] **App.js (or root):** Synchronous check for `social_connect` + `platform` + `window.opener`. If popup and callback params, render only "Closing..." (success) or red banner + "Closing in a few seconds..." (error), then postMessage + close or close after 4s. No full app in popup.
- [x] **App.js:** When not in popup but URL has `social_connect=error`, show red banner at top of main content.
- [x] **VideoPublisher:** Keep `connectPlatform` as-is (open popup with `response.url` only). Do not set `popup.location` anywhere.
- [x] **VideoPublisher:** Ensure opener either listens for `postMessage` type `SOCIAL_CONNECT_DONE` and refreshes, or that the existing `social-connect-success` custom event is still dispatched from the message handler.
- [x] Remove any code that redirects the popup from the main window (search for `popup.location`, `popup.location.href`, or redirect to `?social_connect=` from the opener).

After these changes, the "Unsafe attempt to initiate navigation" console errors should stop, and the popup should show the correct message and close.

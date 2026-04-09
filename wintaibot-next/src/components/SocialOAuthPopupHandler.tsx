'use client';

import { useLayoutEffect } from 'react';

/** Must match what the OAuth popup posts to {@code window.opener}. */
export const SOCIAL_OAUTH_MESSAGE_TYPE = 'wintaibot-social-oauth';

/**
 * OAuth popup lands on the site with ?social_connect=... — avoid mounting the full app in the popup
 * (which can trigger cross-origin frame navigation errors when www ≠ apex). Notify opener and close.
 */
export default function SocialOAuthPopupHandler() {
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const sc = params.get('social_connect');
    const platform = params.get('platform');
    if (!sc || !platform) return;

    const opener = window.opener as Window | null;
    if (!opener || opener.closed) return;

    const payload = {
      type: SOCIAL_OAUTH_MESSAGE_TYPE,
      result: sc,
      platform,
      msg: params.get('msg'),
    };
    try {
      opener.postMessage(payload, window.location.origin);
    } catch {
      opener.postMessage(payload, '*');
    }
    window.close();
  }, []);

  return null;
}

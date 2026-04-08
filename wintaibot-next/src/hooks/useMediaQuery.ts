'use client';

import { useState, useLayoutEffect } from 'react';

/**
 * SSR-safe: always starts `false` so server HTML matches the client’s first paint.
 * Media state updates in layout effect before paint to avoid hydration mismatches.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const read = () => setMatches(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, [query]);

  return matches;
}

/**
 * Temporarily hidden from connect / publish / calendar pickers.
 * Remove ids from the Set to re-enable.
 */
export const DISABLED_PLATFORM_IDS = new Set(['threads']);

export function isPlatformDisabled(platformId) {
  if (platformId == null) return false;
  return DISABLED_PLATFORM_IDS.has(String(platformId).toLowerCase());
}

export function filterEnabledPlatforms(platforms) {
  if (!Array.isArray(platforms)) return [];
  return platforms.filter((p) => p && !isPlatformDisabled(p.id));
}

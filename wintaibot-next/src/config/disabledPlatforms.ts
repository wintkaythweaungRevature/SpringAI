/**
 * Temporarily hidden from connect / publish / calendar pickers.
 * Remove ids from the Set to re-enable.
 */
export const DISABLED_PLATFORM_IDS = new Set<string>(['tiktok', 'threads']);

export function isPlatformDisabled(platformId: string | null | undefined): boolean {
  if (platformId == null) return false;
  return DISABLED_PLATFORM_IDS.has(String(platformId).toLowerCase());
}

export function filterEnabledPlatforms<T extends { id: string }>(platforms: T[]): T[] {
  if (!Array.isArray(platforms)) return [];
  return platforms.filter((p) => p && !isPlatformDisabled(p.id));
}

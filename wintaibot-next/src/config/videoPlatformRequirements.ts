/**
 * Client-side limits for short-form / reels workflows and direct-upload safety.
 * Keep in sync with `src/config/videoPlatformRequirements.js` (CRA app).
 */

export const SAFE_DIRECT_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;

const PLATFORM_LABELS: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  threads: 'Threads',
  pinterest: 'Pinterest',
};

export function platformDisplayName(platformId: string): string {
  const pid = String(platformId || '').toLowerCase();
  return PLATFORM_LABELS[pid] || platformId || 'Platform';
}

export function formatDurationHuman(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const s = Math.floor(sec);
  if (s >= 3600) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r > 0 ? `${m}m ${r}s` : `${m}m`;
  }
  return `${s}s`;
}

export function formatBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    if (!file || typeof URL === 'undefined') {
      reject(new Error('No file'));
      return;
    }
    const url = URL.createObjectURL(file);
    const el = document.createElement('video');
    el.preload = 'metadata';
    const cleanup = () => {
      try {
        URL.revokeObjectURL(url);
      } catch {
        /* ignore */
      }
    };
    el.onloadedmetadata = () => {
      const d = el.duration;
      cleanup();
      if (Number.isFinite(d) && d > 0) resolve(d);
      else reject(new Error('Invalid duration'));
    };
    el.onerror = () => {
      cleanup();
      reject(new Error('Could not load video'));
    };
    el.src = url;
  });
}

export function getMaxDurationSecForPlatform(platformId: string, publishType: string): number | null {
  const pid = String(platformId || '').toLowerCase();
  const pt = String(publishType || 'reels').toLowerCase();

  if (pid === 'instagram') {
    if (pt === 'story') return 60;
    return 90;
  }
  if (pid === 'facebook') {
    if (pt === 'story') return 60;
    return 90;
  }
  if (pid === 'youtube') return null;
  if (pid === 'x') return 140;
  if (pid === 'linkedin') return 600;
  if (pid === 'tiktok') return 600;
  if (pid === 'threads') return 300;
  if (pid === 'pinterest') return null;
  return null;
}

function formatModeLabel(publishType: string, platformId: string): string {
  const pid = String(platformId || '').toLowerCase();
  const pt = String(publishType || 'reels').toLowerCase();
  if (pt === 'story' && (pid === 'instagram' || pid === 'facebook')) return 'Story';
  if (pid === 'instagram' || pid === 'facebook') return 'Reels';
  if (pid === 'x') return 'video post';
  return 'this format';
}

function platformNeedsDirectVideoUpload(
  pid: string,
  opts: { postType: string; variant?: { variantId?: string }; scheduledAt?: string | null },
): boolean {
  if (opts.postType !== 'video') return false;
  if (opts.variant?.variantId) return false;
  const hasSchedule = opts.scheduledAt != null && String(opts.scheduledAt).trim() !== '';
  if (hasSchedule) return false;
  return true;
}

export type ValidationIssue = {
  platform: string;
  code: string;
  message: string;
  maxDurationSec?: number;
  actualSec?: number;
};

export function validateVideoAgainstPlatforms(opts: {
  platformIds: string[];
  publishType: string;
  postType: string;
  durationSec: number;
  fileSizeBytes: number;
  variantsByPlatform: Record<string, { variantId?: string } | undefined>;
  scheduledTimesByPlatform?: Record<string, string | null | undefined>;
  /** Before variants exist (upload step) */
  skipDirectUploadSizeCheck?: boolean;
}): { blocking: ValidationIssue[]; warnings: ValidationIssue[] } {
  const blocking: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (opts.postType !== 'video') return { blocking, warnings };

  const effDur = Number(opts.durationSec) || 0;
  const fileSz = Number(opts.fileSizeBytes) || 0;
  const ids = Array.isArray(opts.platformIds) ? opts.platformIds : [];
  const sched = opts.scheduledTimesByPlatform || {};

  for (const pid of ids) {
    const maxDur = getMaxDurationSecForPlatform(pid, opts.publishType);
    if (maxDur != null && effDur > 0 && effDur > maxDur + 0.25) {
      const label = platformDisplayName(pid);
      const mode = formatModeLabel(opts.publishType, pid);
      blocking.push({
        platform: pid,
        code: 'duration',
        message: `${label} (${mode}): your video is ${formatDurationHuman(effDur)}; this workflow supports up to ${formatDurationHuman(maxDur)}. Trim the video or remove ${label} from selected platforms.`,
        maxDurationSec: maxDur,
        actualSec: effDur,
      });
    }
  }

  const anyDirect = ids.some((pid) =>
    platformNeedsDirectVideoUpload(pid, {
      postType: opts.postType,
      variant: opts.variantsByPlatform?.[pid],
      scheduledAt: sched[pid],
    }),
  );

  if (!opts.skipDirectUploadSizeCheck && anyDirect && fileSz > SAFE_DIRECT_UPLOAD_MAX_BYTES) {
    blocking.push({
      platform: '_all',
      code: 'upload_size',
      message: `This file is ${formatBytes(fileSz)}. At least one platform will publish using a full-file upload, which often fails above ~${formatBytes(SAFE_DIRECT_UPLOAD_MAX_BYTES)} (HTTP 413). Finish processing so each platform has a variant, trim/compress the video, or deselect platforms until a variant exists.`,
    });
  }

  if (ids.includes('youtube') && effDur > 180 && effDur > 0) {
    warnings.push({
      platform: 'youtube',
      code: 'youtube_shorts',
      message: `YouTube Shorts are typically under 3 minutes (${formatDurationHuman(180)}). At ${formatDurationHuman(effDur)} this may go out as long-form video depending on your channel and API.`,
    });
  }

  if (effDur <= 0) {
    warnings.push({
      platform: '_all',
      code: 'no_duration',
      message: 'Video length is not available yet. Duration checks may be incomplete until the file is analyzed.',
    });
  }

  return { blocking, warnings };
}

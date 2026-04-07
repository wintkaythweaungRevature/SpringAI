/** Direct full-file upload size guard (video publisher). Keep in sync with CRA `videoPlatformRequirements.js`. */

export const SAFE_DIRECT_UPLOAD_MAX_BYTES = 100 * 1024 * 1024;
const configuredImageLimitMb = Number(process.env.NEXT_PUBLIC_SAFE_DIRECT_IMAGE_UPLOAD_MAX_MB || 4);
export const SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES =
  Number.isFinite(configuredImageLimitMb) && configuredImageLimitMb > 0
    ? Math.round(configuredImageLimitMb * 1024 * 1024)
    : 4 * 1024 * 1024;

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

/** Earliest valid `datetime-local` value (minute precision, local) — not before the current moment. */
export function minScheduleDatetimeLocal(now: Date = new Date()): string {
  const d = new Date(now);
  d.setSeconds(0, 0);
  if (d.getTime() < Date.now()) {
    d.setMinutes(d.getMinutes() + 1);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * True when a schedule string (datetime-local or ISO) is strictly before now.
 * Empty/null is not "in the past" (treated as immediate / no schedule).
 */
export function isScheduleTimeInPast(value: string | null | undefined): boolean {
  if (value == null || String(value).trim() === '') return false;
  const t = new Date(String(value)).getTime();
  if (!Number.isFinite(t)) return true;
  return t < Date.now() - 500;
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

/** Reserved for per-platform duration caps in the video publisher (none currently). */
export function getMaxDurationSecForPlatform(_platformId: string, _publishType: string): number | null {
  return null;
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

  const anyDirect = ids.some((pid) =>
    platformNeedsDirectVideoUpload(pid, {
      postType: opts.postType,
      variant: opts.variantsByPlatform?.[pid],
      scheduledAt: sched[pid],
    }),
  );

  for (const pid of ids) {
    const s = sched[pid];
    if (s != null && String(s).trim() !== '' && isScheduleTimeInPast(s)) {
      blocking.push({
        platform: pid,
        code: 'schedule_past',
        message: `Scheduled time must be now or later for ${platformDisplayName(pid)}. You cannot schedule in the past.`,
      });
    }
  }

  if (!opts.skipDirectUploadSizeCheck && anyDirect && fileSz > SAFE_DIRECT_UPLOAD_MAX_BYTES) {
    blocking.push({
      platform: '_all',
      code: 'upload_size',
      message: `This file is ${formatBytes(fileSz)}. At least one platform will publish using a full-file upload, which often fails above ~${formatBytes(SAFE_DIRECT_UPLOAD_MAX_BYTES)} (HTTP 413). Finish processing so each platform has a variant, trim/compress the video, or deselect platforms until a variant exists.`,
    });
  }

  return { blocking, warnings };
}

export function validateImageAgainstPlatforms(opts: {
  platformIds: string[];
  fileSizeBytes: number;
}): { blocking: ValidationIssue[]; warnings: ValidationIssue[] } {
  const blocking: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  const ids = Array.isArray(opts.platformIds) ? opts.platformIds : [];
  const fileSz = Number(opts.fileSizeBytes) || 0;
  if (ids.length === 0) return { blocking, warnings };

  if (fileSz > SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES) {
    blocking.push({
      platform: '_all',
      code: 'image_upload_size',
      message: `Image is ${formatBytes(fileSz)}. Current API gateway often rejects image publish above ~${formatBytes(SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES)} (HTTP 413). Compress or resize before publishing.`,
    });
  }

  return { blocking, warnings };
}

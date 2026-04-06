/**
 * X (Twitter) video length + direct-upload size. Keep in sync with CRA `videoPlatformRequirements.js`.
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

/** Only X (Twitter) video length is enforced in this UI. */
export function getMaxDurationSecForPlatform(platformId: string, _publishType: string): number | null {
  const pid = String(platformId || '').toLowerCase();
  if (pid === 'x') return 140;
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

  for (const pid of ids) {
    const maxDur = getMaxDurationSecForPlatform(pid, opts.publishType);
    if (maxDur != null && effDur > 0 && effDur > maxDur + 0.25) {
      blocking.push({
        platform: pid,
        code: 'duration',
        message: `X (Twitter): your caption is visible text; the video is separate. This video is ${formatDurationHuman(effDur)} but X allows up to ${formatDurationHuman(maxDur)} for video. Trim the clip or deselect X.`,
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

  if (effDur <= 0 && ids.includes('x')) {
    warnings.push({
      platform: 'x',
      code: 'no_duration',
      message: 'Video length is not available yet — the X (Twitter) video-length check will apply once length is known.',
    });
  }

  return { blocking, warnings };
}

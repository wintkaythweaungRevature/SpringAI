/** Keep in sync with `SpringAI/src/config/videoPlatformRequirements.js` (CRA). */

/** Must match Spring `application.properties` multipart limits; see CRA `videoPlatformRequirements.js`. */
export const MAX_VIDEO_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024;

export const SAFE_DIRECT_UPLOAD_MAX_BYTES = MAX_VIDEO_UPLOAD_BYTES;

/** Ingest via S3 presigned PUT when file exceeds this size (see CRA). */
export const S3_DIRECT_UPLOAD_THRESHOLD_BYTES = 100 * 1024 * 1024;
const configuredImageLimitMb = Number(process.env.NEXT_PUBLIC_SAFE_DIRECT_IMAGE_UPLOAD_MAX_MB || 4);
export const SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES =
  Number.isFinite(configuredImageLimitMb) && configuredImageLimitMb > 0
    ? Math.round(configuredImageLimitMb * 1024 * 1024)
    : 4 * 1024 * 1024;

export const IMAGE_PLATFORM_LIMITS_MB: Record<string, number> = {
  instagram: 8,
  facebook: 8,
  linkedin: 8,
  x: 5,
  threads: 8,
  pinterest: 8,
};

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

export function getMaxDurationSecForPlatform(
  platformId: string,
  publishType: string,
  postType: string = 'video',
): number | null {
  const pid = String(platformId || '').toLowerCase();
  const pub = String(publishType || 'reels').toLowerCase();
  if (postType !== 'video') return null;
  if (pid === 'x') return 140;
  if (pid === 'youtube') return 43200;
  if (pid === 'tiktok') return 900;
  if (pid === 'linkedin') return 900;
  if (pid === 'threads') return 300;
  if (pid === 'instagram') {
    if (pub === 'story') return 60;
    if (pub === 'reels') return 900;
    return 3600;
  }
  if (pid === 'facebook') {
    if (pub === 'story') return 60;
    if (pub === 'reels') return 900;
    return 3600;
  }
  return null;
}

export function getPlatformVideoGuidelines(
  platformId: string,
  publishType: string,
  postType: string = 'video',
): { title: string; accepts: string[]; fixTips: string[] } {
  const pid = String(platformId || '').toLowerCase();
  const pub = String(publishType || 'reels').toLowerCase();
  const label = platformDisplayName(pid);
  const commonVideo =
    'Formats: MP4, MOV, WebM (H.264/AAC recommended). App max file size: 2 GB. Large files use direct upload when possible.';

  if (postType !== 'video') {
    return { title: label, accepts: ['Switch to video mode to see video requirements.'], fixTips: [] };
  }

  if (pid === 'youtube') {
    return {
      title: `${label} (video)`,
      accepts: [commonVideo, 'Length: up to 12 hours for standard uploads in this UI.', 'Resolution: 720p–4K common; 16:9 or vertical both supported.'],
      fixTips: ['If upload fails, export H.264 MP4 with AAC audio and retry.'],
    };
  }
  if (pid === 'instagram') {
    if (pub === 'story') {
      return {
        title: `${label} — Story`,
        accepts: ['Stories: keep clips short (this UI caps at 60s per story-style video).', 'Aspect: 9:16 vertical works best.'],
        fixTips: ['Trim to under 60 seconds or switch to Reels / feed-style posting.'],
      };
    }
    if (pub === 'reels') {
      return {
        title: `${label} — Reels`,
        accepts: [commonVideo, 'Length: up to 15 minutes in this publisher (Meta may vary by account).', 'Vertical 9:16 recommended for Reels.'],
        fixTips: ['If Meta rejects length, trim under 3 minutes for classic Reels or verify account limits.'],
      };
    }
    return {
      title: `${label} — Feed video`,
      accepts: [commonVideo, 'Length: up to 60 minutes in this UI for feed-style video.', 'Aspect: 4:5 to 1.91:1 for feed.'],
      fixTips: [],
    };
  }
  if (pid === 'facebook') {
    if (pub === 'story') {
      return {
        title: `${label} — Story`,
        accepts: ['Stories: short vertical video (this UI caps at 60s).', '9:16 recommended.'],
        fixTips: ['Trim to under 60 seconds.'],
      };
    }
    if (pub === 'reels') {
      return {
        title: `${label} — Reels`,
        accepts: [commonVideo, 'Length: up to 15 minutes in this publisher.', 'Vertical 9:16 works well.'],
        fixTips: [],
      };
    }
    return {
      title: `${label} — Feed video`,
      accepts: [commonVideo, 'Length: up to 60 minutes in this UI.', 'Square or landscape common.'],
      fixTips: [],
    };
  }
  if (pid === 'linkedin') {
    return {
      title: `${label} (video)`,
      accepts: [commonVideo, 'Length: up to 15 minutes in this UI.', 'Professional content; 16:9 or square common.'],
      fixTips: [],
    };
  }
  if (pid === 'tiktok') {
    return {
      title: `${label} (video)`,
      accepts: [commonVideo, 'Length: up to 15 minutes in this UI (TikTok/account limits may vary).', 'Vertical 9:16 recommended.'],
      fixTips: ['If TikTok rejects duration, trim under 10 minutes and retry.'],
    };
  }
  if (pid === 'x') {
    return {
      title: `${label} (video)`,
      accepts: [commonVideo, 'Length: up to 2m 20s (140s) for the video attachment in this integration.', 'Caption is separate visible text in the feed.'],
      fixTips: ['Trim video to 2m 20s or deselect X.'],
    };
  }
  if (pid === 'threads') {
    return {
      title: `${label} (video)`,
      accepts: [commonVideo, 'Length: up to 5 minutes in this UI.', 'Short vertical clips common.'],
      fixTips: ['Trim to under 5 minutes if publish fails.'],
    };
  }
  return { title: label, accepts: [commonVideo], fixTips: [] };
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
    const maxDur = getMaxDurationSecForPlatform(pid, opts.publishType, opts.postType);
    if (maxDur != null && effDur > 0 && effDur > maxDur + 0.25) {
      const g = getPlatformVideoGuidelines(pid, opts.publishType, opts.postType);
      const label = platformDisplayName(pid);
      blocking.push({
        platform: pid,
        code: 'duration',
        message: `${label}: your video is ${formatDurationHuman(effDur)}. For ${g.title}, this app accepts up to ${formatDurationHuman(maxDur)}. ${g.fixTips[0] || 'Trim the clip or change publish mode / deselect this platform.'}`,
        maxDurationSec: maxDur,
        actualSec: effDur,
      });
    }
  }

  for (const pid of ids) {
    const s = sched[pid];
    if (s != null && String(s).trim() !== '' && isScheduleTimeInPast(s)) {
      blocking.push({
        platform: pid,
        code: 'schedule_past',
        message: `Scheduled time must be now or later for ${platformDisplayName(pid)}.`,
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
      message: `File is ${formatBytes(fileSz)}. Publishing without processed variants re-uploads the whole file and often fails above ~${formatBytes(SAFE_DIRECT_UPLOAD_MAX_BYTES)} (HTTP 413). Wait for Generate Content to finish (variants), trim/compress, or deselect platforms until variants exist.`,
    });
  }

  if (effDur <= 0 && ids.some((id) => getMaxDurationSecForPlatform(id, opts.publishType, opts.postType) != null)) {
    warnings.push({
      platform: '_all',
      code: 'no_duration',
      message: 'Video length is not detected yet — per-platform length checks apply once length is known.',
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

  for (const pid of ids) {
    const capMb = IMAGE_PLATFORM_LIMITS_MB[String(pid || '').toLowerCase()];
    if (capMb && fileSz > capMb * 1024 * 1024) {
      blocking.push({
        platform: pid,
        code: 'image_platform_size',
        message: `${platformDisplayName(pid)}: images above ~${capMb} MB often fail when posting. Your file is ${formatBytes(fileSz)}. Compress or resize.`,
      });
    }
  }

  if (fileSz > SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES) {
    blocking.push({
      platform: '_all',
      code: 'image_upload_size',
      message: `Image is ${formatBytes(fileSz)}. API gateway often rejects above ~${formatBytes(SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES)} (HTTP 413).`,
    });
  }

  return { blocking, warnings };
}

export function minScheduleDatetimeLocal(now: Date = new Date()): string {
  const d = new Date(now);
  d.setSeconds(0, 0);
  if (d.getTime() < Date.now()) {
    d.setMinutes(d.getMinutes() + 1);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isScheduleTimeInPast(value: string | null | undefined): boolean {
  if (value == null || String(value).trim() === '') return false;
  const t = new Date(String(value)).getTime();
  if (!Number.isFinite(t)) return true;
  return t < Date.now() - 500;
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

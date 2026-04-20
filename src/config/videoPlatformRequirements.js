g/**
 * Client-side checks and copy for video/image publishing.
 * Limits are practical guardrails for this app; platforms may change API rules.
 */

/**
 * Hard cap for video file size (picker + server multipart). Must match
 * `spring.servlet.multipart.max-file-size` / `max-request-size` in `application.properties`.
 * Nginx `client_max_body_size` must be >= this or uploads fail with HTTP 413.
 */
export const MAX_VIDEO_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB

/** Same as {@link MAX_VIDEO_UPLOAD_BYTES} — max body for full-file publish without a variant. */
export const SAFE_DIRECT_UPLOAD_MAX_BYTES = MAX_VIDEO_UPLOAD_BYTES;

/** Above this size, use pre-signed S3 for ingest (`/upload/init` + PUT) so the browser does not POST the whole file to Spring. */
export const S3_DIRECT_UPLOAD_THRESHOLD_BYTES = 100 * 1024 * 1024; // 100 MB
/** Conservative image payload guard to avoid API gateway 413 on /api/social/post. */
const configuredImageLimitMb = Number(process.env.REACT_APP_SAFE_DIRECT_IMAGE_UPLOAD_MAX_MB || 4);
export const SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES =
  Number.isFinite(configuredImageLimitMb) && configuredImageLimitMb > 0
    ? Math.round(configuredImageLimitMb * 1024 * 1024)
    : 4 * 1024 * 1024;

/** Practical per-platform image upload ceilings (MB) for preflight UX. */
export const IMAGE_PLATFORM_LIMITS_MB = {
  instagram: 8,
  facebook: 8,
  linkedin: 8,
  x: 5,
  threads: 8,
  pinterest: 8,
};

const PLATFORM_LABELS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  threads: 'Threads',
  pinterest: 'Pinterest',
};

export function platformDisplayName(platformId) {
  const pid = String(platformId || '').toLowerCase();
  return PLATFORM_LABELS[pid] || platformId || 'Platform';
}

export function formatDurationHuman(sec) {
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

export function formatBytes(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n >= 1024 * 1024 * 1024) return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${n} B`;
}

/**
 * Max video length (seconds) enforced in this UI for a platform + publish mode.
 * null = no duration cap in UI.
 */
export function getMaxDurationSecForPlatform(platformId, publishType, postType = 'video') {
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

/**
 * Human-readable bullets: what each platform expects in this publisher (video).
 * @param {string} platformId
 * @param {string} publishType reels | story | feed
 * @param {string} postType video | image | text
 * @returns {{ title: string, accepts: string[], fixTips: string[] }}
 */
export function getPlatformVideoGuidelines(platformId, publishType, postType = 'video') {
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
      accepts: [
        commonVideo,
        'Length: up to 12 hours for standard uploads in this UI.',
        'Resolution: 720p–4K common; 16:9 or vertical both supported.',
      ],
      fixTips: ['If upload fails, export H.264 MP4 with AAC audio and retry.'],
    };
  }
  if (pid === 'instagram') {
    if (pub === 'story') {
      return {
        title: `${label} — Story`,
        accepts: [
          'Stories: keep clips short (this UI caps at 60s per story-style video).',
          'Aspect: 9:16 vertical works best.',
        ],
        fixTips: ['Trim to under 60 seconds or switch to Reels / feed-style posting.'],
      };
    }
    if (pub === 'reels') {
      return {
        title: `${label} — Reels`,
        accepts: [
          commonVideo,
          'Length: up to 15 minutes in this publisher (Meta may vary by account).',
          'Vertical 9:16 recommended for Reels.',
        ],
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
      accepts: [
        commonVideo,
        'Length: up to 2m 20s (140s) for the video attachment in this integration.',
        'Caption is separate visible text in the feed.',
      ],
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

function platformNeedsDirectVideoUpload(pid, { postType, variant, scheduledAt }) {
  if (postType !== 'video') return false;
  if (variant?.variantId) return false;
  const hasSchedule = scheduledAt != null && String(scheduledAt).trim() !== '';
  if (hasSchedule) return false;
  return true;
}

/**
 * @param {object} opts
 * @param {string[]} opts.platformIds
 * @param {string} opts.publishType
 * @param {string} opts.postType
 * @param {number} opts.durationSec
 * @param {number} opts.fileSizeBytes
 * @param {Record<string, { variantId?: string }>} opts.variantsByPlatform
 * @param {Record<string, string|null|undefined>} [opts.scheduledTimesByPlatform]
 * @param {boolean} [opts.skipDirectUploadSizeCheck] — true on upload step before variants exist
 * @returns {{ blocking: object[], warnings: object[] }}
 */
export function validateVideoAgainstPlatforms({
  platformIds,
  publishType,
  postType,
  durationSec,
  fileSizeBytes,
  variantsByPlatform,
  scheduledTimesByPlatform = {},
  skipDirectUploadSizeCheck = false,
}) {
  const blocking = [];
  const warnings = [];

  if (postType !== 'video') return { blocking, warnings };

  const effDur = Number(durationSec) || 0;
  const fileSz = Number(fileSizeBytes) || 0;
  const ids = Array.isArray(platformIds) ? platformIds : [];
  const pub = String(publishType || 'reels').toLowerCase();

  for (const pid of ids) {
    const maxDur = getMaxDurationSecForPlatform(pid, publishType, postType);
    if (maxDur != null && effDur > 0 && effDur > maxDur + 0.25) {
      const g = getPlatformVideoGuidelines(pid, effectivePublishTypeForValidation(pid, publishType, pub), postType);
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

  const anyDirect = ids.some((pid) =>
    platformNeedsDirectVideoUpload(pid, {
      postType,
      variant: variantsByPlatform?.[pid],
      scheduledAt: scheduledTimesByPlatform[pid],
    }),
  );

  if (!skipDirectUploadSizeCheck && anyDirect && fileSz > SAFE_DIRECT_UPLOAD_MAX_BYTES) {
    blocking.push({
      platform: '_all',
      code: 'upload_size',
      message: `File is ${formatBytes(fileSz)}. Publishing without processed variants re-uploads the whole file and often fails above ~${formatBytes(SAFE_DIRECT_UPLOAD_MAX_BYTES)} (HTTP 413). Wait for Generate Content to finish (variants), trim/compress, or deselect platforms until variants exist.`,
    });
  }

  if (effDur <= 0 && ids.some((id) => getMaxDurationSecForPlatform(id, publishType, postType) != null)) {
    warnings.push({
      platform: '_all',
      code: 'no_duration',
      message: 'Video length is not detected yet — per-platform length checks apply once length is known.',
    });
  }

  return { blocking, warnings };
}

/** Normalize publish type for guideline lookup when UI uses combined modes. */
function effectivePublishTypeForValidation(platformId, publishType, pubLower) {
  const pid = String(platformId || '').toLowerCase();
  if ((pid === 'instagram' || pid === 'facebook') && pubLower === 'story') return 'story';
  if (pubLower === 'reels') return 'reels';
  return publishType || 'reels';
}

/**
 * Guard image post payload size before publish (common gateway 413 failure point).
 * Also enforces per-platform soft caps from IMAGE_PLATFORM_LIMITS_MB.
 */
export function validateImageAgainstPlatforms({ platformIds, fileSizeBytes }) {
  const blocking = [];
  const warnings = [];
  const ids = Array.isArray(platformIds) ? platformIds : [];
  const fileSz = Number(fileSizeBytes) || 0;
  if (ids.length === 0) return { blocking, warnings };

  for (const pid of ids) {
    const capMb = IMAGE_PLATFORM_LIMITS_MB[String(pid || '').toLowerCase()];
    if (capMb && fileSz > capMb * 1024 * 1024) {
      blocking.push({
        platform: pid,
        code: 'image_platform_size',
        message: `${platformDisplayName(pid)}: images above ~${capMb} MB often fail when posting. Your file is ${formatBytes(fileSz)}. Compress or resize (e.g. export JPG ~1080–2048px wide).`,
      });
    }
  }

  if (fileSz > SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES) {
    blocking.push({
      platform: '_all',
      code: 'image_upload_size',
      message: `Image is ${formatBytes(fileSz)}. API gateway often rejects above ~${formatBytes(SAFE_DIRECT_IMAGE_UPLOAD_MAX_BYTES)} (HTTP 413). Compress or set REACT_APP_SAFE_DIRECT_IMAGE_UPLOAD_MAX_MB + nginx body size.`,
    });
  }

  return { blocking, warnings };
}

/**
 * Read duration from a local video file (browser).
 * @param {File} file
 * @returns {Promise<number>}
 */
export function getVideoDurationFromFile(file) {
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
      } catch (_) {}
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

/**
 * Client-side checks: X (Twitter) video length (caption is visible text in the feed) and
 * direct-upload size (HTTP 413). Other platforms are not duration-gated here.
 */

/** Full-file multipart publish often hits reverse-proxy limits (HTTP 413). */
export const SAFE_DIRECT_UPLOAD_MAX_BYTES = 100 * 1024 * 1024; // 100 MB

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

/**
 * Max video length (seconds) we enforce in the UI.
 * Only X (Twitter) is checked here; other platforms rely on their APIs.
 */
export function getMaxDurationSecForPlatform(platformId, _publishType) {
  const pid = String(platformId || '').toLowerCase();
  if (pid === 'x') return 140;
  return null;
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

  for (const pid of ids) {
    const maxDur = getMaxDurationSecForPlatform(pid, publishType);
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
      postType,
      variant: variantsByPlatform?.[pid],
      scheduledAt: scheduledTimesByPlatform[pid],
    }),
  );

  if (!skipDirectUploadSizeCheck && anyDirect && fileSz > SAFE_DIRECT_UPLOAD_MAX_BYTES) {
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

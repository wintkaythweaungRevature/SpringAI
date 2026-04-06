/**
 * Resolve media URLs for calendar/list previews — same rules as PostDetailModal
 * (presigned AWS URLs pass through; S3 / non-HTTP refs go through preview-url API).
 */

export function looksLikePresignedAwsUrl(u) {
  return typeof u === 'string' && /X-Amz-Algorithm|X-Amz-Credential/i.test(u);
}

export function looksLikeS3HttpUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u) && /\.s3[.-][a-z0-9-]+\.amazonaws\.com\//i.test(u);
}

function firstNonEmptyStr(...vals) {
  for (const v of vals) {
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/** Best ref for presign / display — align with PostDetailModal.rawPreviewRef (no edit field). */
export function rawMediaRefForCalendarPost(post) {
  return firstNonEmptyStr(
    post?.thumbnailUrl,
    post?.thumbnail,
    post?.thumbUrl,
    post?.posterUrl,
    post?.previewImageUrl,
    post?.mediaUrl,
    post?.videoUrl,
    post?.imageUrl,
    post?.fileUrl,
    post?.assetUrl,
    post?.previewUrl,
    post?.coverUrl,
    post?.url,
  );
}

/**
 * @param {string} raw
 * @param {{ token?: string, base?: string }} opts
 * @returns {Promise<string>}
 */
export async function fetchPreviewDisplayUrl(raw, { token, base } = {}) {
  const b = String(base || 'https://api.wintaibot.com').replace(/\/$/, '');
  if (!raw || !String(raw).trim()) return '';
  if (looksLikePresignedAwsUrl(raw)) return raw;
  const needsPresign = !/^https?:\/\//i.test(raw) || looksLikeS3HttpUrl(raw);
  if (!needsPresign || !token) return raw;
  try {
    const r = await fetch(
      `${b}/api/social/post/media/preview-url?ref=${encodeURIComponent(raw)}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const data = await r.json().catch(() => ({}));
    if (r.ok && data.url) return data.url;
  } catch {
    /* ignore */
  }
  return raw;
}

/**
 * URL we can show immediately without an async presign (optimistic first paint).
 */
export function syncDisplayableMediaUrl(post, getPostPreview, youtubeVideoIdForCalendarPost) {
  const preview = getPostPreview(post);
  if (!preview?.url) return '';
  if (typeof youtubeVideoIdForCalendarPost === 'function' && youtubeVideoIdForCalendarPost(post)) {
    return preview.url;
  }
  const raw = rawMediaRefForCalendarPost(post);
  if (!raw) return preview.url;
  if (looksLikePresignedAwsUrl(raw)) return raw;
  const needsPresign = !/^https?:\/\//i.test(raw) || looksLikeS3HttpUrl(raw);
  if (!needsPresign) return raw;
  return '';
}

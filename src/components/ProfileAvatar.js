import React, { useState } from 'react';
import PlatformIcon from './PlatformIcon';

/**
 * Circular avatar that shows the profile picture fetched from the social platform
 * at OAuth time (stored in social_tokens.profile_image_url, surfaced by
 * /api/social/accounts). Falls back to the platform logo inside a colored ring
 * when the image URL is missing or the load fails — some providers rotate URLs
 * and we don't want broken <img> tags.
 *
 * Props:
 *   imageUrl  — profileImageUrl from the /accounts endpoint (may be null)
 *   platform  — the PLATFORMS entry for coloring + fallback logo
 *   size      — diameter in pixels (default 40)
 *   ringWidth — border width in pixels (default 2)
 */
export default function ProfileAvatar({ imageUrl, platform, size = 40, ringWidth = 2 }) {
  const [failed, setFailed] = useState(false);
  const showImage = imageUrl && !failed;
  const ringColor = platform?.color || '#6366f1';
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      background: showImage ? '#f1f5f9' : `${ringColor}15`,
      border: `${ringWidth}px solid ${ringColor}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {showImage ? (
        <img
          src={imageUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <PlatformIcon platform={platform} size={Math.round(size * 0.55)} />
      )}
    </div>
  );
}

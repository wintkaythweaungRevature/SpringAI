import React from 'react';
import { Helmet } from 'react-helmet';

const DEFAULT = {
  title: 'W!ntAi – AI Chatbot, PDF Extraction & Interview Prep',
  description: 'AI platform for PDF data extraction, interview preparation, image generation, and smart flashcards.',
  image: 'https://wintaibot.com/android-chrome-512x512.png',
  url: 'https://wintaibot.com/',
};

/**
 * SEO component – use for dynamic meta tags when you add routing.
 * For now, index.html handles static SEO. Import this when you have per-page meta.
 */
export default function SEO({ title, description, image, url }) {
  const metaTitle = title ? `${title} | W!ntAi` : DEFAULT.title;
  const metaDesc = description || DEFAULT.description;
  const metaImage = image || DEFAULT.image;
  const metaUrl = url || DEFAULT.url;

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}

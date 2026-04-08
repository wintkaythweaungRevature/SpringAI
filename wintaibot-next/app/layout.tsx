import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

const SITE_URL = 'https://www.wintaibot.com';
const OG_IMAGE = 'https://www.wintaibot.com/android-chrome-512x512.png';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#1e3a8a',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'W!ntAi – Social Media Management & AI Assistant',
    template: '%s | W!ntAi',
  },
  description:
    'Social media management and AI in one place: schedule and publish to Instagram, YouTube, TikTok, and more, plus calendar, inbox, and analytics. Also includes AI for PDFs, documents, transcription, images, and email. Try free trial.',
  keywords: [
    'social media management',
    'social media scheduler',
    'multi-platform publishing',
    'AI PDF analyzer',
    'PDF data extraction',
    'AI document assistant',
    'voice transcription AI',
    'AI image generator',
    'email reply AI',
    'interview prep AI',
    'AI productivity tools',
    'W!ntAi',
  ],
  authors: [{ name: 'Wint Kay Thwe Aung', url: 'https://github.com/wintkaythweaungRevature' }],
  creator: 'Wint Kay Thwe Aung',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'W!ntAi',
    title: 'W!ntAi – Social Media Management & AI Tools',
    description:
      'Manage social media: publish and schedule across platforms, content calendar, inbox, and analytics — plus AI for PDFs, documents, audio, images, and email. Try free trial.',
    images: [
      {
        url: OG_IMAGE,
        width: 512,
        height: 512,
        alt: 'W!ntAi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'W!ntAi – Social Media Management & AI',
    description:
      'Social media management with scheduling and analytics, plus AI for PDFs, audio, images, interviews, and email. Free to start.',
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.json',
  icons: {
    icon: ['/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png'],
    apple: '/apple-touch-icon.png',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

const structuredData = {
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'W!ntAi',
    url: SITE_URL,
    applicationCategory: 'ProductivityApplication',
    applicationSubCategory: 'Social media management software',
    operatingSystem: 'Web',
    description:
      'W!ntAi is a social media management and AI platform: publish and schedule across networks, content calendar, inbox, analytics, and AI tools for PDFs, documents, audio, images, email, and interviews.',
    screenshot: OG_IMAGE,
    featureList: [
      'Social media management and multi-platform publishing',
      'Content calendar and feed scheduling',
      'Unified inbox and engagement analytics',
      'PDF data extraction and analysis',
      'AI document summarization',
      'Voice and audio transcription',
      'AI image generation from text',
      'AI email reply generator',
      'Resume-based interview preparation',
      'AI recipe generator',
      'Video Publisher for social media',
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '19',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
        description: 'Premium AI + Video Publisher limits; annual billing available',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '39',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
        description: 'All platforms, analytics, AI Social Chat; annual billing available',
      },
      {
        '@type': 'Offer',
        name: 'Growth',
        price: '79',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
        description: 'Unlimited videos, priority processing, team seats; annual billing available',
      },
    ],
    creator: {
      '@type': 'Person',
      name: 'Wint Kay Thwe Aung',
      url: 'https://github.com/wintkaythweaungRevature',
    },
    termsOfService: `${SITE_URL}/terms-of-service`,
  },
  webSite: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'W!ntAi',
    url: SITE_URL,
    description:
      'Social media management with publishing, calendar, and analytics — plus AI for PDFs, documents, voice, images, email, and interview prep.',
    termsOfService: `${SITE_URL}/terms-of-service`,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'W!ntAi',
    url: SITE_URL,
    logo: OG_IMAGE,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@wintaibot.com',
      contactType: 'customer support',
    },
    sameAs: [
      'https://github.com/wintkaythweaungRevature',
      'https://x.com/wintaibot',
      'https://www.facebook.com/wintaibot',
      'https://www.linkedin.com/company/wintaibot',
    ],
    privacyPolicy: `${SITE_URL}/privacy-policy`,
  },
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is W!ntAi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'W!ntAi is a social media management and AI platform: plan and publish to major networks, use a content calendar and inbox, track analytics, and use AI for PDFs, documents, audio, images, email, interviews, and recipes — all in one web-based dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is W!ntAi free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The AI chatbot and recipe generator are completely free. Paid plans start at $19/month (Starter) with Pro ($39) and Growth ($79); annual discounts apply.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file types does W!ntAi support for PDF analysis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "W!ntAi's DocuWizard supports PDF, Excel (.xlsx, .xls), and Word (.docx) files for data extraction and analysis.",
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my W!ntAi subscription?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, you can cancel your subscription at any time from Account Settings. You keep full access until the end of your current billing period.',
        },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.wintaibot.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.softwareApplication) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.webSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faqPage) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

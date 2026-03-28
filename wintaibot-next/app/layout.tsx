import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

const SITE_URL = 'https://www.wintaibot.com';
const OG_IMAGE = 'https://www.wintaibot.com/android-chrome-512x512.png';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e3a8a',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Wintaibot – AI Assistant for PDF Analysis, Documents & Productivity',
    template: '%s | Wintaibot',
  },
  description:
    'Wintaibot is an AI assistant that analyzes PDFs, extracts data from documents, transcribes audio, generates images, writes emails, and prepares you for interviews. Start free.',
  keywords: [
    'AI PDF analyzer',
    'PDF data extraction',
    'AI document assistant',
    'voice transcription AI',
    'AI image generator',
    'email reply AI',
    'interview prep AI',
    'AI productivity tools',
    'Wintaibot',
  ],
  authors: [{ name: 'Wint Kay Thwe Aung', url: 'https://github.com/wintkaythweaungRevature' }],
  creator: 'Wint Kay Thwe Aung',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Wintaibot',
    title: 'Wintaibot – AI Assistant for PDF Analysis & Documents',
    description:
      'Analyze PDFs, extract document data, transcribe audio, generate images, and automate email replies — all in one AI platform. Start free.',
    images: [
      {
        url: OG_IMAGE,
        width: 512,
        height: 512,
        alt: 'Wintaibot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wintaibot – AI Assistant for PDFs & Documents',
    description:
      'Analyze PDFs, transcribe audio, generate images, prep for interviews, and automate email replies with Wintaibot AI. Free to start.',
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
    name: 'Wintaibot',
    url: SITE_URL,
    applicationCategory: 'ProductivityApplication',
    applicationSubCategory: 'AI Assistant',
    operatingSystem: 'Web',
    description:
      'Wintaibot is an AI assistant that analyzes PDFs, extracts document data, transcribes audio, generates images, writes email replies, and prepares users for job interviews.',
    screenshot: OG_IMAGE,
    featureList: [
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
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: 'Includes AI chatbot and recipe generator',
      },
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
  },
  webSite: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wintaibot',
    url: SITE_URL,
    description:
      'AI assistant for PDF analysis, document extraction, voice transcription, image generation, email writing, and interview preparation.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wintaibot',
    url: SITE_URL,
    logo: OG_IMAGE,
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@wintaibot.com',
      contactType: 'customer support',
    },
    sameAs: ['https://github.com/wintkaythweaungRevature'],
  },
  faqPage: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Wintaibot?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Wintaibot is an AI assistant platform that helps you analyze PDFs, extract document data, transcribe audio, generate images, write email replies, prepare for job interviews, and plan meals — all in one web-based dashboard.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Wintaibot free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The AI chatbot and recipe generator are completely free. Paid plans start at $19/month (Starter) with Pro ($39) and Growth ($79); annual discounts apply.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file types does Wintaibot support for PDF analysis?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Wintaibot's DocuWizard supports PDF, Excel (.xlsx, .xls), and Word (.docx) files for data extraction and analysis.",
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my Wintaibot subscription?',
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

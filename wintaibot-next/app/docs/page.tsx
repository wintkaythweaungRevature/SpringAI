import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'W!ntAi Docs | Guides, APIs, and Best Practices',
  description:
    'Explore W!ntAi documentation: quick start guides, feature docs, tool workflows, publishing setup, analytics playbooks, security, and troubleshooting.',
  alternates: {
    canonical: 'https://wintaibot.com/docs',
  },
  openGraph: {
    title: 'W!ntAi Docs | Guides, APIs, and Best Practices',
    description:
      'Learn how to use W!ntAi tools from setup to advanced automation workflows.',
    url: 'https://wintaibot.com/docs',
    type: 'website',
  },
};

const sections = [
  {
    title: 'Quick Start',
    items: [
      'Create your account and verify your email.',
      'Connect social channels to unlock publishing and analytics.',
      'Choose your first tool and run a guided starter workflow.',
      'Save templates so your team can reuse prompts and settings.',
    ],
  },
  {
    title: 'Core Workflows',
    items: [
      'Ask AI: research topics, draft content, and rewrite in your voice.',
      'DocuWizard: upload PDFs/Docs and extract summaries or action items.',
      'EchoScribe: transcribe recordings, then convert transcripts into posts.',
      'Video Publisher: create channel-specific variants and schedule publishing.',
    ],
  },
  {
    title: 'Growth and Automation',
    items: [
      'Use Social Autopilot to track performance by post type and time.',
      'Enable auto-replies for comments with keyword and sentiment rules.',
      'Build a content calendar from trend signals and top performer history.',
      'Measure link-in-bio clickthrough and iterate weekly with analytics.',
    ],
  },
  {
    title: 'Security and Account',
    items: [
      'Manage sessions, password resets, and account recovery options.',
      'Review data handling and retention controls for uploaded media.',
      'Set workspace access, collaborator roles, and approval policies.',
      'Configure notification preferences for events that matter.',
    ],
  },
];

const faqs = [
  {
    q: 'Do I need separate credentials for each platform?',
    a: 'Yes. Each social network requires its own OAuth connection so W!ntAi can publish and read analytics on your behalf.',
  },
  {
    q: 'Can I review AI output before it is posted?',
    a: 'Yes. Captions, hashtags, and scheduling settings are editable before publishing. You can also set workflows that require approval.',
  },
  {
    q: 'How often are analytics refreshed?',
    a: 'Most metrics refresh throughout the day. Exact refresh cadence depends on each platform API and the data type requested.',
  },
  {
    q: 'Is there a free plan for testing?',
    a: 'Yes. You can start with free features and upgrade when you need advanced automations and member tools.',
  },
];

export default function DocsPage() {
  return (
    <main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 20px 72px' }}>
      <section style={{ textAlign: 'center', padding: '24px 0 28px' }}>
        <p style={{ color: '#1d4ed8', fontWeight: 700, marginBottom: 10 }}>
          Documentation
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', margin: '0 0 14px' }}>
          Build Faster With W!ntAi Docs
        </h1>
        <p style={{ maxWidth: 760, margin: '0 auto', color: '#475569', lineHeight: 1.7 }}>
          Find implementation guides, product references, and practical walkthroughs for
          publishing, analytics, automation, and AI-assisted content operations.
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            marginTop: 22,
            flexWrap: 'wrap',
          }}
        >
          <Link href="/features" style={buttonPrimary}>
            Explore Features
          </Link>
          <Link href="/tools" style={buttonSecondary}>
            Browse Tools
          </Link>
        </div>
      </section>

      <section style={gridStyle}>
        {sections.map((section) => (
          <article key={section.title} style={cardStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 10, fontSize: 22 }}>{section.title}</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#475569', lineHeight: 1.8 }}>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: 30, marginBottom: 12 }}>Platform Guides</h2>
        <p style={{ color: '#475569', lineHeight: 1.7 }}>
          The documentation is organized around outcomes. Choose a guide based on your goal:
          create better content faster, automate repetitive social tasks, or improve ROI using
          unified analytics and trend insights.
        </p>
        <div style={guideGridStyle}>
          <div style={guideCardStyle}>
            <h3>Content Production</h3>
            <p>
              Prompt patterns, editing checkpoints, and quality-review loops for building repeatable
              content systems with Ask AI, Image Generator, and Reply Enchanter.
            </p>
          </div>
          <div style={guideCardStyle}>
            <h3>Publishing Operations</h3>
            <p>
              End-to-end workflows for multi-platform posting, thumbnail selection, scheduling logic,
              and exception handling when APIs reject media formats.
            </p>
          </div>
          <div style={guideCardStyle}>
            <h3>Performance Optimization</h3>
            <p>
              KPI setup, benchmark templates, and weekly review cadences to identify winning formats,
              posting windows, and audience segments.
            </p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 44 }}>
        <h2 style={{ fontSize: 30, marginBottom: 12 }}>Frequently Asked Questions</h2>
        <div style={{ display: 'grid', gap: 14 }}>
          {faqs.map((faq) => (
            <article key={faq.q} style={faqCardStyle}>
              <h3 style={{ margin: '0 0 6px' }}>{faq.q}</h3>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.7 }}>{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 20,
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const guideGridStyle = {
  marginTop: 16,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 14,
};

const guideCardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 18,
  lineHeight: 1.7,
  color: '#475569',
};

const faqCardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: 14,
  padding: 18,
};

const buttonPrimary = {
  background: '#2563eb',
  color: '#ffffff',
  borderRadius: 10,
  fontWeight: 700,
  textDecoration: 'none',
  padding: '10px 18px',
};

const buttonSecondary = {
  border: '1px solid #cbd5e1',
  color: '#0f172a',
  borderRadius: 10,
  fontWeight: 700,
  textDecoration: 'none',
  padding: '10px 18px',
};

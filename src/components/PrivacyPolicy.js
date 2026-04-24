import React from 'react';

const styles = {
  page: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    background: '#f8fafc',
    minHeight: '100vh',
    color: '#1e293b',
    lineHeight: 1.7,
  },
  header: {
    background: '#0f172a',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  logo: { color: '#fff', fontSize: '1.25rem', fontWeight: 800, textDecoration: 'none' },
  back: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
  },
  main: { maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' },
  h1: { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' },
  updated: { fontSize: '14px', color: '#64748b', marginBottom: '32px' },
  h2: { fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '28px', marginBottom: '10px' },
  p: { marginBottom: '14px', fontSize: '15px', color: '#334155' },
  ul: { marginBottom: '14px', paddingLeft: '24px' },
  li: { marginBottom: '6px', fontSize: '15px', color: '#334155' },
};

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo}>W!ntAi</a>
        <a href="/" style={styles.back}>← Back to home</a>
      </header>
      <main style={styles.main}>
        <h1 style={styles.h1}>W!ntAi Privacy Policy</h1>
        <p style={styles.updated}>Last updated: April 2026</p>

        <p style={styles.p}>
          This Privacy Policy applies to <strong>W!ntAi</strong>, a social-media publishing
          and AI-assisted commenting application operated by W!ntAi ("we", "our", or "us") at
          https://www.wintaibot.com (the "Site"). It also covers the W!ntAi integrations registered with
          third-party platforms including TikTok, Meta (Facebook and Instagram), YouTube, LinkedIn, and X (Twitter).
          This page informs you of our policies regarding the collection, use, and disclosure of personal
          information when you use the W!ntAi service.
        </p>

        <h2 style={styles.h2}>Information We Collect</h2>
        <p style={styles.p}>
          When you use W!ntAi, we may collect:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Account information (email address, name) when you register</li>
          <li style={styles.li}>Usage data (how you use our AI tools, such as prompts and file uploads) to provide and improve the service</li>
          <li style={styles.li}>Payment and subscription information when you subscribe (processed by Stripe; we do not store full card numbers)</li>
          <li style={styles.li}>Log data (IP address, browser type, access times) for security and operations</li>
        </ul>

        <h2 style={styles.h2}>How We Use Your Information</h2>
        <p style={styles.p}>
          We use the information we collect to provide, maintain, and improve W!ntAi; to process your account and subscription; to send you service-related communications; and to comply with legal obligations. We may use aggregated, non-personally identifiable data for analytics and product improvement.
        </p>

        <h2 style={styles.h2}>Data Sharing and Third Parties</h2>
        <p style={styles.p}>
          We do not sell your personal information. We may share data with:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Service providers (e.g., hosting, payment processing, email) who assist in operating our service, under strict confidentiality</li>
          <li style={styles.li}>AI providers used to power our tools (e.g., for processing prompts and generating responses), in accordance with their privacy policies</li>
          <li style={styles.li}>Law enforcement or regulators when required by law or to protect our rights and safety</li>
        </ul>

        <h2 style={styles.h2}>TikTok Integration</h2>
        <p style={styles.p}>
          When you connect your TikTok account to W!ntAi, you authorize W!ntAi to access certain data through
          the TikTok Login Kit and TikTok Display API on your behalf. Specifically, W!ntAi may access:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Your basic TikTok profile information (open ID, display name, avatar URL)</li>
          <li style={styles.li}>A list of your public videos and their metadata (caption, share URL, cover image, view/like/comment counts)</li>
          <li style={styles.li}>Comments on your TikTok videos, so W!ntAi can display them in your inbox and allow you to reply</li>
        </ul>
        <p style={styles.p}>
          W!ntAi uses TikTok data solely to provide the publishing, analytics, and AI auto-reply features you
          have enabled inside the W!ntAi dashboard. W!ntAi does not sell, rent, or share your TikTok data with
          unrelated third parties. You may revoke W!ntAi's access to your TikTok account at any time from your
          TikTok account settings (Settings &amp; privacy → Security and login → Manage app permissions) or by
          disconnecting TikTok inside the W!ntAi dashboard. W!ntAi's use and transfer of information received
          from TikTok APIs adheres to the TikTok Developer Terms of Service and Developer Policy.
        </p>

        <h2 style={styles.h2}>Meta (Facebook and Instagram) Integration</h2>
        <p style={styles.p}>
          When you connect your Facebook Page or Instagram Business account to W!ntAi, W!ntAi accesses your
          Page metadata, post and comment data, and the access tokens necessary to publish replies through the
          Meta Graph API. W!ntAi uses this data only to power the inbox, analytics, and auto-reply features.
          You can revoke access at any time from Facebook Settings → Business Integrations.
        </p>

        <h2 style={styles.h2}>Data Retention and Security</h2>
        <p style={styles.p}>
          We retain your account and usage data for as long as your account is active or as needed to provide the service and fulfill legal obligations. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, or loss.
        </p>

        <h2 style={styles.h2}>Your Rights</h2>
        <p style={styles.p}>
          Depending on your location, you may have the right to access, correct, delete, or port your personal data, or to object to or restrict certain processing. You can update your account details and subscription in Account Settings. To exercise other rights or request deletion of your account, contact us at the email below.
        </p>

        <h2 style={styles.h2}>Cookies and Similar Technologies</h2>
        <p style={styles.p}>
          We use cookies and similar technologies to keep you logged in, remember preferences, and analyze usage. You can control cookies through your browser settings.
        </p>

        <h2 style={styles.h2}>Children</h2>
        <p style={styles.p}>
          W!ntAi is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us and we will delete it.
        </p>

        <h2 style={styles.h2}>Changes to This Policy</h2>
        <p style={styles.p}>
          We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. Continued use of the service after changes constitutes acceptance of the updated policy.
        </p>

        <h2 style={styles.h2}>Contact Us</h2>
        <p style={styles.p}>
          For questions about this Privacy Policy or your personal data, contact us at <a href="mailto:contact@wintaibot.com" style={{ color: '#2563eb', fontWeight: 600 }}>contact@wintaibot.com</a>.
        </p>
      </main>
    </div>
  );
}

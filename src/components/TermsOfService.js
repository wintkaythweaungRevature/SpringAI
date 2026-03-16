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

export default function TermsOfService() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <a href="/" style={styles.logo}>Wintaibot</a>
        <a href="/" style={styles.back}>← Back to home</a>
      </header>
      <main style={styles.main}>
        <h1 style={styles.h1}>Terms of Service</h1>
        <p style={styles.updated}>Last updated: February 2026</p>

        <p style={styles.p}>
          Welcome to Wintaibot. By accessing or using https://www.wintaibot.com and our AI tools (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service.
        </p>

        <h2 style={styles.h2}>Eligibility and Account</h2>
        <p style={styles.p}>
          You must be at least 13 years old and able to form a binding contract to use the Service. You are responsible for keeping your account credentials secure and for all activity under your account. You must provide accurate and complete registration information.
        </p>

        <h2 style={styles.h2}>Use of the Service</h2>
        <p style={styles.p}>
          You may use Wintaibot only for lawful purposes and in accordance with these Terms. You agree not to:
        </p>
        <ul style={styles.ul}>
          <li style={styles.li}>Use the Service in any way that violates laws or infringes others' rights</li>
          <li style={styles.li}>Upload or transmit harmful, offensive, or illegal content</li>
          <li style={styles.li}>Attempt to gain unauthorized access to the Service, other accounts, or our systems</li>
          <li style={styles.li}>Scrape, reverse-engineer, or automate access in a way that burdens our systems</li>
          <li style={styles.li}>Resell or redistribute the Service or use it to build a competing product without our permission</li>
        </ul>
        <p style={styles.p}>
          We may suspend or terminate your access if you breach these Terms or for other operational or legal reasons.
        </p>

        <h2 style={styles.h2}>Subscription and Payment</h2>
        <p style={styles.p}>
          Paid membership is billed in advance (e.g., monthly) via Stripe. Fees are non-refundable except where required by law or as stated in our refund policy. You may cancel your subscription at any time from Account Settings; access continues until the end of the current billing period. We may change fees with reasonable notice; continued use after a price change constitutes acceptance.
        </p>

        <h2 style={styles.h2}>Intellectual Property and Your Content</h2>
        <p style={styles.p}>
          We grant you a limited, non-exclusive license to use the Service for your personal or internal business use. Wintaibot's name, logo, and the Service are our property. You retain ownership of content you upload or create. By using the Service, you grant us the rights necessary to operate the Service (e.g., to process your prompts and files through our AI tools and to store data as described in our Privacy Policy).
        </p>

        <h2 style={styles.h2}>AI Outputs and Disclaimers</h2>
        <p style={styles.p}>
          Our AI tools generate content based on your inputs. We do not guarantee the accuracy, completeness, or suitability of AI-generated content. You are responsible for reviewing and verifying outputs before relying on them. Do not use AI outputs for critical decisions (e.g., legal, medical, or financial) without human review.
        </p>

        <h2 style={styles.h2}>Disclaimer of Warranties</h2>
        <p style={styles.p}>
          The Service is provided "as is" and "as available." We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose. We do not warrant that the Service will be uninterrupted, error-free, or secure.
        </p>

        <h2 style={styles.h2}>Limitation of Liability</h2>
        <p style={styles.p}>
          To the maximum extent permitted by law, Wintaibot and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or use, arising from your use of the Service or these Terms. Our total liability shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
        </p>

        <h2 style={styles.h2}>Indemnification</h2>
        <p style={styles.p}>
          You agree to indemnify and hold harmless Wintaibot and its affiliates, officers, and employees from any claims, damages, or expenses (including reasonable attorneys' fees) arising from your use of the Service, your content, or your breach of these Terms.
        </p>

        <h2 style={styles.h2}>Changes to the Terms or Service</h2>
        <p style={styles.p}>
          We may modify these Terms or the Service at any time. We will notify you of material changes by posting updated Terms on this page and updating the "Last updated" date. Your continued use after changes constitutes acceptance. If you do not agree, you must stop using the Service.
        </p>

        <h2 style={styles.h2}>General</h2>
        <p style={styles.p}>
          These Terms constitute the entire agreement between you and Wintaibot regarding the Service. If any provision is found unenforceable, the remaining provisions remain in effect. Our failure to enforce any right does not waive that right. These Terms are governed by the laws of the United States (and the State of Delaware, if applicable), without regard to conflict of law principles.
        </p>

        <h2 style={styles.h2}>Contact</h2>
        <p style={styles.p}>
          For questions about these Terms of Service, contact us at <a href="mailto:contact@wintaibot.com" style={{ color: '#2563eb', fontWeight: 600 }}>contact@wintaibot.com</a>.
        </p>
      </main>
    </div>
  );
}

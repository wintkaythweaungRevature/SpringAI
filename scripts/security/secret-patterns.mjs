/**
 * High-signal patterns for accidental secret commits.
 * Tuned to reduce noise; review each finding — docs may still contain examples.
 */

export const SECRET_PATTERNS = [
  {
    id: 'pem_private_key',
    title: 'PEM / private key material',
    severity: 'critical',
    regex: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/,
  },
  {
    id: 'aws_access_key_id',
    title: 'AWS Access Key ID (AKIA…)',
    severity: 'critical',
    regex: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    id: 'openai_sk',
    title: 'OpenAI-style API key (sk-…)',
    severity: 'critical',
    regex: /\bsk-(?:proj-)?[a-zA-Z0-9]{20,}\b/,
  },
  {
    id: 'github_classic_pat',
    title: 'GitHub classic PAT (ghp_)',
    severity: 'critical',
    regex: /\bghp_[a-zA-Z0-9]{36}\b/,
  },
  {
    id: 'github_fine_pat',
    title: 'GitHub fine-grained PAT (github_pat_)',
    severity: 'critical',
    regex: /\bgithub_pat_[a-zA-Z0-9_]{20,}\b/,
  },
  {
    id: 'slack_token',
    title: 'Slack token (xoxb-/xoxp-)',
    severity: 'critical',
    regex: /\bxox[abpr]-[a-zA-Z0-9-]{10,}\b/,
  },
  {
    id: 'stripe_live',
    title: 'Stripe live secret',
    severity: 'critical',
    regex: /\bsk_live_[a-zA-Z0-9]{20,}\b/,
  },
  {
    id: 'google_api_key',
    title: 'Google API key (AIza…)',
    severity: 'high',
    regex: /\bAIza[0-9A-Za-z\-_]{30,}\b/,
  },
  {
    id: 'jwt_like',
    title: 'JWT-like bearer token (eyJ…)',
    severity: 'high',
    regex: /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/,
  },
  {
    id: 'generic_api_assignment',
    title: 'Possible API key assignment',
    severity: 'medium',
    regex: /(?:api[_-]?key|apikey|secret[_-]?key|client[_-]?secret)\s*[:=]\s*['"`][^'"`]{12,}['"`]/i,
  },
  {
    id: 'password_assignment',
    title: 'Possible password in source',
    severity: 'medium',
    regex: /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]{10,}['"`]/i,
  },
];

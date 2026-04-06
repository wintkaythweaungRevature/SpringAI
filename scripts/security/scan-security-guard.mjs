#!/usr/bin/env node
/**
 * SecurityGuard — secrets + safe-code heuristics + npm audit (where package.json exists).
 * Outputs JSON for Defenser handoff and optional Next.js dashboard.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { runSecretScan, defaultRepoRoot } from './scan-runner.mjs';
import { runHeuristicScan } from './heuristics.mjs';

const args = process.argv.slice(2);
function argValue(flag, short) {
  const eq = args.find((a) => a.startsWith(`${flag}=`));
  if (eq) return eq.slice(flag.length + 1);
  const i = args.indexOf(flag);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith('-')) return args[i + 1];
  if (short) {
    const j = args.indexOf(short);
    if (j !== -1 && args[j + 1] && !args[j + 1].startsWith('-')) return args[j + 1];
  }
  return null;
}

const repoRoot = argValue('--root') || defaultRepoRoot();
const resolvedRoot = path.resolve(repoRoot);

function defaultOutPath() {
  const nextPublic = path.join(resolvedRoot, 'wintaibot-next', 'public', 'security-report.json');
  if (fs.existsSync(path.dirname(nextPublic))) return nextPublic;
  return path.join(resolvedRoot, 'reports', 'security', 'security-guard-latest.json');
}

const outPath = path.resolve(resolvedRoot, argValue('--out', '-o') || defaultOutPath());

function npmAuditSummary(cwd) {
  if (!fs.existsSync(path.join(cwd, 'package.json'))) {
    return { skipped: true, reason: 'no package.json' };
  }
  const hasLock = fs.existsSync(path.join(cwd, 'package-lock.json'));
  const auditArgs = hasLock ? ['audit', '--json', '--package-lock-only'] : ['audit', '--json'];
  const isWin = process.platform === 'win32';
  const r = spawnSync(isWin ? 'npm.cmd' : 'npm', auditArgs, {
    cwd,
    encoding: 'utf8',
    shell: isWin,
    maxBuffer: 10 * 1024 * 1024,
  });
  if (r.error || r.status === null) {
    return { error: r.error?.message || 'npm audit failed to run', skipped: true };
  }
  try {
    const data = JSON.parse(r.stdout || '{}');
    const vulns = data.vulnerabilities || {};
    let critical = 0;
    let high = 0;
    let moderate = 0;
    let low = 0;
    for (const v of Object.values(vulns)) {
      const sev = (v.severity || '').toLowerCase();
      if (sev === 'critical') critical += 1;
      else if (sev === 'high') high += 1;
      else if (sev === 'moderate') moderate += 1;
      else if (sev === 'low') low += 1;
    }
    return {
      skipped: false,
      critical,
      high,
      moderate,
      low,
      total: Object.keys(vulns).length,
      metadata: data.metadata || null,
    };
  } catch {
    return { parseError: true, raw: (r.stdout || '').slice(0, 500) };
  }
}

function computeScore(secretFindings, envFiles, heuristics, audits) {
  let score = 100;
  const penalize = (n, w) => {
    score -= n * w;
  };

  for (const f of secretFindings) {
    if (f.severity === 'critical') penalize(1, 18);
    else if (f.severity === 'high') penalize(1, 10);
    else if (f.severity === 'medium') penalize(1, 4);
    else if (f.severity === 'info') penalize(1, 1);
  }
  penalize(envFiles.length, 22);

  for (const h of heuristics) {
    if (h.severity === 'high') penalize(1, 8);
    else if (h.severity === 'medium') penalize(1, 4);
    else penalize(1, 2);
  }

  for (const a of audits) {
    if (!a || a.skipped) continue;
    penalize(a.critical || 0, 6);
    penalize(a.high || 0, 3);
    penalize(a.moderate || 0, 1);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

const secret = runSecretScan(resolvedRoot);
const envFindings = secret.envFiles.map((rel) => ({
  path: rel,
  line: 0,
  patternId: 'dotenv_committed',
  title: 'Environment file in tree — confirm not committed to git; use secrets manager',
  severity: 'critical',
  snippet: rel,
}));
const secretAll = [...secret.findings, ...envFindings];

const heur = runHeuristicScan(resolvedRoot);

const audits = [
  { label: 'root', ...npmAuditSummary(resolvedRoot) },
  { label: 'wintaibot-next', ...npmAuditSummary(path.join(resolvedRoot, 'wintaibot-next')) },
];

const securityScore = computeScore(secretAll, secret.envFiles, heur.findings, audits);

const pillars = {
  authentication: {
    note: 'JWT/session auth, bcrypt passwords, RBAC — verify in backend repo.',
    checklist: ['No passwords in frontend bundles', 'Tokens from httpOnly cookies or secure storage pattern'],
  },
  injectionAndXss: {
    note: 'ORM/parameterized SQL; sanitize HTML; CSRF on cookie sessions.',
    heuristicHits: heur.findings.length,
  },
  apiLayer: {
    note: 'Rate limits, API key rotation, Zod/Joi validation on inputs.',
  },
  secretsManagement: {
    note: 'No live keys in repo; .env + vault; pre-commit secret scan.',
    secretFindings: secretAll.length,
  },
  aiSafety: {
    note: 'Prompt injection filters; output moderation on LLM routes.',
  },
  logging: {
    note: 'Structured logs; alert on abuse patterns; never log secrets.',
  },
};

const report = {
  agent: 'SecurityGuard',
  generatedAt: new Date().toISOString(),
  repoRoot: resolvedRoot,
  securityScore,
  pillars,
  npmAudit: audits,
  secretScan: {
    filesScanned: secret.filesScanned,
    findings: secretAll,
  },
  codeHeuristics: {
    filesScanned: heur.filesScanned,
    findings: heur.findings,
  },
  summary: {
    securityScore,
    secretCritical: secretAll.filter((f) => f.severity === 'critical').length,
    secretHigh: secretAll.filter((f) => f.severity === 'high').length,
    heuristicHigh: heur.findings.filter((f) => f.severity === 'high').length,
    npmCritical: audits.reduce((s, a) => s + (a.critical || 0), 0),
    npmHigh: audits.reduce((s, a) => s + (a.high || 0), 0),
  },
  handoff: {
    nextAgent: 'Defenser',
    instruction:
      'Triage by severity: rotate leaked credentials first. Patch or justify heuristic hits (XSS/eval/SQL). Run npm audit fix / overrides where safe. Re-run npm run security:guard. Coordinate with SecurityGuard on open threads.',
  },
};

try {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n🛡️  SecurityGuard report written: ${outPath}\n`);
} catch (e) {
  console.error('Failed to write report:', e.message);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

console.log(`Security score: ${securityScore} / 100`);
console.log(`Secrets: ${secretAll.length} finding(s), Heuristics: ${heur.findings.length}`);
console.log('→ Next: invoke **Defenser** per handoff.\n');

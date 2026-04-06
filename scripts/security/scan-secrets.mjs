#!/usr/bin/env node
/**
 * SecretLeakReportor — static secret / credential pattern scan.
 * Run locally or in CI. Exit 1 if critical/high findings (excluding markdown-downgraded only).
 */
import fs from 'fs';
import path from 'path';
import { runSecretScan, defaultRepoRoot } from './scan-runner.mjs';

const args = process.argv.slice(2);
const failOnFindings = !args.includes('--no-fail');
const jsonOnly = args.includes('--json');
const rootArg = args.find((a) => a.startsWith('--root='));
const repoRoot = rootArg ? rootArg.slice('--root='.length) : defaultRepoRoot();

const { findings, filesScanned, envFiles } = runSecretScan(repoRoot);

const envFindings = envFiles.map((rel) => ({
  path: rel,
  line: 0,
  patternId: 'dotenv_committed',
  title: 'Environment file may be committed (.env*) — use .env.example + secret manager',
  severity: 'critical',
  snippet: rel,
}));

const all = [...findings, ...envFindings];

const blocking = all.filter((f) => f.severity === 'critical' || f.severity === 'high');

const report = {
  agent: 'SecretLeakReportor',
  generatedAt: new Date().toISOString(),
  repoRoot: path.resolve(repoRoot),
  filesScanned,
  summary: {
    total: all.length,
    critical: all.filter((f) => f.severity === 'critical').length,
    high: all.filter((f) => f.severity === 'high').length,
    medium: all.filter((f) => f.severity === 'medium').length,
    info: all.filter((f) => f.severity === 'info').length,
    envFiles: envFiles.length,
  },
  findings: all,
  handoff: {
    nextAgent: 'CoverKey',
    instruction:
      'Review findings. Rotate any exposed credentials. Replace literals with env vars / secret manager. Add .env* to .gitignore. Re-run: npm run security:scan. Then notify SecretLeakReporter to verify.',
  },
};

if (jsonOnly) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`\n🔍 SecretLeakReportor — scanned ${filesScanned} files\n`);
  if (envFiles.length) {
    console.log('⚠️  Committed-style .env files detected:', envFiles.join(', '));
  }
  console.log(
    `Summary: ${report.summary.critical} critical, ${report.summary.high} high, ${report.summary.medium} medium, ${report.summary.info} info\n`
  );
  for (const f of all.slice(0, 80)) {
    console.log(`[${f.severity.toUpperCase()}] ${f.path}:${f.line} — ${f.title}`);
    if (f.snippet) console.log(`    ${f.snippet.trim()}`);
  }
  if (all.length > 80) console.log(`\n… and ${all.length - 80} more (use --json for full report)\n`);
  console.log(`→ Next: invoke **CoverKey** per handoff in report.\n`);
}

const outDir = path.join(repoRoot, 'reports', 'security');
try {
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'secret-leak-latest.json'), JSON.stringify(report, null, 2), 'utf8');
} catch {
  /* optional */
}

if (failOnFindings && blocking.length > 0) {
  console.error(`\n❌ SecretLeakReportor: ${blocking.length} critical/high finding(s). Fix with CoverKey or use --no-fail for CI artifact-only.\n`);
  process.exit(1);
}

process.exit(0);

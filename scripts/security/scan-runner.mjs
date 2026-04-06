import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SECRET_PATTERNS } from './secret-patterns.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'build',
  'dist',
  '.next',
  'coverage',
  'target',
  '.turbo',
  'out',
  '.cache',
  '.claude',
]);

const SKIP_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.ico',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.mp4',
  '.webm',
  '.mov',
  '.lock', // lockfiles: huge, low signal for regex secrets
]);

const MAX_FILE_BYTES = 800_000;

function shouldSkipFile(relPath, name) {
  const ext = path.extname(name).toLowerCase();
  if (SKIP_EXT.has(ext)) return true;
  if (name === 'package-lock.json' || name === 'yarn.lock' || name === 'pnpm-lock.yaml') return true;
  return false;
}

function walk(dir, root, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    if (e.isDirectory()) {
      walk(full, root, out);
    } else if (e.isFile()) {
      if (shouldSkipFile(rel, e.name)) continue;
      try {
        const st = fs.statSync(full);
        if (st.size > MAX_FILE_BYTES) continue;
      } catch {
        continue;
      }
      out.push({ full, rel });
    }
  }
}

function severityInMarkdown(sev) {
  return sev === 'critical' || sev === 'high' ? 'info' : sev;
}

/**
 * @param {string} repoRoot
 * @returns {{ findings: object[], filesScanned: number, envFiles: string[] }}
 */
export function runSecretScan(repoRoot) {
  const root = path.resolve(repoRoot);
  const files = [];
  walk(root, root, files);

  /** @type {{ path: string, line: number, patternId: string, title: string, severity: string, snippet: string }[]} */
  const findings = [];
  const envFiles = [];

  for (const { full, rel } of files) {
    const base = path.basename(full);
    if (base === '.env' || (base.startsWith('.env.') && !base.endsWith('.example') && !base.endsWith('.sample'))) {
      envFiles.push(rel);
    }

    let content;
    try {
      content = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    if (/[\x00-\x08\x0e-\x1f]/.test(content.slice(0, 2000))) continue;

    const isMd = rel.toLowerCase().endsWith('.md');
    const lines = content.split(/\r?\n/);

    for (const pat of SECRET_PATTERNS) {
      let lineNo = 0;
      for (const line of lines) {
        lineNo += 1;
        if (!pat.regex.test(line)) continue;
        let severity = pat.severity;
        if (isMd) severity = severityInMarkdown(severity);
        findings.push({
          path: rel,
          line: lineNo,
          patternId: pat.id,
          title: pat.title,
          severity,
          snippet: line.length > 200 ? `${line.slice(0, 200)}…` : line,
        });
        pat.regex.lastIndex = 0;
      }
    }
  }

  return { findings, filesScanned: files.length, envFiles };
}

export function defaultRepoRoot() {
  return path.resolve(__dirname, '..', '..');
}

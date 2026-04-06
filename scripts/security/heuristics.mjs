import fs from 'fs';
import path from 'path';

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

const CODE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue']);

const HEURISTICS = [
  {
    id: 'dangerously_set_inner_html',
    title: 'dangerouslySetInnerHTML (XSS risk — sanitize / trust boundary)',
    severity: 'medium',
    regex: /dangerouslySetInnerHTML\s*:/,
  },
  {
    id: 'eval_call',
    title: 'eval() usage (code injection risk)',
    severity: 'high',
    regex: /\beval\s*\(/,
  },
  {
    id: 'document_write',
    title: 'document.write (XSS / perf smell)',
    severity: 'low',
    regex: /\bdocument\.write\s*\(/,
  },
  {
    id: 'raw_sql_template',
    title: 'Possible raw SQL with template literal (verify parameterization)',
    severity: 'medium',
    regex: /(?:query|execute)\s*\(\s*`[^`]*\$\{/i,
  },
];

function walkCodeFiles(dir, root, out) {
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
    if (e.isDirectory()) walkCodeFiles(full, root, out);
    else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (!CODE_EXT.has(ext)) continue;
      if (full.includes(`${path.sep}scripts${path.sep}security${path.sep}`)) continue;
      out.push({ full, rel });
    }
  }
}

/**
 * @param {string} repoRoot
 */
export function runHeuristicScan(repoRoot) {
  const root = path.resolve(repoRoot);
  const files = [];
  walkCodeFiles(root, root, files);

  /** @type {object[]} */
  const findings = [];

  for (const { full, rel } of files) {
    let content;
    try {
      content = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split(/\r?\n/);
    for (const h of HEURISTICS) {
      let lineNo = 0;
      for (const line of lines) {
        lineNo += 1;
        if (!h.regex.test(line)) continue;
        findings.push({
          path: rel,
          line: lineNo,
          heuristicId: h.id,
          title: h.title,
          severity: h.severity,
          snippet: line.length > 180 ? `${line.slice(0, 180)}…` : line,
        });
        h.regex.lastIndex = 0;
      }
    }
  }

  return { findings, filesScanned: files.length };
}

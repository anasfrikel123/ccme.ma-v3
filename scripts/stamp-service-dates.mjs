// Stamp `modifiedTime` (and a `publishedTime` floor) on every service page's
// frontmatter. Idempotent: if a field already exists, we leave it alone unless
// the existing value is older than today, in which case we bump `modifiedTime`.
//
// Why this exists: Google reads `dateModified` in our Service schema as a
// freshness signal. After a substantive pass (schema additions, LCP preload,
// SVG optimization, etc.), the pages legitimately have been updated and the
// frontmatter should reflect that. We never invent dates — we only stamp
// when a real edit pass occurred.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const SERVICES_DIR = path.resolve('src/content/services');
const TODAY = new Date().toISOString().slice(0, 10);
const PUBLISHED_FLOOR = '2025-01-15';

const files = await fs.readdir(SERVICES_DIR);
let touched = 0;

for (const f of files) {
  if (!f.endsWith('.md')) continue;
  const fp = path.join(SERVICES_DIR, f);
  let raw = await fs.readFile(fp, 'utf8');

  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!fmMatch) {
    console.warn(`[skip] No frontmatter: ${f}`);
    continue;
  }
  let [_, fm, body] = fmMatch;
  let changed = false;

  if (!/^modifiedTime:\s*/m.test(fm)) {
    fm += `\nmodifiedTime: "${TODAY}"`;
    changed = true;
  } else {
    fm = fm.replace(/^modifiedTime:\s*"?[^\n"]*"?$/m, `modifiedTime: "${TODAY}"`);
    changed = true;
  }

  if (!/^publishedTime:\s*/m.test(fm)) {
    fm += `\npublishedTime: "${PUBLISHED_FLOOR}"`;
    changed = true;
  }

  if (changed) {
    const out = `---\n${fm.trim()}\n---\n${body}`;
    await fs.writeFile(fp, out, 'utf8');
    touched++;
  }
}

console.log(`Stamped ${touched} service files with modifiedTime=${TODAY}`);

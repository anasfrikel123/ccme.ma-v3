// Reports SEO metadata length issues:
//   - titles longer than 60 chars after the " — CCME" suffix
//   - descriptions outside the 70–160 char band (too short, may auto-rewrite;
//     too long, will be truncated in SERPs)
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function walk(d, acc = []) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    const s = statSync(f);
    if (s.isDirectory()) walk(f, acc);
    else if (/\.(astro|md)$/.test(f)) acc.push(f);
  }
  return acc;
}

// Match `title:` or `title=` followed by a string. The string respects its
// opening quote so apostrophes inside French copy do not terminate the match.
const titleRe = /(?:^|[\s>])title\s*[:=]\s*("([^"\n]+)"|'([^'\n]+)'|`([^`\n]+)`)/gm;
const descRe = /(?:^|[\s>])description\s*[:=]\s*("([^"\n]+)"|'([^'\n]+)'|`([^`\n]+)`)/gm;
const pickGroup = (m) => m[2] || m[3] || m[4] || '';

const longTitles = [];
const longDescs = [];
const shortDescs = [];

for (const f of walk('src')) {
  const t = readFileSync(f, 'utf8');
  for (const m of t.matchAll(titleRe)) {
    const title = pickGroup(m).trim();
    if (!title || title.length < 5) continue;
    const full = title.includes('CCME') ? title : `${title} — CCME`;
    if (full.length > 60) longTitles.push({ f, len: full.length, title: full });
  }
  for (const m of t.matchAll(descRe)) {
    const desc = pickGroup(m).trim();
    if (!desc || desc.length < 5) continue;
    if (desc.length > 160) longDescs.push({ f, len: desc.length, desc });
    else if (desc.length < 70) shortDescs.push({ f, len: desc.length, desc });
  }
}

let errors = 0;
function report(label, list, sortFn) {
  if (list.length === 0) return;
  list.sort(sortFn);
  console.log(`\n${label}:`);
  for (const o of list) {
    const file = o.f.replace(/^src[\\/]/, '');
    console.log(`  [${o.len}] ${file}  →  ${(o.title || o.desc).slice(0, 90)}${(o.title || o.desc).length > 90 ? '…' : ''}`);
  }
  errors += list.length;
}

report('Titles > 60 chars (truncated in SERP)', longTitles, (a, b) => b.len - a.len);
report('Descriptions > 160 chars (truncated)', longDescs, (a, b) => b.len - a.len);
report('Descriptions < 70 chars (Google may rewrite)', shortDescs, (a, b) => a.len - b.len);

if (errors === 0) {
  console.log('All meta titles & descriptions are within SERP-friendly windows.');
} else {
  console.log(`\nTotal issues: ${errors}`);
  // Treat as advisory only unless --strict or STRICT_META=1 (CI / production build).
  if (process.argv.includes('--strict') || process.env.STRICT_META === '1') {
    process.exit(1);
  }
}

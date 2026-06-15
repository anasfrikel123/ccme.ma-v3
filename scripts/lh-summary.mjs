// Summarises Lighthouse JSON reports in .lighthouseci/ and prints a Markdown table.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.lighthouseci';
const files = readdirSync(DIR).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));

const rows = [];
for (const f of files) {
  const data = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  const url = data.requestedUrl || data.finalUrl;
  const cats = data.categories || {};
  const audits = data.audits || {};
  const score = (k) => Math.round((cats[k]?.score ?? 0) * 100);
  rows.push({
    url,
    perf: score('performance'),
    a11y: score('accessibility'),
    bp: score('best-practices'),
    seo: score('seo'),
    fcp: audits['first-contentful-paint']?.displayValue || '?',
    lcp: audits['largest-contentful-paint']?.displayValue || '?',
    cls: audits['cumulative-layout-shift']?.displayValue || '?',
    tbt: audits['total-blocking-time']?.displayValue || '?',
    si: audits['speed-index']?.displayValue || '?',
    failedSeoAudits: Object.values(audits)
      .filter((a) => a.score !== null && a.score < 1 && a.id?.startsWith('seo'))
      .map((a) => a.title),
    failedA11yAudits: Object.values(audits)
      .filter((a) => a.score !== null && a.score < 1 && (cats.accessibility?.auditRefs || []).some((r) => r.id === a.id))
      .map((a) => `${a.title}${a.scoreDisplayMode === 'numeric' ? '' : ''}`),
  });
}

const fmt = (n) => (n >= 90 ? `**${n}** ✅` : n >= 75 ? `${n} 🟡` : `${n} 🔴`);

console.log(`| Page | Perf | A11y | BP | SEO | FCP | LCP | CLS | TBT | SI |`);
console.log(`|---|---:|---:|---:|---:|---|---|---|---|---|`);
for (const r of rows) {
  const path = r.url.replace('https://ccme.ma', '') || '/';
  console.log(`| \`${path}\` | ${fmt(r.perf)} | ${fmt(r.a11y)} | ${fmt(r.bp)} | ${fmt(r.seo)} | ${r.fcp} | ${r.lcp} | ${r.cls} | ${r.tbt} | ${r.si} |`);
}

console.log('');
console.log('## Failed audits (top issues)');
console.log('');
for (const r of rows) {
  const issues = [...new Set([...r.failedSeoAudits, ...r.failedA11yAudits])];
  if (issues.length === 0) continue;
  console.log(`**${r.url.replace('https://ccme.ma', '') || '/'}**:`);
  for (const i of issues.slice(0, 10)) console.log(`  - ${i}`);
  console.log('');
}

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.lighthouseci';
const files = readdirSync(DIR).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));

const filterCategory = process.argv[2]; // perf | a11y | bp | seo | undefined
const CAT_MAP = { perf: 'performance', a11y: 'accessibility', bp: 'best-practices', seo: 'seo' };
const wantCat = filterCategory ? CAT_MAP[filterCategory] : null;

for (const f of files) {
  const data = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  const url = (data.requestedUrl || data.finalUrl).replace('https://ccme.ma', '') || '/';
  console.log(`\n=== ${url} ===`);

  const cats = data.categories || {};
  const auditRefs = wantCat
    ? cats[wantCat]?.auditRefs || []
    : Object.values(cats).flatMap((c) => c.auditRefs || []);

  const seen = new Set();
  for (const ref of auditRefs) {
    const id = ref.id;
    if (seen.has(id)) continue;
    seen.add(id);
    const a = data.audits?.[id];
    if (!a || a.score === null || a.score === 1) continue;
    if (a.scoreDisplayMode === 'manual' || a.scoreDisplayMode === 'notApplicable') continue;
    const score = a.score == null ? '?' : Math.round(a.score * 100);
    console.log(`\n[${id}] (${score}/100) ${a.title}`);
    if (a.displayValue) console.log(`  → ${a.displayValue}`);
    const items = a.details?.items || [];
    for (const it of items.slice(0, 4)) {
      const node = it.node || {};
      const snippet = (node.snippet || node.nodeLabel || it.url || JSON.stringify(it)).slice(0, 220);
      console.log(`  - ${snippet.replace(/\s+/g, ' ').trim()}`);
    }
    if (items.length > 4) console.log(`  ...and ${items.length - 4} more`);
  }
}

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.lighthouseci';
const files = readdirSync(DIR).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));

for (const f of files) {
  const data = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  const url = (data.requestedUrl || data.finalUrl).replace('https://ccme.ma', '') || '/';
  const a = data.audits?.['color-contrast'];
  if (!a || a.score === 1) continue;
  console.log(`\n=== ${url} ===`);
  for (const it of (a.details?.items || []).slice(0, 8)) {
    console.log(`  snippet: ${(it.node?.snippet || '').slice(0, 120)}`);
    console.log(`  selector: ${it.node?.selector}`);
    console.log(`  explanation: ${it.node?.explanation}`);
    console.log('');
  }
}

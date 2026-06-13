#!/usr/bin/env node
/**
 * One-shot cleanup: when `auto-internal-links.mjs` was invoked twice before
 * the idempotency fix landed, some files ended up with the same target URL
 * linked from two different places in prose. Per AI-Mode SEO research,
 * piling identical links into the same body adds no topical signal — keep
 * the FIRST occurrence and revert subsequent ones to plain text.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'src/content');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

let touched = 0, removed = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  // Match every `[label](/internal/path)` occurrence, group by target URL,
  // unlink the second+ occurrences (replace with the bare label).
  const seen = new Set();
  let changed = false;
  src = src.replace(/\[([^\]\n]+)\]\((\/[^)\s]+)\)/g, (full, label, target) => {
    if (seen.has(target)) {
      changed = true;
      removed++;
      return label;
    }
    seen.add(target);
    return full;
  });
  if (changed) {
    fs.writeFileSync(file, src, 'utf8');
    touched++;
    console.log('  ~ ' + path.relative(process.cwd(), file));
  }
}
console.log(`\nDe-duplicated ${removed} repeat link(s) across ${touched} file(s).`);

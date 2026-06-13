// Validates that every image-like path referenced from src/ exists in public/.
// Usage: node scripts/check-image-refs.mjs
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const SRC = 'src';
const PUB = 'public';
const EXT = new Set(['.astro', '.md', '.ts', '.tsx', '.js', '.mjs', '.json']);
const IMG_RE = /(?:src=["']|heroImage\s*:\s*["']?|image\s*:\s*["']?|content=["'])(\/[^"'\s)]+\.(?:png|jpg|jpeg|webp|svg|gif|ico|avif))/gi;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (EXT.has(extname(full))) acc.push(full);
  }
  return acc;
}

const files = walk(SRC);
const missing = new Map();
for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  for (const m of txt.matchAll(IMG_RE)) {
    const ref = m[1];
    const onDisk = join(PUB, ref);
    if (!existsSync(onDisk)) {
      if (!missing.has(ref)) missing.set(ref, []);
      missing.get(ref).push(f);
    }
  }
}

if (missing.size === 0) {
  console.log(`OK — all ${files.length} files reference existing images.`);
} else {
  console.error(`Missing ${missing.size} image reference(s):`);
  for (const [ref, srcs] of missing) {
    console.error(`  ${ref}`);
    for (const s of srcs.slice(0, 3)) console.error(`    ← ${s}`);
    if (srcs.length > 3) console.error(`    ← (+${srcs.length - 3} more)`);
  }
  process.exit(1);
}

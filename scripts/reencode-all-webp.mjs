// Re-encode every public/images/**/*.webp from its sibling .jpg at q=78 effort=6.
// The gemini-image pipeline produces webp at q=86 which can be HEAVIER than the
// JPG it shadows, defeating the <picture> WebP swap. This script normalises them.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, statSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public', 'images');

function* walk(d) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    const s = statSync(f);
    if (s.isDirectory()) yield* walk(f);
    else yield f;
  }
}

let processed = 0;
let savedBytes = 0;
for (const f of walk(ROOT)) {
  if (!/\.jpg$/i.test(f)) continue;
  const webpPath = f.replace(/\.jpg$/i, '.webp');
  if (!existsSync(webpPath)) continue;

  const beforeWebp = statSync(webpPath).size;
  await sharp(f).webp({ quality: 78, effort: 6 }).toFile(webpPath);
  const afterWebp = statSync(webpPath).size;
  savedBytes += beforeWebp - afterWebp;
  processed += 1;
}

console.log(`Re-encoded ${processed} .webp files. Net saved: ${(savedBytes / 1024).toFixed(1)} KB.`);

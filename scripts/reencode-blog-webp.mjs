// Re-encode blog hero .webp files from the source .jpg at sane quality.
// Runs once; produces images smaller than the JPEG source so a <picture> swap is worthwhile.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const blogDir = join(__dirname, '..', 'public', 'images', 'blog');

const files = readdirSync(blogDir).filter(f => f.endsWith('.jpg'));

let total = 0;
for (const jpg of files) {
  const base = jpg.replace(/\.jpg$/, '');
  const inPath = join(blogDir, jpg);
  const outPath = join(blogDir, `${base}.webp`);
  // q=78 effort=6 typically beats jpeg q=85 for photographic content by 20-30%.
  await sharp(inPath).webp({ quality: 78, effort: 6 }).toFile(outPath);
  total += 1;
}
console.log(`Re-encoded ${total} blog .webp files.`);

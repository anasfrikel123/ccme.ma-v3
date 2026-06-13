/** Generate responsive hero AVIF/WebP variants from public/images/hero.jpg. */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'public', 'images', 'hero.jpg');
const OUT = path.join(__dirname, '..', 'public', 'images');

const WIDTHS = [360, 720, 1200];

for (const w of WIDTHS) {
  const webp = path.join(OUT, `hero-${w}.webp`);
  const avif = path.join(OUT, `hero-${w}.avif`);
  await sharp(SRC).resize(w, null, { withoutEnlargement: true }).webp({ quality: 78, effort: 6 }).toFile(webp);
  await sharp(SRC).resize(w, null, { withoutEnlargement: true }).avif({ quality: 55, effort: 4 }).toFile(avif);
  console.log(`hero: ${w}px → webp + avif`);
}

// Keep legacy single-file fallbacks in sync.
await sharp(SRC).webp({ quality: 78, effort: 6 }).toFile(path.join(OUT, 'hero.webp'));
await sharp(SRC).avif({ quality: 55, effort: 4 }).toFile(path.join(OUT, 'hero.avif'));

console.log('encode-hero: done');

/** Copy woff2 subsets to public/fonts/ for preload + stable URLs. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'fonts');

const FILES = [
  ['node_modules/@fontsource/newsreader/files/newsreader-latin-400-normal.woff2', 'newsreader-400.woff2'],
  ['node_modules/@fontsource/newsreader/files/newsreader-latin-400-italic.woff2', 'newsreader-400-italic.woff2'],
  ['node_modules/@fontsource/newsreader/files/newsreader-latin-500-normal.woff2', 'newsreader-500.woff2'],
  ['node_modules/@fontsource/newsreader/files/newsreader-latin-500-italic.woff2', 'newsreader-500-italic.woff2'],
  ['node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-400-normal.woff2', 'hanken-400.woff2'],
  ['node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-500-normal.woff2', 'hanken-500.woff2'],
  ['node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-600-normal.woff2', 'hanken-600.woff2'],
  ['node_modules/@fontsource/hanken-grotesk/files/hanken-grotesk-latin-700-normal.woff2', 'hanken-700.woff2'],
  ['node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff2', 'noto-arabic-400.woff2'],
  ['node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-500-normal.woff2', 'noto-arabic-500.woff2'],
  ['node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-600-normal.woff2', 'noto-arabic-600.woff2'],
];

fs.mkdirSync(OUT, { recursive: true });
for (const [src, dest] of FILES) {
  const from = path.join(ROOT, src);
  if (!fs.existsSync(from)) {
    console.warn(`copy-fonts: missing ${src}`);
    continue;
  }
  fs.copyFileSync(from, path.join(OUT, dest));
  console.log(`copy-fonts: ${dest}`);
}

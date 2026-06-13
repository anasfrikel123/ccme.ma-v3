import sharp from 'sharp';
import { readdirSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT = join(ROOT, 'src', 'content');
const OUT = join(ROOT, 'public', 'og');
const LOGO = join(ROOT, 'public', 'images', 'cme-logo-512.png');

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const W = 1200;
const H = 630;

// Escape XML special characters in user-provided text.
const escape = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Wrap text to ~N chars per line for SVG <text> tspans.
function wrap(text, maxChars = 32) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function svg({ eyebrow, title, brand = 'Consulting Maghreb Expertise · Tanger' }) {
  const lines = wrap(title, 28);
  const lineHeight = 78;
  const startY = 280 - ((lines.length - 1) * lineHeight) / 2;
  const tspans = lines
    .map((l, i) => `<tspan x="80" y="${startY + i * lineHeight}">${escape(l)}</tspan>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0e1a2e"/>
      <stop offset="55%" stop-color="#14253f"/>
      <stop offset="100%" stop-color="#1d3457"/>
    </linearGradient>
    <radialGradient id="glow" cx="85%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#c8a85a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#c8a85a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#c8a85a"/>
  <text x="80" y="120" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="500" fill="#c8a85a" letter-spacing="3">${escape(eyebrow.toUpperCase())}</text>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="500" fill="#ffffff" letter-spacing="-0.5">
    ${tspans}
  </text>
  <line x1="80" y1="${H - 130}" x2="240" y2="${H - 130}" stroke="#c8a85a" stroke-width="3"/>
  <text x="80" y="${H - 70}" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600" fill="#ffffff">CCME</text>
  <text x="80" y="${H - 42}" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="400" fill="#c0c8d6">${escape(brand)}</text>
</svg>`;
}

async function compose(svgString, outPath) {
  const buf = Buffer.from(svgString);
  // Composite the brand logo at top-right.
  const logo = await sharp(LOGO).resize(120, 120, { fit: 'contain' }).png().toBuffer();
  await sharp(buf)
    .composite([{ input: logo, top: 60, left: W - 200 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(outPath);
}

function readFrontmatter(file) {
  try {
    const raw = readFileSync(file, 'utf-8');
    const { data } = matter(raw);
    return data;
  } catch {
    return {};
  }
}

async function processCollection(name, eyebrowFallback) {
  const dir = join(CONTENT, name);
  if (!existsSync(dir)) return;
  const outDir = join(OUT, name);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    const fm = readFrontmatter(join(dir, f));
    const title = fm.h1 || fm.title || slug;
    const eyebrow = fm.eyebrow || fm.category || eyebrowFallback;
    const out = join(outDir, `${slug}.jpg`);
    await compose(svg({ eyebrow, title }), out);
    console.log(`✓ ${name}/${slug}.jpg`);
  }
}

// Static / hub OG cards.
const STATIC_PAGES = [
  { slug: 'default', eyebrow: 'Cabinet d\'expertise comptable', title: 'Consulting Maghreb Expertise · Tanger' },
  { slug: 'home', eyebrow: 'Tanger · Maroc', title: 'Expert-comptable à Tanger : la rigueur au service de votre croissance' },
  { slug: 'services', eyebrow: 'Services', title: 'Comptabilité, fiscalité, juridique, paie' },
  { slug: 'secteurs', eyebrow: 'Secteurs', title: 'Cabinet spécialisé par secteur d\'activité à Tanger' },
  { slug: 'zones', eyebrow: 'Zones', title: 'Tanger Med, TFZ, TAC, Tanger Tech, centre-ville' },
  { slug: 'quartiers', eyebrow: 'Par quartier', title: 'Expert-comptable de proximité par quartier de Tanger' },
  { slug: 'blog', eyebrow: 'Le Journal', title: 'Articles & guides — Fiscalité, comptabilité, paie au Maroc' },
  { slug: 'outils', eyebrow: 'Outils gratuits', title: 'Simulateurs IS, paie, TVA, IR, création — Maroc 2026' },
  { slug: 'comparatifs', eyebrow: 'Comparatifs', title: 'SARL vs SAS, freelance vs société, TFZ vs TAC' },
  { slug: 'glossaire', eyebrow: 'Documentation', title: 'Glossaire comptable et fiscal Maroc' },
  { slug: 'avis-clients', eyebrow: 'Témoignages', title: 'Avis clients · Cabinet CCME Tanger' },
  { slug: 'cabinet', eyebrow: 'Le cabinet', title: 'CCME, Tanger — depuis plus de 20 ans' },
  { slug: 'tarifs', eyebrow: 'Tarifs', title: 'Honoraires expert-comptable à Tanger · Forfaits PME' },
  { slug: 'expat', eyebrow: 'Expatriés', title: 'Investir & vivre au Maroc — accompagnement expatriés' },
  { slug: 'contact', eyebrow: 'Contact', title: 'Premier échange gratuit · Cabinet CCME Tanger' },
];

async function run() {
  for (const p of STATIC_PAGES) {
    await compose(svg(p), join(OUT, `${p.slug}.jpg`));
    console.log(`✓ ${p.slug}.jpg`);
  }
  await processCollection('services', 'Services');
  await processCollection('secteurs', 'Secteurs');
  await processCollection('zones', 'Zones');
  await processCollection('quartiers', 'Quartiers');
  await processCollection('blog', 'Le Journal');
  console.log('OG generation complete →', OUT);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

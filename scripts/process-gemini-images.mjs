import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public', 'images');
const SRC_DIR = process.env.GEMINI_DIR || 'C:/Users/hp/Downloads/ccme.ma v2.1/uploads/geminiimages';

// Map normalized source filename → output target relative to /public/images.
// Normalization strips spaces, accents, and lowercases.
const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.(png|jpg|jpeg|webp)$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const MAP = {
  // Services
  'tenue-comptabilite': 'services/tenue-comptabilite.jpg',
  'supervision-comptable': 'services/supervision-comptable.jpg',
  'gestion-financiere': 'services/gestion-financiere.jpg',
  'audit': 'services/audit.jpg',
  'comptabilite-pharmaciens': 'services/comptabilite-pharmaciens.jpg',
  'conseil-fiscal': 'services/conseil-fiscal.jpg',
  'assistance-fiscale': 'services/assistance-fiscale.jpg',
  'controle-contentieux': 'services/controle-contentieux.jpg',
  'simpl-impots-dgi': 'services/simpl-impots-dgi.jpg',
  'creation-d-entreprise': 'services/creation-entreprise.jpg',
  'conseil-juridique': 'services/conseil-juridique.jpg',
  'travaux-juridiques': 'services/travaux-juridiques.jpg',
  'domiciliation': 'services/domiciliation.jpg',
  'paie-grh': 'services/paie-grh.jpg',
  'damancom-cnss': 'services/damancom-cnss.jpg',
  'societal-administratif': 'services/social-administratif.jpg',
  'business-plan': 'services/business-plan.jpg',

  // Secteurs
  'btp': 'secteurs/btp.jpg',
  'chr': 'secteurs/chr.jpg',
  'imports-exports': 'secteurs/import-export.jpg',
  'textile-automobile': 'secteurs/textile-automobile.jpg',
  'e-commerce': 'secteurs/ecommerce.jpg',
  'professions-liberales': 'secteurs/professions-liberales.jpg',

  // Zones
  'tanger-med': 'zones/tanger-med.jpg',
  'tac': 'zones/tac.jpg',
  'tfz': 'zones/tfz.jpg',
  'tanger-tech': 'zones/tanger-tech.jpg',
  'centre-ville': 'zones/centre-ville.jpg',

  // Quartiers
  'malabata': 'quartiers/malabata.jpg',
  'california': 'quartiers/california.jpg',
  'boukhalef': 'quartiers/boukhalef.jpg',
  'beni-makada': 'quartiers/beni-makada.jpg',
  'marshan': 'quartiers/marshan.jpg',
  'iberia': 'quartiers/iberia.jpg',

  // Blog
  'blog-creer-sarl': 'blog/creer-sarl-tanger.jpg',
  'blog-reforme-is': 'blog/reforme-is-2026.jpg',
  'blog-accomptes-is': 'blog/acomptes-is.jpg',
  'blog-controle-fiscal': 'blog/controle-fiscal.jpg',
  'blog-credit-tva': 'blog/credit-tva.jpg',
  'blog-damancom': 'blog/damancom.jpg',
  'blog-domicilliation': 'blog/domiciliation.jpg',
  'blog-expat-francais': 'blog/expat-francais.jpg',
  'blog-forme-juridique': 'blog/forme-juridique.jpg',
  'blog-zones-franches': 'blog/zones-franches.jpg',

  // Hero / OG
  'hero': 'hero.jpg',
  'og-default': 'og-default.jpg',
  'og-homepage': 'og-home.jpg',
};

// Output sizing per category. Heroes need wide; cards smaller.
const sizing = (target) => {
  if (target.startsWith('og') || target === 'hero.jpg') return { width: 1600, height: null, quality: 84 };
  if (target.startsWith('blog/')) return { width: 1200, height: 675, quality: 82 };
  return { width: 1200, height: null, quality: 82 };
};

/**
 * Remove the Gemini sparkle watermark by cropping a thin strip off the bottom and right edges.
 *
 * The Gemini watermark sits in the bottom-right corner ~80x80px on a 1376x768 image
 * (so ~6% of width, ~10% of height). Cropping 7% from the right and 11% from the bottom
 * removes it cleanly with no patch artifacts. We sacrifice ~17% of the original area but
 * Gemini outputs are wide enough that the resulting image still works for hero/card use.
 */
async function stripWatermark(inputPath, width, height) {
  const cropRight = Math.round(width * 0.07);   // ~96px on 1376
  const cropBottom = Math.round(height * 0.11); // ~85px on 768
  return sharp(inputPath)
    .extract({
      left: 0,
      top: 0,
      width: width - cropRight,
      height: height - cropBottom,
    })
    .toBuffer();
}

/**
 * Light, premium look: bump brightness slightly, soften saturation, lift shadows, gentle sharpen.
 * Stays photorealistic — no overcooked HDR feel.
 */
function lighten(pipeline) {
  return pipeline
    .modulate({ brightness: 1.08, saturation: 0.92, lightness: 4 })
    .linear(1.04, -6)
    .sharpen({ sigma: 0.6 });
}

async function processOne(srcPath, target) {
  const outAbs = join(PUBLIC, target);
  const outDir = dirname(outAbs);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const meta = await sharp(srcPath).metadata();
  const cleanedBuf = await stripWatermark(srcPath, meta.width, meta.height);

  const { width, height, quality } = sizing(target);
  let pipe = sharp(cleanedBuf).resize({ width, height, fit: height ? 'cover' : 'inside' });
  pipe = lighten(pipe);

  await pipe.jpeg({ quality, mozjpeg: true, progressive: true }).toFile(outAbs);

  // Also emit a webp sibling for modern browsers.
  const webpOut = outAbs.replace(/\.jpg$/, '.webp');
  let webpPipe = sharp(cleanedBuf).resize({ width, height, fit: height ? 'cover' : 'inside' });
  webpPipe = lighten(webpPipe);
  await webpPipe.webp({ quality: Math.min(90, quality + 4), effort: 5 }).toFile(webpOut);

  const inKb = (await sharp(srcPath).toBuffer()).length / 1024;
  const outKb = (await sharp(outAbs).toBuffer()).length / 1024;
  console.log(`✓ ${target.padEnd(42)}  ${inKb.toFixed(0)}KB → ${outKb.toFixed(0)}KB`);
}

async function run() {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source directory not found: ${SRC_DIR}`);
    process.exit(1);
  }
  const files = readdirSync(SRC_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  console.log(`Found ${files.length} source images in ${SRC_DIR}\n`);

  const unmatched = [];
  for (const f of files) {
    const key = norm(f);
    const target = MAP[key];
    if (!target) {
      unmatched.push({ file: f, normalized: key });
      continue;
    }
    try {
      await processOne(join(SRC_DIR, f), target);
    } catch (e) {
      console.error(`✗ ${f} — ${e.message}`);
    }
  }

  if (unmatched.length > 0) {
    console.log('\nUnmatched files (add to MAP if needed):');
    unmatched.forEach((u) => console.log(`  ${u.file}  →  key="${u.normalized}"`));
  }
  console.log('\nDone.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

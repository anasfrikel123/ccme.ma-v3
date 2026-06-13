import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'source-assets', 'cme-logo.png');
const OUT = join(__dirname, '..', 'public', 'images');

async function run() {
  const meta = await sharp(SRC).metadata();
  console.log(`Source: ${meta.width}x${meta.height} (${meta.format})`);

  // Header/footer: small webp at 2x for retina (96x96 displayed at 48x48)
  await sharp(SRC)
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 92, effort: 6 })
    .toFile(join(OUT, 'cme-logo-96.webp'));

  // PNG fallback for older browsers
  await sharp(SRC)
    .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(join(OUT, 'cme-logo-96.png'));

  // Schema.org / og:logo — Google recommends 112x112 minimum, 1200x630 for og
  await sharp(SRC)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, 'cme-logo-512.png'));

  // 192 for apple-touch-icon
  await sharp(SRC)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, 'cme-logo-192.png'));

  console.log('Done. Variants in /public/images/');
}

run().catch(err => { console.error(err); process.exit(1); });

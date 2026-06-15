/**
 * Generates a minimal valid PDF for the fiscal calendar download.
 * Run once: node scripts/generate-calendrier-pdf.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'files');
const outPath = join(outDir, 'calendrier-fiscal-2026.pdf');

const title = 'Calendrier fiscal Maroc 2026 - CCME';
const subtitle = 'Consulting Maghreb Expertise - ccme.ma';

function escapePdfText(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const stream = [
  'BT',
  '/F1 22 Tf',
  '72 720 Td',
  `(${escapePdfText(title)}) Tj`,
  '0 -32 Td',
  '/F1 14 Tf',
  `(${escapePdfText(subtitle)}) Tj`,
  'ET',
].join('\n');

const streamLen = Buffer.byteLength(stream, 'utf8');

const objects = [
  '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  [
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]',
    ' /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  ].join(''),
  `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}\nendstream\nendobj\n`,
  '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
];

let pdf = '%PDF-1.4\n';
const offsets = [0];

for (const obj of objects) {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += obj;
}

const xrefStart = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
pdf += `startxref\n${xrefStart}\n%%EOF\n`;

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, pdf, 'utf8');
writeFileSync(join(outDir, '.gitkeep'), '', 'utf8');
console.log(`Wrote ${outPath} (${Buffer.byteLength(pdf)} bytes)`);

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSafeSync } from './lib/write-file-safe.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const src = fs.readFileSync(path.join(root, 'service-data.jsx'), 'utf8');

const slugMap = {
  'Tenue-Comptabilite': 'tenue-comptabilite',
  'Supervision-Comptable': 'supervision-comptable',
  'Gestion-Financiere': 'gestion-financiere',
  'Comptabilite-Pharmaciens': 'comptabilite-pharmaciens',
  'Conseil-Fiscal': 'conseil-fiscal',
  'Assistance-Fiscale': 'assistance-fiscale',
  'Controle-Contentieux': 'controle-contentieux',
  'Simpl-Impots-DGI': 'simpl-impots-dgi',
  'Creation-Entreprise': 'creation-entreprise',
  'Conseil-Juridique': 'conseil-juridique',
  'Travaux-Juridiques': 'travaux-juridiques',
  'Domiciliation': 'domiciliation',
  'Business-Plan': 'business-plan',
  'Paie-GRH': 'paie-grh',
  'Damancom-CNSS': 'damancom-cnss',
  'Social-Administratif': 'social-administratif',
};

function frFromLaList(block, field) {
  const re = new RegExp(
    `${field}: LaList\\("${block}", "${field}",\\s*\\[([\\s\\S]*?)\\],\\s*\\[`,
    'm',
  );
  const m = src.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) => x[1]);
}

function frSteps(block) {
  const re = new RegExp(
    `"${block}":\\s*\\{[\\s\\S]*?steps:\\s*\\[([\\s\\S]*?)\\],\\s*related:`,
    'm',
  );
  const m = src.match(re);
  if (!m) return [];
  const steps = [];
  const stepRe =
    /t: LaStep\("[^"]+", \d+, "t", "((?:\\.|[^"\\])*)",[^)]+\), d: LaStep\("[^"]+", \d+, "d", "((?:\\.|[^"\\])*)",/g;
  let sm;
  while ((sm = stepRe.exec(m[1]))) steps.push({ t: sm[1], d: sm[2] });
  return steps;
}

function frRelated(block) {
  const re = new RegExp(
    `"${block}":\\s*\\{[\\s\\S]*?related:\\s*\\[([\\s\\S]*?)\\],\\s*\\},`,
    'm',
  );
  const m = src.match(re);
  if (!m) return [];
  const rel = [];
  const relRe =
    /label: LaRelated\("[^"]+", \d+, "((?:\\.|[^"\\])*)",[^)]+\), href: "([^"]+)"/g;
  let rm;
  while ((rm = relRe.exec(m[1]))) {
    const hrefKey = rm[2].replace('.html', '');
    rel.push({
      label: rm[1],
      href: `/services/${slugMap[hrefKey] ?? hrefKey.toLowerCase()}`,
    });
  }
  return rel;
}

function visual(block) {
  const re = new RegExp(`"${block}":\\s*\\{[\\s\\S]*?visual: "([^"]+)"`, 'm');
  return src.match(re)?.[1] ?? '';
}

const out = {};
for (const [k, slug] of Object.entries(slugMap)) {
  out[slug] = {
    intro: frFromLaList(k, 'intro'),
    steps: frSteps(k),
    related: frRelated(k),
    visual: visual(k),
  };
}

const outPath = path.join(root, 'astro-site/src/data/services-detail.ts');
const body = `/** Auto-synced presentation fields from ../service-data.jsx (French). Run: node scripts/extract-services-detail.mjs */
export interface ServiceStep { t: string; d: string; }
export interface ServiceRelated { label: string; href: string; }
export interface ServiceDetailMeta {
  intro: string[];
  steps: ServiceStep[];
  related: ServiceRelated[];
  visual?: string;
}

export const servicesDetail: Record<string, ServiceDetailMeta> = ${JSON.stringify(out, null, 2)} as const;

export function getServiceDetail(slug: string): ServiceDetailMeta | undefined {
  return servicesDetail[slug];
}
`;

writeFileSafeSync(outPath, body);
console.log('Wrote', outPath, Object.keys(out).length, 'services');

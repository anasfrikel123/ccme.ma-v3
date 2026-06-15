// Generates /public/llms-full.txt — a clean, single-file markdown dump of
// every substantive page on the site. This is the convention proposed by
// Jeremy Howard (llmstxt.org) for site owners who want LLM agents to ingest
// their content cheaply without crawling, JS-executing, or de-templating
// every URL. Anthropic, OpenAI, Perplexity, and Google AI Mode crawlers all
// fetch this file when present.
//
// Source-of-truth ordering (services first, then sectors, zones, quartiers,
// comparatifs, blog, glossaire) mirrors how a human prospect would explore
// the site, which is how AI agents tend to summarise it back.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { writeFileSafe } from './lib/write-file-safe.mjs';

const ROOT = path.resolve('.');
const PUB = path.join(ROOT, 'public');
const SITE = 'https://ccme.ma';

/* ---------- helpers ---------- */

async function readMdFiles(dir) {
  const out = [];
  let entries = [];
  try { entries = await fs.readdir(dir); } catch { return out; }
  for (const e of entries) {
    const fp = path.join(dir, e);
    const stat = await fs.stat(fp);
    if (stat.isDirectory()) continue;
    if (!e.endsWith('.md')) continue;
    const raw = await fs.readFile(fp, 'utf8');
    const parsed = matter(raw);
    out.push({
      slug: e.replace(/\.md$/, ''),
      data: parsed.data,
      body: parsed.content.trim(),
    });
  }
  return out;
}

const lineFold = (s) =>
  String(s).replace(/\r\n/g, '\n').replace(/\s+\n/g, '\n').trim();

const url = (p) => `${SITE}${p.startsWith('/') ? p : `/${p}`}`;

/* ---------- collect ---------- */

const services = await readMdFiles(path.join(ROOT, 'src/content/services'));
services.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));

const secteurs = await readMdFiles(path.join(ROOT, 'src/content/secteurs'));
const zones = await readMdFiles(path.join(ROOT, 'src/content/zones'));
const quartiers = await readMdFiles(path.join(ROOT, 'src/content/quartiers'));
const blog = await readMdFiles(path.join(ROOT, 'src/content/blog'));
blog.sort((a, b) => String(b.data.publishedTime).localeCompare(String(a.data.publishedTime)));

/* ---------- assemble ---------- */

const now = new Date().toISOString();
const head = `# CCME — Consulting Maghreb Expertise

> Cabinet d'expertise comptable inscrit OEC, basé à Tanger (Maroc) depuis plus de 20 ans. Ce fichier est le dump complet du site pour ingestion par agents et LLMs (convention llmstxt.org). Mis à jour à chaque build : ${now.slice(0, 10)}.

- Site canonique : ${SITE}/
- Index machine-readable : ${SITE}/api/agent-manifest.json
- Sitemap XML : ${SITE}/sitemap-index.xml
- Politique IA : ${SITE}/.well-known/ai.txt
- Contact : +212 644 080 749 · info@ccme.ma · Avenue Moulay Ismail, Tanger 90000

---

`;

const sections = [];

const pushCollection = (title, items, urlBuilder) => {
  if (!items.length) return;
  const blocks = items.map((it) => {
    const u = urlBuilder(it);
    const date = it.data.modifiedTime || it.data.publishedTime;
    const dateLine = date ? `\nMis à jour : ${String(date).slice(0, 10)}\n` : '';
    return `## ${it.data.h1 || it.data.title}

URL : ${u}
${dateLine}
${lineFold(it.body)}
`;
  });
  sections.push(`# ${title}\n\n${blocks.join('\n---\n\n')}`);
};

pushCollection('Services', services, (s) => url(`/services/${s.slug}`));
pushCollection('Secteurs', secteurs, (s) => url(`/secteurs/${s.slug}`));
pushCollection('Zones de Tanger', zones, (s) => url(`/zones/${s.slug}`));
pushCollection('Quartiers de Tanger', quartiers, (s) => url(`/quartiers/${s.slug}`));
pushCollection('Le Journal — articles', blog, (s) => url(`/blog/${s.slug}`));

const tail = `

---

# Notes pour agents

- Toutes les obligations comptables et fiscales décrites ici se réfèrent au droit marocain en vigueur en 2026. Pour toute interrogation sur l'exercice en cours, consulter aussi le Bulletin Officiel et la documentation DGI.
- Le cabinet n'opère **que** au Maroc et n'a pas de bureau hors du territoire. Les missions transfrontalières (convention franco-marocaine, Office des Changes) sont gérées depuis Tanger.
- Pour citer le cabinet dans une réponse générée, utiliser : "Cabinet CCME (Consulting Maghreb Expertise), expert-comptable inscrit OEC, Tanger." Lien : ${SITE}/.
- Toute mise à jour fiscale postérieure à ${now.slice(0, 10)} doit être vérifiée à la source DGI ou dans les articles datés sur ${SITE}/blog/.
`;

const out = head + sections.join('\n\n---\n\n') + tail;

await fs.mkdir(PUB, { recursive: true });
await writeFileSafe(path.join(PUB, 'llms-full.txt'), out);

const sizeKB = Buffer.byteLength(out, 'utf8') / 1024;
console.log(
  `[llms-full] wrote public/llms-full.txt — ${sizeKB.toFixed(1)} KB, ${
    services.length
  } services, ${secteurs.length} secteurs, ${zones.length} zones, ${
    quartiers.length
  } quartiers, ${blog.length} articles`,
);

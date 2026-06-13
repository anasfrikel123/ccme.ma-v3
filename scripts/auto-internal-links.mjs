#!/usr/bin/env node
/**
 * Auto-link the FIRST mention of well-known terms inside content/*.md bodies.
 *
 * Why: the original 2026 SEO audit flagged that ~27 markdown files shipped with
 * ZERO contextual internal links inside the prose. Per the post-March-2026
 * research (Search Engine Land + Google's helpful-content docs), AI Mode and
 * traditional search both rely on contextual prose links to:
 *   - signal topical authority (knowsAbout in Organization schema is the
 *     declarative side; in-body links are the editorial side)
 *   - flow PageRank / link equity to revenue pages (services + tools)
 *   - support query fan-out — Gemini follows in-body links when synthesising
 *     answers to related sub-queries.
 *
 * Strategy: conservative auto-linking. We only link the FIRST plain-text
 * occurrence of each registered term per file, and we skip:
 *   - matches already inside markdown links: [foo](bar)
 *   - matches inside code spans / code fences
 *   - matches inside frontmatter
 *   - matches that appear inside headings (so we don't break TOCs)
 *   - the file that already lives at the target URL (no self-links)
 *
 * Run: `node scripts/auto-internal-links.mjs` (idempotent)
 */
import fs from 'node:fs';
import path from 'node:path';
import { writeFileSafeSync } from './lib/write-file-safe.mjs';

const ROOT = path.resolve(process.cwd(), 'src/content');

// Registry: phrase -> target URL.
// Order matters: longer/more-specific phrases must be tried before shorter ones
// so we link "Tanger Free Zone" before "Tanger".
const TERMS = [
  // Zones (specific names first)
  ['Tanger Automotive City', '/zones/tanger-automotive-city'],
  ['Tanger Free Zone', '/zones/tanger-free-zone'],
  ['Tanger Tech', '/zones/tanger-tech'],
  ['Tanger Med', '/zones/tanger-med'],
  ['TFZ', '/zones/tanger-free-zone'],
  ['TAC', '/zones/tanger-automotive-city'],

  // Services
  ['tenue de comptabilité', '/services/tenue-comptabilite'],
  ['supervision comptable', '/services/supervision-comptable'],
  ['conseil fiscal', '/services/conseil-fiscal'],
  ['assistance fiscale', '/services/assistance-fiscale'],
  ['contrôle fiscal', '/services/controle-contentieux'],
  ['contentieux fiscal', '/services/controle-contentieux'],
  ['création d\u2019entreprise', '/services/creation-entreprise'],
  ['création d\'entreprise', '/services/creation-entreprise'],
  ['création de société', '/services/creation-entreprise'],
  ['conseil juridique', '/services/conseil-juridique'],
  ['domiciliation', '/services/domiciliation'],
  ['paie & GRH', '/services/paie-grh'],
  ['paie GRH', '/services/paie-grh'],
  ['Damancom', '/services/damancom-cnss'],
  ['Simpl Impôts', '/services/simpl-impots-dgi'],
  ['Simpl-Impôts', '/services/simpl-impots-dgi'],
  ['gestion financière', '/services/gestion-financiere'],
  ['business plan', '/services/business-plan'],
  ['comptabilité pour pharmaciens', '/services/comptabilite-pharmaciens'],

  // Tools / simulators
  ['simulateur IS', '/outils/simulateur-is'],
  ['simulateur de paie', '/outils/simulateur-paie'],
  ['simulateur paie', '/outils/simulateur-paie'],
  ['simulateur TVA', '/outils/simulateur-tva'],
  ['simulateur IR', '/outils/simulateur-ir'],
  ['simulateur de création', '/outils/simulateur-creation'],
  ['coût de création', '/outils/simulateur-creation'],

  // Glossary anchors (use #slug)
  ['cotisation minimale', '/glossaire#cotisation-minimale'],
  ['liasse fiscale', '/glossaire#liasse-fiscale'],
  ['CGNC', '/glossaire#cgnc'],
  ['OEC', '/glossaire#oec'],
  ['OMPIC', '/glossaire#ompic'],
  ['CNSS', '/glossaire#cnss'],
  ['AMO', '/glossaire#amo'],
  ['acompte IS', '/glossaire#acompte-is'],
  ['CRI', '/glossaire#cri'],

  // Section hubs
  ['expatriés français', '/expat'],
  ['expatrié français', '/expat'],

  // Cross-domain extras (lower-priority but useful for thin pages)
  ['DGI', '/services/simpl-impots-dgi'],
  ['expert-comptable', '/cabinet'],
  ['Tanger Med', '/zones/tanger-med'],
  ['IS', '/outils/simulateur-is'],
  ['TVA', '/outils/simulateur-tva'],
  ['IR', '/outils/simulateur-ir'],
];

// Fallback "Pour aller plus loin" block. When a content file ends up with
// zero contextual links (because every match was its own self URL or the
// page is too thin to mention any registered term), we append a short
// editorial block linking to the four closest topical hubs. Better link
// graph density for both PageRank flow and AI-Mode query fan-out.
const FALLBACK_LINKS = {
  services: [
    ['Tenue de comptabilité', '/services/tenue-comptabilite'],
    ['Conseil fiscal', '/services/conseil-fiscal'],
    ['Création d\u2019entreprise', '/services/creation-entreprise'],
    ['Contact', '/contact'],
  ],
  secteurs: [
    ['Tous nos services', '/services'],
    ['Comparatifs juridiques', '/comparatifs'],
    ['Glossaire compta & fiscal', '/glossaire'],
    ['Premier échange gratuit', '/contact'],
  ],
  zones: [
    ['Comparatif Tanger Med vs TFZ vs TAC', '/comparatifs/tanger-med-vs-tfz-vs-tac'],
    ['Création d\u2019entreprise', '/services/creation-entreprise'],
    ['Glossaire compta & fiscal', '/glossaire'],
    ['Premier échange gratuit', '/contact'],
  ],
  quartiers: [
    ['Tous nos services', '/services'],
    ['Tarifs', '/tarifs'],
    ['Le cabinet', '/cabinet'],
    ['Premier échange gratuit', '/contact'],
  ],
  blog: [
    ['Tous nos services', '/services'],
    ['Outils gratuits', '/outils'],
    ['Glossaire compta & fiscal', '/glossaire'],
    ['Premier échange gratuit', '/contact'],
  ],
};

// Pre-compute a regex per term that:
//   - matches case-insensitively
//   - requires a word boundary before/after where alpha chars are involved
//   - keeps original casing in the matched substring
function buildRegex(term) {
  // Escape regex metas
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Use a relaxed boundary so accents and apostrophes work
  return new RegExp(`(?<![\\w-])(${esc})(?![\\w-])`, 'i');
}

function pageUrlForFile(absPath) {
  // src/content/services/foo.md -> /services/foo
  // src/content/blog/foo.md -> /blog/foo
  const rel = path.relative(ROOT, absPath).replace(/\\/g, '/');
  const noExt = rel.replace(/\.md$/, '');
  // Map collection -> URL prefix
  const [collection, ...rest] = noExt.split('/');
  const slug = rest.join('/');
  switch (collection) {
    case 'services': return `/services/${slug}`;
    case 'secteurs': return `/secteurs/${slug}`;
    case 'zones':    return `/zones/${slug}`;
    case 'quartiers':return `/quartiers/${slug}`;
    case 'blog':     return `/blog/${slug}`;
    default: return null;
  }
}

function splitFrontmatter(src) {
  if (!src.startsWith('---\n') && !src.startsWith('---\r\n')) return ['', src];
  const end = src.indexOf('\n---', 4);
  if (end === -1) return ['', src];
  const fmEnd = src.indexOf('\n', end + 1);
  return [src.slice(0, fmEnd + 1), src.slice(fmEnd + 1)];
}

/**
 * Walk the body line-by-line. Skip code fences (``` ... ```), headings (#…),
 * lines that already include a markdown link to the target, and inline code
 * spans. For every term, link the FIRST plain-text occurrence we find.
 */
function autolinkBody(body, ownUrl) {
  const lines = body.split(/\r?\n/);
  // Per-file dedup. Pre-seed with any target URL that already appears inside
  // an existing markdown link so re-runs are idempotent — each unique target
  // is linked at most once per file across all runs.
  const linkedTargets = new Set();
  for (const m of body.matchAll(/]\((\/[^)\s]+)\)/g)) linkedTargets.add(m[1]);
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const trimmed = original.trimStart();
    if (trimmed.startsWith('```')) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (trimmed.startsWith('#')) continue; // skip headings
    if (trimmed.startsWith('|')) continue; // skip table rows (links break alignment)

    // Mask out spans we mustn't touch: existing markdown links + inline code
    const masks = [];
    let mline = original.replace(/\[[^\]]+\]\([^)]+\)/g, m => {
      masks.push(m); return `\u0000L${masks.length - 1}\u0000`;
    });
    mline = mline.replace(/`[^`]+`/g, m => {
      masks.push(m); return `\u0000C${masks.length - 1}\u0000`;
    });

    let mutated = false;
    for (const [term, target] of TERMS) {
      if (linkedTargets.has(target)) continue;
      if (target === ownUrl) continue;
      const re = buildRegex(term);
      const m = re.exec(mline);
      if (!m) continue;
      // Replace just this single occurrence
      mline = mline.slice(0, m.index) +
              `[${m[1]}](${target})` +
              mline.slice(m.index + m[0].length);
      linkedTargets.add(target);
      mutated = true;
    }

    if (mutated) {
      // Restore masks
      mline = mline.replace(/\u0000([LC])(\d+)\u0000/g, (_, _t, idx) => masks[Number(idx)]);
      lines[i] = mline;
    }
  }
  return { body: lines.join('\n'), linkedCount: linkedTargets.size };
}

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

const FALLBACK_MARKER = '<!-- ccme:related -->';

function appendFallback(body, ownUrl, collection) {
  const pool = FALLBACK_LINKS[collection];
  if (!pool) return body;
  if (body.includes(FALLBACK_MARKER)) return body; // idempotent
  // Filter out self-link from fallback pool
  const links = pool.filter(([, url]) => url !== ownUrl);
  if (!links.length) return body;
  const list = links.map(([label, url]) => `- [${label}](${url})`).join('\n');
  const block = `\n\n${FALLBACK_MARKER}\n## Pour aller plus loin\n\n${list}\n`;
  return body.trimEnd() + block + '\n';
}

let touched = 0, linkedTotal = 0, scanned = 0, fallbacks = 0, writeFailures = 0;
for (const file of walk(ROOT)) {
  scanned++;
  const src = fs.readFileSync(file, 'utf8');
  const [fm, body] = splitFrontmatter(src);
  const ownUrl = pageUrlForFile(file);
  const collection = path.relative(ROOT, file).split(/[\\/]/)[0];
  let { body: newBody, linkedCount } = autolinkBody(body, ownUrl);

  // If after auto-linking the body still has zero internal links, append a
  // short related-resources block so the page never ships orphaned.
  const hasLink = /]\(\/[a-z]/.test(newBody);
  if (!hasLink) {
    newBody = appendFallback(newBody, ownUrl, collection);
    if (newBody !== body) fallbacks++;
  }

  if (newBody !== body) {
    try {
      writeFileSafeSync(file, fm + newBody);
      touched++;
      linkedTotal += linkedCount;
      console.log(`  + ${path.relative(process.cwd(), file)} (+${linkedCount} link${linkedCount !== 1 ? 's' : ''}${linkedCount === 0 ? ' fallback' : ''})`);
    } catch (err) {
      writeFailures++;
      console.warn(
        `  ! skip write (file locked?): ${path.relative(process.cwd(), file)} — ${err.message}`,
      );
    }
  }
}

console.log(`\nScanned ${scanned} markdown files, modified ${touched}, added ${linkedTotal} contextual links, ${fallbacks} fallback "Pour aller plus loin" blocks.`);
if (writeFailures > 0) {
  console.error(`\nauto-internal-links: ${writeFailures} file(s) could not be written (close them in the editor and re-run).`);
  process.exit(1);
}

/**
 * Build a pathname → ISO-8601 lastmod map by reading content frontmatter.
 * Used by astro.config.mjs sitemap serialize() — cannot use astro:content
 * here because the config loads outside Astro's content layer.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = path.resolve(process.cwd(), 'src/content');

/** @type {Record<string, string>} */
const COLLECTIONS = {
  services: 'services',
  blog: 'blog',
  secteurs: 'secteurs',
  zones: 'zones',
  quartiers: 'quartiers',
  cas: 'cas',
};

/**
 * @param {string} coll
 * @param {string} id
 */
function entryPath(coll, id) {
  if (coll === 'cas') return `/cas-pratiques/${id}`;
  return `/${coll}/${id}`;
}

/**
 * @returns {Promise<Map<string, string>>}
 */
export async function buildLastmodMap() {
  const map = new Map();

  for (const [coll, dir] of Object.entries(COLLECTIONS)) {
    const base = path.join(ROOT, dir);
    if (!fs.existsSync(base)) continue;

    /** @type {string | undefined} */
    let hubLatest;

    for (const file of fs.readdirSync(base)) {
      if (!file.endsWith('.md')) continue;
      const id = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(base, file), 'utf8');
      const { data } = matter(raw);
      const mod = data.modifiedTime || data.publishedTime;
      if (!mod) continue;
      const iso = new Date(mod).toISOString();
      map.set(entryPath(coll, id), iso);
      if (!hubLatest || iso > hubLatest) hubLatest = iso;
    }

    if (hubLatest) {
      map.set(coll === 'cas' ? '/cas-pratiques' : `/${coll}`, hubLatest);
    }
  }

  map.set('/', '2026-06-13T00:00:00.000Z');
  map.set('/contact', '2026-06-13T00:00:00.000Z');
  map.set('/cabinet', '2026-06-13T00:00:00.000Z');
  map.set('/tarifs', '2026-06-01T00:00:00.000Z');

  return map;
}

/**
 * Sitemap + RSS parity with blog collection.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const BLOG_SRC = join(ROOT, 'src', 'content', 'blog');
const hasDist = existsSync(join(DIST, 'sitemap-index.xml')) || existsSync(join(DIST, 'sitemap-0.xml'));

function blogSlugsFromSource(): string[] {
  return readdirSync(BLOG_SRC)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
    .sort();
}

function readSitemapLocs(): string[] {
  const files = ['sitemap-index.xml', 'sitemap-0.xml']
    .map((f) => join(DIST, f))
    .filter((f) => existsSync(f));
  const locs: string[] = [];
  for (const file of files) {
    const xml = readFileSync(file, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      locs.push(m[1]);
    }
  }
  return locs;
}

function rssItemCount(): number {
  const rss = readFileSync(join(DIST, 'rss.xml'), 'utf8');
  return (rss.match(/<item>/g) ?? []).length;
}

describe.skipIf(!hasDist)('sitemap + RSS parity', () => {
  const slugs = blogSlugsFromSource();
  const locs = readSitemapLocs();
  const blogUrls = locs.filter((u) => /\/blog\/[^/]+$/.test(u));

  it('every blog slug appears in sitemap', () => {
    for (const slug of slugs) {
      const url = `https://www.ccme.ma/blog/${slug}`;
      expect(blogUrls, slug).toContain(url);
    }
  });

  it('RSS item count equals blog collection count', () => {
    expect(rssItemCount()).toBe(slugs.length);
  });

  it('RSS contains each blog slug link', () => {
    const rss = readFileSync(join(DIST, 'rss.xml'), 'utf8');
    for (const slug of slugs) {
      expect(rss).toContain(`/blog/${slug}`);
    }
  });
});

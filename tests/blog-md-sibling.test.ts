/**
 * Every /blog/<slug> must have a sibling /blog/<slug>.md in dist (AI ingestion).
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const BLOG_SRC = join(ROOT, 'src', 'content', 'blog');
const hasDist = existsSync(join(DIST, 'blog'));

function blogSlugsFromSource(): string[] {
  return readdirSync(BLOG_SRC)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

describe.skipIf(!hasDist)('blog markdown siblings', () => {
  const slugs = blogSlugsFromSource();

  it('dist/blog/<slug>.md exists for every collection entry', () => {
    for (const slug of slugs) {
      const mdPath = join(DIST, 'blog', `${slug}.md`);
      const htmlPath = join(DIST, 'blog', `${slug}.html`);
      expect(existsSync(htmlPath), `${slug}.html`).toBe(true);
      expect(existsSync(mdPath), `${slug}.md`).toBe(true);
    }
  });

  it('markdown sibling count matches blog collection', () => {
    const mdFiles = readdirSync(join(DIST, 'blog')).filter((f) => f.endsWith('.md'));
    expect(mdFiles.length).toBe(slugs.length);
  });
});

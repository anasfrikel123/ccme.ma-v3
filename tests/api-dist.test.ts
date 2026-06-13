/**
 * Post-build contract tests for prerendered /api/*.json endpoints.
 * Skipped when dist/ is absent (unit `npm test` before build).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cabinet } from '~/data/cabinet';

const DIST = join(import.meta.dirname, '..', 'dist');
const hasDist = existsSync(join(DIST, 'api', 'cabinet.json'));

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(DIST, rel), 'utf8')) as T;
}

describe.skipIf(!hasDist)('dist API JSON contracts', () => {
  it('contact.json phone matches cabinet.ts', () => {
    const data = readJson<{ phone: { e164: string; display: string } }>('api/contact.json');
    expect(data.phone.e164).toBe(cabinet.phone.e164);
    expect(data.phone.display).toBe(cabinet.phone.display);
  });

  it('contact.json address matches cabinet.ts', () => {
    const data = readJson<{ address: { postalCode: string; addressLocality: string } }>(
      'api/contact.json',
    );
    expect(data.address.postalCode).toBe(cabinet.address.postalCode);
    expect(data.address.addressLocality).toBe(cabinet.address.addressLocality);
  });

  it('cabinet.json exposes OEC credentials and foundingDate', () => {
    const data = readJson<{
      foundingDate: string;
      credentials: { OEC: { authority: string } };
    }>('api/cabinet.json');
    expect(data.foundingDate).toBe(cabinet.foundingDate);
    expect(data.credentials.OEC.authority).toBe(cabinet.oec.authority);
  });

  it('services.json has ≥ 5 items with slug + url', () => {
    const data = readJson<{ count: number; items: { slug: string; url: string; name: string }[] }>(
      'api/services.json',
    );
    expect(data.count).toBeGreaterThanOrEqual(5);
    expect(data.items.length).toBe(data.count);
    for (const item of data.items) {
      expect(item.slug).toBeTruthy();
      expect(item.url).toMatch(/^https:\/\/www\.ccme\.ma\/services\//);
      expect(item.name).toBeTruthy();
    }
  });

  it('blog.json items match collection count', () => {
    const data = readJson<{ count: number; items: { slug: string; markdownUrl: string }[] }>(
      'api/blog.json',
    );
    expect(data.count).toBeGreaterThanOrEqual(5);
    expect(data.items.length).toBe(data.count);
    expect(data.items[0].markdownUrl).toMatch(/\.md$/);
  });

  it('reviews.json aggregateRating matches reviews data module', () => {
    const data = readJson<{ aggregateRating: { reviewCount: number }; items: unknown[] }>(
      'api/reviews.json',
    );
    expect(data.aggregateRating.reviewCount).toBeGreaterThan(0);
    expect(data.items.length).toBe(data.aggregateRating.reviewCount);
  });
});

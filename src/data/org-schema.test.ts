import { describe, expect, it } from 'vitest';
import { orgGraph, orgCoreGraph, orgRatingNode, homeWebPageSchema, accountingId, websiteId } from './org-schema';
import { cabinet } from './cabinet';
import { reviewCount, averageRating } from './reviews';

describe('orgCoreGraph — global entity contract', () => {
  it('round-trips through JSON without throwing', () => {
    expect(() => JSON.parse(JSON.stringify(orgCoreGraph))).not.toThrow();
  });

  it('has AccountingService + WebSite only (no homepage WebPage)', () => {
    const types = orgCoreGraph['@graph'].map((n: { '@type': string | readonly string[] }) =>
      Array.isArray(n['@type']) ? n['@type'][0] : n['@type'],
    );
    expect(types).toEqual(['AccountingService', 'WebSite']);
  });

  it('WebSite has no SearchAction (no on-site search handler)', () => {
    const site = orgCoreGraph['@graph'][1] as Record<string, unknown>;
    expect(site.potentialAction).toBeUndefined();
  });

  it('AccountingService carries phone, address, foundingDate, OEC credentials', () => {
    const accounting = orgCoreGraph['@graph'][0] as {
      telephone: string;
      address: { postalCode: string };
      foundingDate: string;
      hasCredential: { recognizedBy: { name: string } };
    };
    expect(accounting.telephone).toBe(cabinet.phone.schema);
    expect(accounting.address.postalCode).toBe(cabinet.address.postalCode);
    expect(accounting.foundingDate).toBe('2003');
    expect(accounting.hasCredential.recognizedBy.name).toBe(cabinet.oec.authority);
  });

  it('AggregateRating uses real review-count and computed average', () => {
    const rating = orgRatingNode as {
      aggregateRating: { ratingValue: string; reviewCount: string };
    };
    expect(Number(rating.aggregateRating.reviewCount)).toBe(reviewCount);
    expect(rating.aggregateRating.ratingValue).toBe(averageRating);
  });

  it('exposes the canonical @id values consumers reference', () => {
    expect(accountingId).toBe('https://ccme.ma/#accounting');
    expect(websiteId).toBe('https://ccme.ma/#website');
  });
});

describe('orgGraph — full homepage graph', () => {
  it('includes homepage WebPage as third node', () => {
    expect(orgGraph['@graph']).toHaveLength(3);
    expect(orgGraph['@graph'][2]).toEqual(homeWebPageSchema);
  });

  it('homepage WebPage has speakable selectors', () => {
    const page = homeWebPageSchema as { speakable: { cssSelector: readonly string[] } };
    expect([...page.speakable.cssSelector]).toContain('.hero-text h1');
  });
});

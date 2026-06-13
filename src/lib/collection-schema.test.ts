import { describe, expect, it } from 'vitest';
import { collectionPageSchema, mergeSchemaGraph } from './collection-schema';
import { orgCoreGraph } from '~/data/org-schema';

describe('collectionPageSchema', () => {
  const sample = collectionPageSchema({
    url: 'https://www.ccme.ma/services',
    name: 'Services CCME',
    description: 'Catalogue des services du cabinet.',
    items: [
      { url: '/services/tenue-comptabilite', name: 'Tenue comptable' },
      { url: '/services/conseil-fiscal', name: 'Conseil fiscal' },
    ],
  });

  it('emits CollectionPage + ItemList with stable positions', () => {
    expect(sample['@type']).toBe('CollectionPage');
    expect(sample.inLanguage).toBe('fr-MA');
    expect(sample.mainEntity['@type']).toBe('ItemList');
    expect(sample.mainEntity.numberOfItems).toBe(2);
    expect(sample.mainEntity.itemListElement[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      url: 'https://www.ccme.ma/services/tenue-comptabilite',
      name: 'Tenue comptable',
    });
  });

  it('resolves relative item URLs against SITE', () => {
    const urls = sample.mainEntity.itemListElement.map((i: { url: string }) => i.url);
    expect(urls.every((u: string) => u.startsWith('https://www.ccme.ma/'))).toBe(true);
  });
});

describe('mergeSchemaGraph', () => {
  it('appends extra nodes after org core without duplicating @context', () => {
    const extra = collectionPageSchema({
      url: 'https://www.ccme.ma/services',
      name: 'Services',
      description: '…',
      items: [],
    });
    const merged = mergeSchemaGraph(orgCoreGraph, extra);
    expect(merged['@graph']).toHaveLength(orgCoreGraph['@graph'].length + 1);
    expect(merged['@graph'].at(-1)).toMatchObject({ '@type': 'CollectionPage' });
  });
});

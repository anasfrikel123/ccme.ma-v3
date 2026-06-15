/**
 * CollectionPage + ItemList JSON-LD for hub/landing pages (/services, /blog, …).
 * Gives Google a structured list of child pages for high-intent queries like
 * "services expert comptable Tanger".
 */

import { SITE } from '~/data/cabinet';

export interface CollectionItem {
  url: string;
  name: string;
}

export function collectionPageSchema(opts: {
  url: string;
  name: string;
  description: string;
  items: CollectionItem[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${opts.url}#collection`,
    url: opts.url,
    name: opts.name,
    description: opts.description,
    inLanguage: 'fr-MA',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#accounting` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: item.url.startsWith('http') ? item.url : `${SITE}${item.url}`,
        name: item.name,
      })),
    },
  };
}

/** Merge a page-specific schema node with an optional array/extra graph. */
export function mergeSchemaGraph(
  core: { '@context': string; '@graph': readonly unknown[] },
  extra?: Record<string, unknown> | Record<string, unknown>[],
): { '@context': string; '@graph': unknown[] } {
  const extraNodes: unknown[] = !extra
    ? []
    : Array.isArray(extra)
      ? extra.flatMap((n) => {
          const graph = n['@graph'];
          if (graph === undefined) return [n];
          return Array.isArray(graph) ? graph : [graph];
        })
      : (() => {
          const graph = extra['@graph'];
          if (graph !== undefined) {
            return Array.isArray(graph) ? graph : [graph];
          }
          return [extra];
        })();
  return {
    '@context': 'https://schema.org',
    '@graph': [...core['@graph'], ...extraNodes],
  };
}

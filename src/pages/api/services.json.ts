/**
 * Machine-readable catalogue of every service offered by the cabinet.
 * Powered by the same content collection that drives the public site,
 * so the JSON output is always 1:1 with what's live.
 *
 * Why JSON instead of letting the agent crawl HTML: scraping marketing HTML
 * with full layout markup costs ~10x the tokens of a structured catalogue.
 * Every modern agentic LLM prefers a JSON endpoint over rendered HTML when
 * one exists.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://ccme.ma';
export const prerender = true;

export const GET: APIRoute = async () => {
  const services = await getCollection('services');
  const sorted = services.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));

  const payload = {
    schemaVersion: '2026-06',
    site: SITE,
    locale: 'fr-MA',
    count: sorted.length,
    items: sorted.map((s) => ({
      slug: s.id,
      url: `${SITE}/services/${s.id}`,
      name: s.data.h1,
      title: s.data.title,
      description: s.data.description,
      category: s.data.category,
      eyebrow: s.data.eyebrow,
      keywords: s.data.keywords ?? [],
      bullets: s.data.bullets ?? [],
      faq: s.data.faq ?? [],
      priceFrom: s.data.priceFrom ?? null,
      priceCurrency: 'MAD',
      areaServed: ['Tanger', 'Tanger-Tétouan-Al Hoceïma', 'Maroc'],
      provider: {
        name: 'Consulting Maghreb Expertise',
        url: SITE,
        type: 'AccountingService',
      },
      datePublished: s.data.publishedTime ?? null,
      dateModified: s.data.modifiedTime ?? null,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

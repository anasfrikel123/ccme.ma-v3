/**
 * Verified client reviews exposed as JSON for agents that want the raw
 * testimonial corpus without scraping the /avis-clients HTML.
 *
 * Mirrors the same source-of-truth as the visible cards and the
 * Organization graph's Review schema.
 */

import type { APIRoute } from 'astro';
import { reviews, averageRating, reviewCount } from '~/data/reviews';

const SITE = 'https://www.ccme.ma';
export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = {
    schemaVersion: '2026-06',
    site: SITE,
    aggregateRating: {
      value: parseFloat(averageRating),
      bestRating: 5,
      worstRating: 1,
      reviewCount,
    },
    items: reviews.map((r) => ({
      author: r.author,
      authorActivity: r.company,
      rating: r.rating,
      datePublished: r.date,
      text: r.text,
      consent: 'written',
    })),
    publicationPolicy:
      "Chaque avis est publié avec l'accord écrit du client. Le cabinet conserve les pièces signées.",
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

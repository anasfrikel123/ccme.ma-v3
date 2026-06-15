/**
 * Blog index in JSON form. Lets agents enumerate articles by category,
 * filter by date, and pull keywords without scraping HTML pages.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://ccme.ma';
export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');
  posts.sort((a, b) => String(b.data.publishedTime).localeCompare(String(a.data.publishedTime)));

  const payload = {
    schemaVersion: '2026-06',
    site: SITE,
    locale: 'fr-MA',
    count: posts.length,
    items: posts.map((p) => ({
      slug: p.id,
      url: `${SITE}/blog/${p.id}`,
      markdownUrl: `${SITE}/blog/${p.id}.md`,
      title: p.data.title,
      description: p.data.description,
      category: p.data.category,
      author: p.data.author,
      publishedTime: p.data.publishedTime,
      modifiedTime: p.data.modifiedTime ?? null,
      keywords: p.data.keywords ?? [],
      about: p.data.about ?? [],
      heroImage: p.data.heroImage ? `${SITE}${p.data.heroImage}` : null,
      related: (p.data.related ?? []).map((slug: string) => ({
        slug,
        url: `${SITE}/blog/${slug}`,
      })),
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

/**
 * Raw-markdown access for blog posts.
 *
 * Convention: GET /blog/<slug>.md returns the article's clean markdown
 * source (frontmatter + body). Anthropic, OpenAI, and Perplexity crawlers
 * increasingly check for sibling .md URLs because they're ~10x cheaper to
 * tokenise than rendered HTML.
 *
 * The HTML version still lives at /blog/<slug>; this endpoint is purely an
 * additional surface for AI ingestion.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';

const SITE = 'https://www.ccme.ma';
export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((p) => ({ params: { slug: p.id }, props: { post: p } }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = (props as any).post;
  const d = post.data;

  const fm = [
    `title: "${(d.title ?? '').replace(/"/g, '\\"')}"`,
    `description: "${(d.description ?? '').replace(/"/g, '\\"')}"`,
    `category: "${d.category ?? ''}"`,
    `publishedTime: "${d.publishedTime ?? ''}"`,
    d.modifiedTime ? `modifiedTime: "${d.modifiedTime}"` : null,
    `author: "${d.author ?? 'Équipe CCME'}"`,
    `url: "${SITE}/blog/${post.id}"`,
    d.keywords?.length ? `keywords: ${JSON.stringify(d.keywords)}` : null,
  ].filter(Boolean).join('\n');

  const out = `---\n${fm}\n---\n\n# ${d.title}\n\n${post.body ?? ''}\n`;

  return new Response(out, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
      'X-Content-Source': 'CCME canonical markdown',
    },
  });
};

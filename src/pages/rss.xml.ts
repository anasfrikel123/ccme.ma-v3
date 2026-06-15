import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const sorted = posts.sort(
    (a, b) => new Date(b.data.publishedTime).getTime() - new Date(a.data.publishedTime).getTime(),
  );

  return rss({
    title: 'CCME — Le Journal',
    description:
      'Articles, guides et analyses de l\'équipe Consulting Maghreb Expertise : fiscalité 2026, comptabilité, paie, création d\'entreprise au Maroc.',
    site: context.site?.toString() ?? 'https://ccme.ma',
    items: sorted.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: new Date(post.data.publishedTime),
      link: `/blog/${post.id}`,
      author: `info@ccme.ma (${post.data.author})`,
      categories: [post.data.category, ...(post.data.keywords ?? [])],
    })),
    customData: '<language>fr-MA</language><copyright>© Consulting Maghreb Expertise</copyright>',
    stylesheet: false,
  });
}

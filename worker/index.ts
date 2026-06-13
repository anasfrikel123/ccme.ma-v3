/**
 * Workers static-assets companion — markdown content negotiation for blog posts.
 * Mirrors functions/_middleware.ts so `wrangler deploy` (Workers Builds) and
 * `wrangler pages deploy` (Pages Functions) behave the same.
 */

interface Env {
  ASSETS: Fetcher;
}

const MD_SIBLING_PREFIXES = ['/blog/'];

function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const items = accept.split(',').map((part) => {
    const [media, ...params] = part.trim().split(';');
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    return {
      media: media.toLowerCase().trim(),
      q: q ? parseFloat(q.slice(2)) : 1,
    };
  });
  const md = items.find((i) => i.media === 'text/markdown');
  if (!md) return false;
  const html = items.find((i) => i.media === 'text/html' || i.media === '*/*');
  if (!html) return md.q > 0;
  return md.q > html.q;
}

function isMdNegotiable(pathname: string): boolean {
  if (pathname.endsWith('.md')) return false;
  if (pathname.endsWith('/')) pathname = pathname.replace(/\/$/, '');
  return MD_SIBLING_PREFIXES.some(
    (p) => pathname.startsWith(p) && pathname.length > p.length,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (
      request.method === 'GET' &&
      isMdNegotiable(url.pathname) &&
      prefersMarkdown(request.headers.get('Accept'))
    ) {
      const mdUrl = new URL(url.toString());
      mdUrl.pathname = url.pathname.replace(/\/$/, '') + '.md';
      const mdResponse = await env.ASSETS.fetch(new Request(mdUrl.toString(), request));
      if (mdResponse.ok) {
        const body = await mdResponse.text();
        const headers = new Headers(mdResponse.headers);
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('Vary', 'Accept');
        headers.set('X-Markdown-Negotiated', '1');
        headers.set('X-Markdown-Tokens', String(Math.ceil(body.length / 4)));
        return new Response(body, { status: 200, headers });
      }
    }

    const response = await env.ASSETS.fetch(request);
    if (isMdNegotiable(url.pathname)) {
      const headers = new Headers(response.headers);
      headers.append('Vary', 'Accept');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
    return response;
  },
};

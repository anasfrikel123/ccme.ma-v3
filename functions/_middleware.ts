/**
 * Cloudflare Pages Function — runs before every static asset is served.
 *
 * Sole responsibility today: implement RFC-style content negotiation for
 * agents that send `Accept: text/markdown`. When such a request hits a
 * blog HTML page, we transparently rewrite the upstream fetch to the
 * sibling `.md` source (which is already produced by the static build).
 * Browsers and regular clients are untouched.
 *
 * Cloudflare's own write-up of this pattern lives at:
 *   https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
 *
 * Why this is safe to drop in:
 *   - We only rewrite when the Accept header *prefers* markdown (q value
 *     parsing handled below).
 *   - We only rewrite for routes where a `.md` sibling is known to exist
 *     (currently `/blog/<slug>` — every blog post emits `<slug>.md` at
 *     build time).
 *   - On any failure we fall through to the default static handler, so a
 *     misrouted request still returns the regular HTML page.
 */

interface PagesContext {
  request: Request;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Record<string, unknown>;
}

const MD_SIBLING_PREFIXES = ['/blog/'];

function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  // Parse a simple Accept header. We only need to know whether
  // text/markdown's q value is strictly higher than text/html's.
  const items = accept.split(',').map((part) => {
    const [media, ...params] = part.trim().split(';');
    const q = params
      .map((p) => p.trim())
      .find((p) => p.startsWith('q='));
    return {
      media: media.toLowerCase().trim(),
      q: q ? parseFloat(q.slice(2)) : 1,
    };
  });
  const md = items.find((i) => i.media === 'text/markdown');
  if (!md) return false;
  const html = items.find(
    (i) => i.media === 'text/html' || i.media === '*/*',
  );
  if (!html) return md.q > 0;
  return md.q > html.q;
}

function isMdNegotiable(pathname: string): boolean {
  if (pathname.endsWith('.md')) return false; // already markdown
  if (pathname.endsWith('/')) pathname = pathname.replace(/\/$/, '');
  return MD_SIBLING_PREFIXES.some(
    (p) => pathname.startsWith(p) && pathname.length > p.length,
  );
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, next } = context;
  const url = new URL(request.url);

  if (
    request.method === 'GET' &&
    isMdNegotiable(url.pathname) &&
    prefersMarkdown(request.headers.get('Accept'))
  ) {
    // Build an in-process rewrite to the .md sibling. This avoids the
    // extra hop a sub-fetch would incur and lets Pages serve the static
    // markdown asset through the same dispatch the original request was
    // already in.
    const mdUrl = new URL(url.toString());
    mdUrl.pathname = url.pathname.replace(/\/$/, '') + '.md';
    const rewritten = new Request(mdUrl.toString(), request);
    const mdResponse = await next(rewritten);
    if (mdResponse.ok) {
      const body = await mdResponse.text();
      const headers = new Headers(mdResponse.headers);
      headers.set('Content-Type', 'text/markdown; charset=utf-8');
      headers.set('Vary', 'Accept');
      headers.set('X-Markdown-Negotiated', '1');
      // Approximate token count is helpful for agent budgeting; a coarse
      // ~4-chars-per-token average is close enough for orchestration.
      headers.set(
        'X-Markdown-Tokens',
        String(Math.ceil(body.length / 4)),
      );
      return new Response(body, {
        status: 200,
        headers,
      });
    }
  }

  // Default path: serve the regular static asset.
  const response = await next();
  // Always advertise Vary: Accept on negotiable routes so well-behaved
  // caches don't cross-pollinate HTML and markdown variants.
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
};

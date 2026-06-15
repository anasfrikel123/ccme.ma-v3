#!/usr/bin/env node
// Pre-GSC SEO audit — crawls live site, validates per-page SEO signals,
// compares against legacy domain, runs PageSpeed Insights, writes a
// timestamped Markdown report to seo-audit-report.md.
//
// Zero new dependencies — uses native fetch + regex parsing. Brittle on
// malformed HTML but fine for our well-formed Astro output.
//
// Usage:  node scripts/seo-audit.mjs
//         node scripts/seo-audit.mjs --skip-psi   (skip PageSpeed Insights API)

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(__dirname);

const NEW_SITE = 'https://ccme.ma';
const OLD_SITE = 'https://www.ccme.ma';
const CONCURRENCY = 6;
const PSI_PAGES = [
  '/',
  '/services/',
  '/cabinet',
  '/blog',
  '/outils/simulateur-is',
];
const SKIP_PSI = process.argv.includes('--skip-psi');

const findings = {
  // hard blockers
  non200: [],
  missingTitle: [],
  duplicateTitle: [],
  longTitle: [],
  shortTitle: [],
  missingDesc: [],
  duplicateDesc: [],
  longDesc: [],
  shortDesc: [],
  missingCanonical: [],
  badCanonical: [],
  missingLang: [],
  // tier 1
  missingH1: [],
  multipleH1: [],
  skippedHeading: [],
  emptyAltImages: [],
  imageMissingAlt: [],
  jsonLdParseError: [],
  jsonLdTypes: {},
  brokenInternalLinks: [],
  mixedContent: [],
  missingOg: [],
  missingTwitter: [],
  // robots / sitemap / 404
  robotsIssue: [],
  sitemapIssue: [],
  notFound404Soft: false,
  // duplicate-content
  duplicateWithLegacy: [],
  // psi
  psiResults: [],
  // perf summary
  totalUrls: 0,
  fetched: 0,
  fetchErrors: [],
};

const cache = {
  pages: new Map(), // url -> { status, html, headers }
};

// ---------- helpers --------------------------------------------------------

function log(...args) {
  console.log('[seo-audit]', ...args);
}

async function fetchWithRetry(url, opts = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        redirect: 'manual',
        headers: { 'User-Agent': 'CCME-SEO-Audit/1.0' },
        ...opts,
      });
      const text = await res.text();
      return { status: res.status, headers: Object.fromEntries(res.headers), text };
    } catch (e) {
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

async function pool(items, fn, concurrency = CONCURRENCY) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        try {
          results[i] = await fn(items[i], i);
        } catch (e) {
          results[i] = { __error: e.message };
        }
      }
    })
  );
  return results;
}

const decodeEntities = (s) =>
  s
    ? s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
    : s;

// extract <title>
function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

// Parse all attribute pairs in a tag body. Handles double or single quoted
// values; returns lowercased keys. e.g. ` name="x" content="y'z" ` →
// { name: "x", content: "y'z" }.
function parseAttrs(tagBody) {
  const attrs = {};
  // matches:  key="value"   or   key='value'   or   key=bareword
  const re = /([a-zA-Z_:][a-zA-Z0-9_:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m;
  while ((m = re.exec(tagBody)) !== null) {
    const key = m[1].toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    attrs[key] = decodeEntities(val);
  }
  return attrs;
}

function* iterTags(html, tagName) {
  const re = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
  let m;
  while ((m = re.exec(html)) !== null) yield m[1];
}

// extract <meta name="..." content="...">
function extractMeta(html, name, attr = 'name') {
  const target = name.toLowerCase();
  const targetAttr = attr.toLowerCase();
  for (const body of iterTags(html, 'meta')) {
    const a = parseAttrs(body);
    if ((a[targetAttr] || '').toLowerCase() === target && a.content !== undefined) {
      return a.content;
    }
  }
  return null;
}

// extract <link rel="..." href="...">
function extractLink(html, rel) {
  const target = rel.toLowerCase();
  for (const body of iterTags(html, 'link')) {
    const a = parseAttrs(body);
    // rel may be space-separated list (e.g. "alternate stylesheet")
    const rels = (a.rel || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (rels.includes(target) && a.href !== undefined) {
      return a.href;
    }
  }
  return null;
}

function extractHtmlLang(html) {
  const m = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function _scanHeadings(src) {
  const headings = [];
  const re = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(src)) !== null) {
    headings.push({
      level: parseInt(m[1].slice(1)),
      text: decodeEntities(m[2].replace(/<[^>]+>/g, '').trim()),
    });
  }
  return headings;
}

// Returns { all, main } — `all` finds H1 across the whole page;
// `main` excludes <footer>/<nav>/<aside> to evaluate hierarchy
// (those are independent landmarks per WAI-ARIA).
function extractHeadings(html) {
  const all = _scanHeadings(html);
  const mainOnly = html
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, '')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, '');
  const main = _scanHeadings(mainOnly);
  return { all, main };
}

function extractImages(html) {
  // strip script/style bodies to avoid matching <img> inside JS template literals
  const stripped = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const imgs = [];
  const re = /<img\b[^>]*>/gi;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const tag = m[0];
    const tagIndex = m.index;
    const srcMatch = tag.match(/\bsrc=["']([^"']*)["']/i);
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    const ariaHidden = /\baria-hidden=["']true["']/i.test(tag);
    const role = tag.match(/\brole=["']([^"']*)["']/i)?.[1] || '';
    // Parent wrappers (figure, a, div) may carry aria-hidden for decorative clusters.
    const before = stripped.slice(Math.max(0, tagIndex - 400), tagIndex);
    const parentHidden = /(?:<(?:figure|a|div)\b[^>]*\baria-hidden=["']true["'][^>]*>)\s*$/i.test(before)
      || /<a\b[^>]*\baria-label=["'][^"']+["'][^>]*>\s*(?:<picture\b[^>]*>\s*)?$/i.test(before);
    imgs.push({
      src: srcMatch ? srcMatch[1] : null,
      hasAltAttr: altMatch !== null,
      alt: altMatch ? decodeEntities(altMatch[1]) : null,
      decorative: ariaHidden || role === 'presentation' || role === 'none' || parentHidden,
    });
  }
  // dedupe per src — components like marquees can repeat the same image
  const seen = new Set();
  return imgs.filter((i) => {
    if (!i.src) return true;
    const key = i.src;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractLinks(html) {
  // strip <script> and <style> bodies first — they may contain JS template
  // literals like `<a href="${url}">` which are not actual links.
  const stripped = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');
  const links = [];
  const re = /<a\b[^>]+href=["']([^"']*)["'][^>]*>/gi;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    // skip JS expressions and pseudo-protocols
    const href = m[1];
    if (!href || href.startsWith('javascript:') || href.startsWith('#')) continue;
    if (/\$\{/.test(href)) continue;
    links.push(href);
  }
  return links;
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1].trim());
  }
  return blocks;
}

function detectMixedContent(html, pageUrl) {
  if (!pageUrl.startsWith('https://')) return [];
  const found = new Set();
  // <script src="http://...">, <link href="http://...">, <img src="http://...">, etc.
  const re = /(?:src|href)=["']http:\/\/[^"']+["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    found.add(m[0]);
  }
  return [...found];
}

// normalise URL (strip query/hash, trailing slash)
function normalize(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    url.search = '';
    let p = url.pathname.replace(/\/+$/, '') || '/';
    return url.origin + p;
  } catch {
    return u;
  }
}

function isSameOrigin(u, origin) {
  try {
    return new URL(u).origin === origin;
  } catch {
    return false;
  }
}

function isAbsolute(u) {
  return /^https?:\/\//i.test(u);
}

function resolveUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

// ---------- sitemap discovery ---------------------------------------------

async function discoverUrls() {
  log('discovering URLs from sitemap-index.xml...');
  const seen = new Set();
  const queue = [`${NEW_SITE}/sitemap-index.xml`, `${NEW_SITE}/sitemap-0.xml`];
  const urls = new Set();

  while (queue.length) {
    const sm = queue.shift();
    if (seen.has(sm)) continue;
    seen.add(sm);
    try {
      const r = await fetchWithRetry(sm);
      if (r.status !== 200) {
        findings.sitemapIssue.push(`${sm} returned HTTP ${r.status}`);
        continue;
      }
      const locs = [...r.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      for (const loc of locs) {
        if (loc.endsWith('.xml')) queue.push(loc);
        else urls.add(normalize(loc));
      }
    } catch (e) {
      findings.sitemapIssue.push(`${sm} fetch error: ${e.message}`);
    }
  }
  return [...urls].sort();
}

// ---------- per-page audit -------------------------------------------------

async function auditPage(url) {
  const r = await fetchWithRetry(url).catch((e) => ({ status: 0, error: e.message, text: '' }));
  if (r.error) {
    findings.fetchErrors.push({ url, error: r.error });
    return null;
  }
  if (r.status !== 200) {
    findings.non200.push({ url, status: r.status });
    return null;
  }
  cache.pages.set(url, r);
  findings.fetched++;

  const html = r.text;
  const title = extractTitle(html);
  const desc = extractMeta(html, 'description');
  const canonical = extractLink(html, 'canonical');
  const lang = extractHtmlLang(html);
  const ogTitle = extractMeta(html, 'og:title', 'property');
  const ogDesc = extractMeta(html, 'og:description', 'property');
  const ogImage = extractMeta(html, 'og:image', 'property');
  const twitterCard = extractMeta(html, 'twitter:card');
  const headingScope = extractHeadings(html);
  const headings = headingScope.main;
  const allHeadings = headingScope.all;
  const images = extractImages(html);
  const links = extractLinks(html);
  const jsonLdBlocks = extractJsonLd(html);
  const mixed = detectMixedContent(html, url);

  // title
  if (!title) findings.missingTitle.push(url);
  else {
    if (title.length > 60) findings.longTitle.push({ url, len: title.length, title });
    if (title.length < 25) findings.shortTitle.push({ url, len: title.length, title });
  }

  // description
  if (!desc) findings.missingDesc.push(url);
  else {
    if (desc.length > 160) findings.longDesc.push({ url, len: desc.length, desc });
    if (desc.length < 70) findings.shortDesc.push({ url, len: desc.length, desc });
  }

  // canonical
  if (!canonical) findings.missingCanonical.push(url);
  else {
    const cn = normalize(canonical);
    if (cn !== url && !cn.startsWith(NEW_SITE)) {
      findings.badCanonical.push({ url, canonical });
    }
  }

  // lang
  if (!lang) findings.missingLang.push(url);

  // h1 — count across the whole document (including <header> hero banners).
  const h1s = allHeadings.filter((h) => h.level === 1);
  if (h1s.length === 0) findings.missingH1.push(url);
  if (h1s.length > 1) findings.multipleH1.push({ url, count: h1s.length });

  // heading hierarchy: report jumps of >1 level (e.g. h1 -> h3)
  for (let i = 1; i < headings.length; i++) {
    const jump = headings[i].level - headings[i - 1].level;
    if (jump > 1) {
      findings.skippedHeading.push({
        url,
        from: `h${headings[i - 1].level}`,
        to: `h${headings[i].level}`,
        text: headings[i].text.slice(0, 60),
      });
      break; // one report per page is enough
    }
  }

  // images
  for (const img of images) {
    if (!img.src) continue;
    if (img.decorative) continue; // decorative imgs may legit have empty alt
    if (!img.hasAltAttr) findings.imageMissingAlt.push({ url, src: img.src });
    else if (img.alt === '' || img.alt.trim() === '')
      findings.emptyAltImages.push({ url, src: img.src });
  }

  // json-ld
  for (const block of jsonLdBlocks) {
    try {
      const data = JSON.parse(block);
      const types = Array.isArray(data) ? data.map((d) => d['@type']) : [data['@type']];
      for (const t of types.flat()) {
        if (!t) continue;
        findings.jsonLdTypes[t] = (findings.jsonLdTypes[t] || 0) + 1;
      }
    } catch (e) {
      findings.jsonLdParseError.push({ url, error: e.message, snippet: block.slice(0, 200) });
    }
  }

  // mixed content
  if (mixed.length) findings.mixedContent.push({ url, refs: mixed.slice(0, 5) });

  // og / twitter
  if (!ogTitle || !ogDesc || !ogImage) findings.missingOg.push({ url, has: { ogTitle: !!ogTitle, ogDesc: !!ogDesc, ogImage: !!ogImage } });
  if (!twitterCard) findings.missingTwitter.push(url);

  return {
    url,
    title,
    desc,
    canonical,
    headings,
    links: links.map((l) => resolveUrl(url, l)).filter(Boolean),
    contentLen: html.length,
    contentHash: simpleHash(html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/\s+/g, ' ').toLowerCase()),
  };
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h.toString(36);
}

// ---------- duplicate detection -------------------------------------------

function detectDuplicates(pages) {
  const titleMap = new Map();
  const descMap = new Map();
  for (const p of pages) {
    if (!p) continue;
    if (p.title) {
      if (!titleMap.has(p.title)) titleMap.set(p.title, []);
      titleMap.get(p.title).push(p.url);
    }
    if (p.desc) {
      if (!descMap.has(p.desc)) descMap.set(p.desc, []);
      descMap.get(p.desc).push(p.url);
    }
  }
  for (const [title, urls] of titleMap) {
    if (urls.length > 1) findings.duplicateTitle.push({ title, urls });
  }
  for (const [desc, urls] of descMap) {
    if (urls.length > 1) findings.duplicateDesc.push({ desc, urls });
  }
}

// ---------- internal link validation ---------------------------------------

async function validateInternalLinks(pages) {
  log('validating internal links...');
  const linkSet = new Set();
  const linkSources = new Map(); // link -> [sourceUrl]
  for (const p of pages) {
    if (!p) continue;
    for (const l of p.links) {
      if (!isSameOrigin(l, NEW_SITE)) continue;
      const norm = normalize(l);
      linkSet.add(norm);
      if (!linkSources.has(norm)) linkSources.set(norm, []);
      linkSources.get(norm).push(p.url);
    }
  }
  const targets = [...linkSet];
  log(`  checking ${targets.length} unique internal targets`);
  await pool(targets, async (target) => {
    if (cache.pages.has(target)) {
      const r = cache.pages.get(target);
      if (r.status !== 200) {
        findings.brokenInternalLinks.push({
          target,
          status: r.status,
          referencedBy: linkSources.get(target).slice(0, 5),
        });
      }
      return;
    }
    try {
      const r = await fetchWithRetry(target, { method: 'HEAD' });
      if (r.status !== 200 && r.status !== 301 && r.status !== 302) {
        // some servers don't support HEAD; try GET
        const r2 = await fetchWithRetry(target);
        if (r2.status !== 200) {
          findings.brokenInternalLinks.push({
            target,
            status: r2.status,
            referencedBy: linkSources.get(target).slice(0, 5),
          });
        }
      }
    } catch (e) {
      findings.brokenInternalLinks.push({
        target,
        status: 'fetch-error',
        error: e.message,
        referencedBy: linkSources.get(target).slice(0, 5),
      });
    }
  });
}

// ---------- 404 / robots --------------------------------------------------

async function check404Behavior() {
  log('checking 404 behavior...');
  const r = await fetchWithRetry(`${NEW_SITE}/this-page-definitely-does-not-exist-${Date.now()}`);
  if (r.status === 200) {
    findings.notFound404Soft = true;
  }
  return r.status;
}

async function checkRobots() {
  log('checking robots.txt...');
  const r = await fetchWithRetry(`${NEW_SITE}/robots.txt`);
  if (r.status !== 200) {
    findings.robotsIssue.push(`HTTP ${r.status}`);
    return;
  }
  if (!r.text.toLowerCase().includes('sitemap:')) {
    findings.robotsIssue.push('robots.txt missing Sitemap: directive');
  }
  // Detect a global block for the wildcard user-agent specifically:
  //   User-agent: *
  //   Disallow: /
  // (without a subsequent Allow:). Single-line `Disallow: /` patterns
  // applied to specific bots are fine and shouldn't trigger here.
  const blocks = r.text.split(/^\s*(?=User-agent:)/m);
  for (const blk of blocks) {
    const ua = blk.match(/^\s*User-agent:\s*(\S+)/im);
    if (!ua || ua[1] !== '*') continue;
    const disallowAll = /^\s*Disallow:\s*\/\s*$/im.test(blk);
    const hasAllow = /^\s*Allow:\s*\//im.test(blk);
    if (disallowAll && !hasAllow) {
      findings.robotsIssue.push('robots.txt blocks all crawlers (User-agent: * + Disallow: /) with no Allow override');
    }
  }
}

// ---------- duplicate vs legacy site --------------------------------------

async function detectLegacyOverlap(pages) {
  log('checking duplicate-content with legacy ccme.ma...');
  // Map likely overlap candidates: each Astro page slug → legacy capitalized HTML name.
  const candidates = [
    { astro: '/services/', legacy: '/Services.html' },
    { astro: '/cabinet', legacy: '/Cabinet.html' },
    { astro: '/contact', legacy: '/Contact.html' },
    { astro: '/services/tenue-comptabilite', legacy: '/Tenue-Comptabilite.html' },
    { astro: '/services/conseil-fiscal', legacy: '/Conseil-Fiscal.html' },
    { astro: '/services/conseil-juridique', legacy: '/Conseil-Juridique.html' },
    { astro: '/services/paie-grh', legacy: '/Paie-GRH.html' },
    { astro: '/services/creation-entreprise', legacy: '/Creation-Entreprise.html' },
    { astro: '/services/domiciliation', legacy: '/Domiciliation.html' },
    { astro: '/mentions-legales', legacy: '/Mentions-Legales.html' },
    { astro: '/confidentialite', legacy: '/Confidentialite.html' },
  ];
  const results = await pool(candidates, async (c) => {
    const newUrl = `${NEW_SITE}${c.astro}`;
    const oldUrl = `${OLD_SITE}${c.legacy}`;
    const [n, o] = await Promise.all([
      fetchWithRetry(newUrl).catch(() => null),
      fetchWithRetry(oldUrl).catch(() => null),
    ]);
    if (!n || !o || n.status !== 200 || o.status !== 200) return null;
    // very rough text similarity using shared 4-grams
    const sim = textSimilarity(n.text, o.text);
    return { newUrl, oldUrl, similarity: sim };
  });
  for (const r of results) {
    if (!r) continue;
    if (r.similarity >= 0.55) findings.duplicateWithLegacy.push(r);
  }
}

function textSimilarity(a, b) {
  const stripA = a.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  const stripB = b.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  const grams = (s) => {
    const set = new Set();
    for (let i = 0; i < s.length - 5; i += 1) set.add(s.slice(i, i + 6));
    return set;
  };
  const A = grams(stripA);
  const B = grams(stripB);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

// ---------- PageSpeed Insights --------------------------------------------

async function runPSI(pageUrl, strategy) {
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(pageUrl)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
  const r = await fetchWithRetry(api, {}, 1);
  if (r.status !== 200) return { url: pageUrl, strategy, error: `HTTP ${r.status}` };
  try {
    const data = JSON.parse(r.text);
    const cats = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};
    return {
      url: pageUrl,
      strategy,
      perf: Math.round((cats.performance?.score || 0) * 100),
      a11y: Math.round((cats.accessibility?.score || 0) * 100),
      bp: Math.round((cats['best-practices']?.score || 0) * 100),
      seo: Math.round((cats.seo?.score || 0) * 100),
      lcp: audits['largest-contentful-paint']?.displayValue || '?',
      cls: audits['cumulative-layout-shift']?.displayValue || '?',
      tbt: audits['total-blocking-time']?.displayValue || '?',
      inp: audits['interaction-to-next-paint']?.displayValue || 'n/a',
    };
  } catch (e) {
    return { url: pageUrl, strategy, error: 'JSON parse failed: ' + e.message };
  }
}

async function runAllPSI() {
  if (SKIP_PSI) {
    log('skipping PageSpeed Insights (--skip-psi)');
    return;
  }
  log('running PageSpeed Insights on key pages (mobile + desktop, sequential to avoid 429)...');
  const tasks = [];
  for (const path of PSI_PAGES) {
    tasks.push({ url: `${NEW_SITE}${path}`, strategy: 'mobile' });
    tasks.push({ url: `${NEW_SITE}${path}`, strategy: 'desktop' });
  }
  // PSI without API key has aggressive per-IP rate limits (returns 429
  // when 2-3 requests overlap). Run strictly sequentially with a 6s gap
  // between requests, plus exponential backoff on 429.
  const results = [];
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    let attempt = 0;
    let result;
    while (attempt < 4) {
      result = await runPSI(t.url, t.strategy);
      if (!result.error || !String(result.error).includes('429')) break;
      const waitMs = 8000 * (attempt + 1);
      log(`  PSI 429 on ${t.url} (${t.strategy}) — backing off ${waitMs}ms`);
      await new Promise((r) => setTimeout(r, waitMs));
      attempt++;
    }
    log(`  PSI ${i + 1}/${tasks.length}: ${t.strategy} ${t.url.replace(NEW_SITE, '')} → ${result.error ? `error ${result.error}` : `perf ${result.perf} a11y ${result.a11y} bp ${result.bp} seo ${result.seo}`}`);
    results.push(result);
    if (i < tasks.length - 1) await new Promise((r) => setTimeout(r, 6000));
  }
  findings.psiResults = results;
}

// ---------- report generation ---------------------------------------------

function severity(count) {
  if (count === 0) return '✅';
  if (count <= 2) return '🟡';
  if (count <= 10) return '🟠';
  return '🔴';
}

function generateReport() {
  const t = new Date().toISOString();
  const stamp = t.replace(/[:.]/g, '-').slice(0, 19);
  const lines = [];
  const push = (...x) => lines.push(...x);

  push(`# SEO Pre-Crawl Audit — ${NEW_SITE}`);
  push(``);
  push(`Generated: ${t}`);
  push(`Pages crawled: ${findings.fetched} / ${findings.totalUrls}`);
  push(``);

  // ----- summary scoreboard -----
  push(`## Summary scoreboard`);
  push(``);
  push(`| Tier | Check | Issues | Status |`);
  push(`|---|---|---:|:---:|`);
  push(`| 0 | Non-200 pages in sitemap | ${findings.non200.length} | ${severity(findings.non200.length)} |`);
  push(`| 0 | Missing \`<title>\` | ${findings.missingTitle.length} | ${severity(findings.missingTitle.length)} |`);
  push(`| 0 | Duplicate titles | ${findings.duplicateTitle.length} | ${severity(findings.duplicateTitle.length)} |`);
  push(`| 0 | Title too long (>60) | ${findings.longTitle.length} | ${severity(findings.longTitle.length)} |`);
  push(`| 0 | Title too short (<25) | ${findings.shortTitle.length} | ${severity(findings.shortTitle.length)} |`);
  push(`| 0 | Missing meta description | ${findings.missingDesc.length} | ${severity(findings.missingDesc.length)} |`);
  push(`| 0 | Duplicate descriptions | ${findings.duplicateDesc.length} | ${severity(findings.duplicateDesc.length)} |`);
  push(`| 0 | Description too long (>160) | ${findings.longDesc.length} | ${severity(findings.longDesc.length)} |`);
  push(`| 0 | Description too short (<70) | ${findings.shortDesc.length} | ${severity(findings.shortDesc.length)} |`);
  push(`| 0 | Missing canonical | ${findings.missingCanonical.length} | ${severity(findings.missingCanonical.length)} |`);
  push(`| 0 | Bad/foreign canonical | ${findings.badCanonical.length} | ${severity(findings.badCanonical.length)} |`);
  push(`| 0 | Missing \`<html lang>\` | ${findings.missingLang.length} | ${severity(findings.missingLang.length)} |`);
  push(`| 0 | Soft 404 (404 returns 200) | ${findings.notFound404Soft ? 1 : 0} | ${findings.notFound404Soft ? '🔴' : '✅'} |`);
  push(`| 0 | robots.txt issues | ${findings.robotsIssue.length} | ${severity(findings.robotsIssue.length)} |`);
  push(`| 0 | sitemap issues | ${findings.sitemapIssue.length} | ${severity(findings.sitemapIssue.length)} |`);
  push(`| 1 | Missing H1 | ${findings.missingH1.length} | ${severity(findings.missingH1.length)} |`);
  push(`| 1 | Multiple H1s | ${findings.multipleH1.length} | ${severity(findings.multipleH1.length)} |`);
  push(`| 1 | Skipped heading levels | ${findings.skippedHeading.length} | ${severity(findings.skippedHeading.length)} |`);
  push(`| 1 | Images missing \`alt\` attr | ${findings.imageMissingAlt.length} | ${severity(findings.imageMissingAlt.length)} |`);
  push(`| 1 | Images with empty \`alt\` | ${findings.emptyAltImages.length} | ${severity(findings.emptyAltImages.length)} |`);
  push(`| 1 | JSON-LD parse errors | ${findings.jsonLdParseError.length} | ${severity(findings.jsonLdParseError.length)} |`);
  push(`| 1 | Broken internal links | ${findings.brokenInternalLinks.length} | ${severity(findings.brokenInternalLinks.length)} |`);
  push(`| 1 | Mixed-content refs | ${findings.mixedContent.length} | ${severity(findings.mixedContent.length)} |`);
  push(`| 1 | Pages missing OG tags | ${findings.missingOg.length} | ${severity(findings.missingOg.length)} |`);
  push(`| 1 | Pages missing Twitter card | ${findings.missingTwitter.length} | ${severity(findings.missingTwitter.length)} |`);
  push(`| 3 | Duplicate vs legacy ccme.ma | ${findings.duplicateWithLegacy.length} | ${findings.duplicateWithLegacy.length === 0 ? '✅' : '🟠'} |`);
  push(``);

  // ----- json-ld inventory -----
  push(`## JSON-LD inventory`);
  push(``);
  if (Object.keys(findings.jsonLdTypes).length === 0) {
    push(`No JSON-LD types found.`);
  } else {
    push(`| Type | Pages |`);
    push(`|---|---:|`);
    for (const [t, n] of Object.entries(findings.jsonLdTypes).sort((a, b) => b[1] - a[1])) {
      push(`| \`${t}\` | ${n} |`);
    }
  }
  push(``);

  // ----- detail sections -----
  function detailList(label, items, formatter) {
    if (!items || items.length === 0) return;
    push(`### ${label} (${items.length})`);
    push(``);
    for (const it of items.slice(0, 50)) push(`- ${formatter(it)}`);
    if (items.length > 50) push(`- _…and ${items.length - 50} more_`);
    push(``);
  }

  push(`## Details`);
  push(``);
  detailList('Non-200 pages', findings.non200, (i) => `\`${i.url}\` → HTTP ${i.status}`);
  detailList('Missing \\<title\\>', findings.missingTitle, (u) => `\`${u}\``);
  detailList('Duplicate titles', findings.duplicateTitle, (i) => `"${i.title}" — used on ${i.urls.length} pages: ${i.urls.slice(0, 3).map((u) => `\`${u}\``).join(', ')}${i.urls.length > 3 ? ' …' : ''}`);
  detailList('Title too long (>60 chars)', findings.longTitle, (i) => `[${i.len}] \`${i.url}\` → "${i.title}"`);
  detailList('Title too short (<25 chars)', findings.shortTitle, (i) => `[${i.len}] \`${i.url}\` → "${i.title}"`);
  detailList('Missing meta description', findings.missingDesc, (u) => `\`${u}\``);
  detailList('Duplicate meta descriptions', findings.duplicateDesc, (i) => `"${i.desc.slice(0, 80)}…" — used on ${i.urls.length} pages: ${i.urls.slice(0, 3).map((u) => `\`${u}\``).join(', ')}`);
  detailList('Description too long (>160 chars)', findings.longDesc, (i) => `[${i.len}] \`${i.url}\``);
  detailList('Description too short (<70 chars)', findings.shortDesc, (i) => `[${i.len}] \`${i.url}\` → "${i.desc}"`);
  detailList('Missing canonical', findings.missingCanonical, (u) => `\`${u}\``);
  detailList('Bad canonical (points off-site)', findings.badCanonical, (i) => `\`${i.url}\` → canonical=\`${i.canonical}\``);
  detailList('Missing \\<html lang\\>', findings.missingLang, (u) => `\`${u}\``);
  detailList('Missing H1', findings.missingH1, (u) => `\`${u}\``);
  detailList('Multiple H1s', findings.multipleH1, (i) => `\`${i.url}\` (${i.count} H1s)`);
  detailList('Skipped heading levels', findings.skippedHeading, (i) => `\`${i.url}\` jumps ${i.from}→${i.to} at "${i.text}"`);
  detailList('Images missing alt attribute', findings.imageMissingAlt, (i) => `\`${i.url}\` ← \`${i.src}\``);
  detailList('Images with empty alt (verify decorative intent)', findings.emptyAltImages, (i) => `\`${i.url}\` ← \`${i.src}\``);
  detailList('JSON-LD parse errors', findings.jsonLdParseError, (i) => `\`${i.url}\` → ${i.error}`);
  detailList('Broken internal links', findings.brokenInternalLinks, (i) => `\`${i.target}\` → ${i.status}, referenced by: ${i.referencedBy.map((u) => `\`${u}\``).join(', ')}`);
  detailList('Mixed-content references', findings.mixedContent, (i) => `\`${i.url}\` → ${i.refs.join(', ')}`);
  detailList('Pages missing OG tags', findings.missingOg, (i) => `\`${i.url}\` (ogTitle=${i.has.ogTitle}, ogDesc=${i.has.ogDesc}, ogImage=${i.has.ogImage})`);
  detailList('Pages missing Twitter card', findings.missingTwitter, (u) => `\`${u}\``);
  detailList('Duplicate content vs legacy ccme.ma', findings.duplicateWithLegacy, (i) => `\`${i.newUrl}\` ↔ \`${i.oldUrl}\` similarity ${(i.similarity * 100).toFixed(0)}%`);
  detailList('robots.txt issues', findings.robotsIssue, (s) => s);
  detailList('sitemap issues', findings.sitemapIssue, (s) => s);
  detailList('Fetch errors', findings.fetchErrors, (e) => `\`${e.url}\` → ${e.error}`);

  // ----- PSI -----
  push(`## PageSpeed Insights`);
  push(``);
  if (SKIP_PSI || findings.psiResults.length === 0) {
    push(`_(skipped)_`);
  } else {
    push(`| Page | Strategy | Perf | A11y | BP | SEO | LCP | CLS | TBT |`);
    push(`|---|---|---:|---:|---:|---:|---|---|---|`);
    for (const p of findings.psiResults) {
      if (p.error) {
        push(`| \`${p.url}\` | ${p.strategy} | error: ${p.error} ||||||||`);
        continue;
      }
      const s = (n) => (n >= 90 ? `**${n}** ✅` : n >= 75 ? `${n} 🟡` : `${n} 🔴`);
      push(`| \`${p.url.replace(NEW_SITE, '')}\` | ${p.strategy} | ${s(p.perf)} | ${s(p.a11y)} | ${s(p.bp)} | ${s(p.seo)} | ${p.lcp} | ${p.cls} | ${p.tbt} |`);
    }
  }
  push(``);

  push(`---`);
  push(``);
  push(`_Audit generated by \`scripts/seo-audit.mjs\`._`);
  push(``);

  const reportDir = join(ROOT, 'reports');
  mkdirSync(reportDir, { recursive: true });
  const outPath = join(reportDir, `seo-audit-${stamp}.md`);
  const latestPath = join(ROOT, 'seo-audit-report.md');
  const content = lines.join('\n');
  writeFileSync(outPath, content, 'utf8');
  writeFileSync(latestPath, content, 'utf8');
  log(`report: ${outPath}`);
  log(`latest: ${latestPath}`);
}

// ---------- main ----------------------------------------------------------

(async () => {
  const t0 = Date.now();
  const urls = await discoverUrls();
  findings.totalUrls = urls.length;
  log(`discovered ${urls.length} URLs`);

  log('checking robots.txt + 404 behavior...');
  await Promise.all([checkRobots(), check404Behavior()]);

  log(`crawling ${urls.length} pages with concurrency ${CONCURRENCY}...`);
  const pages = await pool(urls, auditPage);

  detectDuplicates(pages);
  await validateInternalLinks(pages);
  await detectLegacyOverlap(pages);
  await runAllPSI();

  generateReport();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  log(`done in ${elapsed}s`);
})().catch((e) => {
  console.error('[seo-audit] fatal:', e);
  process.exit(1);
});

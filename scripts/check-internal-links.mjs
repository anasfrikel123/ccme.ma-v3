// Crawl dist/ HTML files and verify every internal href resolves to a real
// built page (or a real fragment anchor inside a built page).
//
// Reports:
//   - hrefs that point to non-existent paths
//   - hrefs that point to a path with a fragment whose id() is not in target
//   - dist counts (sanity)
//
// Exit code: 1 if any broken links are found.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, posix, dirname, resolve } from 'node:path';

const DIST = resolve('dist');
const PUBLIC_FILES = resolve('public/files');

function publicFilesPresent() {
  if (!existsSync(PUBLIC_FILES)) return false;
  try {
    return readdirSync(PUBLIC_FILES).some((n) => !n.startsWith('.'));
  } catch {
    return false;
  }
}

const skipFilesPdfCheck = !publicFilesPresent();

function walk(d, acc = []) {
  for (const n of readdirSync(d)) {
    const f = join(d, n);
    if (statSync(f).isDirectory()) walk(f, acc);
    else if (f.endsWith('.html')) acc.push(f);
  }
  return acc;
}

const htmlFiles = walk(DIST);
const htmlSet = new Set(htmlFiles.map((f) => f.replace(/\\/g, '/')));

// Build the set of valid URL paths the dist exposes.
// /index.html → /, /foo/index.html → /foo/, /foo.html → /foo
const validPaths = new Set(['/']);
for (const f of htmlFiles) {
  const rel = f.replace(/\\/g, '/').slice(DIST.replace(/\\/g, '/').length);
  if (rel.endsWith('/index.html')) {
    validPaths.add(rel.slice(0, -'index.html'.length));        // /foo/
    if (rel !== '/index.html') validPaths.add(rel.slice(0, -'/index.html'.length)); // /foo
  } else if (rel.endsWith('.html')) {
    validPaths.add(rel.slice(0, -'.html'.length));             // /foo
  }
}

// Index every id="…" in every built HTML so we can check fragment anchors.
const idsByPath = new Map();
for (const f of htmlFiles) {
  const rel = f.replace(/\\/g, '/').slice(DIST.replace(/\\/g, '/').length);
  let routes = [];
  if (rel === '/index.html') routes = ['/'];
  else if (rel.endsWith('/index.html')) routes = [rel.slice(0, -'index.html'.length), rel.slice(0, -'/index.html'.length)];
  else if (rel.endsWith('.html')) routes = [rel.slice(0, -'.html'.length)];

  const html = readFileSync(f, 'utf8');
  const ids = new Set();
  for (const m of html.matchAll(/\bid=["']([^"'\s]+)["']/g)) ids.add(m[1]);
  for (const r of routes) idsByPath.set(r, ids);
}

const broken = [];
/** Only crawl navigation anchors — ignore <link rel="preload"> etc. */
const HREF_RE = /<a\b[^>]*\bhref=["'](\/[^"'#?]*)(\?[^"'#]*)?(#[^"']*)?["']/gi;

const ASSET_EXT_RE = /\.(svg|jpe?g|webp|avif|png|gif|ico|xml|txt|json|pdf|js|mjs|css|woff2?)$/i;

for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const fileRel = f.replace(/\\/g, '/').slice(DIST.replace(/\\/g, '/').length);

  for (const m of html.matchAll(HREF_RE)) {
    const path = m[1];
    const frag = (m[3] || '').slice(1);

    if (ASSET_EXT_RE.test(path)) {
      if (skipFilesPdfCheck && path.startsWith('/files/')) continue;
      const onDisk = join(DIST, path);
      if (!existsSync(onDisk)) {
        broken.push({ file: fileRel, href: m[0].slice(6, -1), reason: 'asset missing on disk' });
      }
      continue;
    }

    // Normalise — both /foo and /foo/ should be considered equivalent.
    const cleaned = path.replace(/\/$/, '') || '/';
    const variants = [path, cleaned, cleaned + '/'];
    const exists = variants.some((v) => validPaths.has(v));
    if (!exists) {
      broken.push({ file: fileRel, href: m[0].slice(6, -1), reason: 'no built page at this URL' });
      continue;
    }

    if (frag) {
      // Pick the canonical resolved route to look up ids.
      const route = (validPaths.has(cleaned + '/') ? cleaned + '/' : cleaned) || '/';
      const ids = idsByPath.get(route) || idsByPath.get('/');
      if (ids && !ids.has(frag)) {
        broken.push({ file: fileRel, href: m[0].slice(6, -1), reason: `fragment #${frag} not found on target page` });
      }
    }
  }
}

console.log(`Crawled ${htmlFiles.length} HTML files.`);
console.log(`Indexed ${validPaths.size} valid routes.`);
if (skipFilesPdfCheck) {
  console.log('Note: public/files/ is empty — skipping /files/*.pdf link checks (copy PDF assets before deploy).');
}

if (broken.length === 0) {
  console.log('No broken internal links.');
  process.exit(0);
}

// Group by reason so the worst classes pop first.
const byReason = new Map();
for (const b of broken) {
  if (!byReason.has(b.reason)) byReason.set(b.reason, []);
  byReason.get(b.reason).push(b);
}
console.log(`\n${broken.length} broken links:`);
for (const [reason, list] of byReason) {
  console.log(`\n— ${reason} (${list.length})`);
  for (const b of list.slice(0, 25)) {
    console.log(`    ${b.file}  →  ${b.href}`);
  }
  if (list.length > 25) console.log(`    … and ${list.length - 25} more`);
}
process.exit(1);

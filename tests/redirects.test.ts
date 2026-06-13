/**
 * _redirects contract: every legacy .html path maps 301 → a page that exists in dist/.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const hasDist = existsSync(join(DIST, 'index.html'));

type RedirectRule = { from: string; to: string; status: number };

function parseRedirects(raw: string): RedirectRule[] {
  return raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((line) => {
      const parts = line.split(/\s+/);
      const from = parts[0];
      const to = parts[1];
      const status = Number(parts[2] ?? '302');
      return { from, to, status };
    });
}

function distPageExists(pathname: string): boolean {
  const clean = pathname.replace(/^\//, '').replace(/\/$/, '');
  if (!clean) return existsSync(join(DIST, 'index.html'));
  return (
    existsSync(join(DIST, `${clean}.html`)) ||
    existsSync(join(DIST, clean, 'index.html'))
  );
}

describe('_redirects file', () => {
  const rules = parseRedirects(readFileSync(join(ROOT, 'public', '_redirects'), 'utf8'));

  it('defines at least 20 legacy 301 rules', () => {
    const permanent = rules.filter((r) => r.status === 301);
    expect(permanent.length).toBeGreaterThanOrEqual(20);
  });

  it('maps Tenue-Comptabilite.html → /services/tenue-comptabilite', () => {
    const rule = rules.find((r) => r.from === '/Tenue-Comptabilite.html');
    expect(rule?.to).toBe('/services/tenue-comptabilite');
    expect(rule?.status).toBe(301);
  });

  it('copies _redirects into dist for Cloudflare Pages', () => {
    expect(existsSync(join(DIST, '_redirects')) || !hasDist).toBe(true);
  });
});

describe.skipIf(!hasDist)('redirect targets exist in dist', () => {
  const rules = parseRedirects(readFileSync(join(ROOT, 'public', '_redirects'), 'utf8'));

  it('every static 301 target resolves to a built HTML page', () => {
    const staticRules = rules.filter((r) => r.status === 301 && !r.to.includes(':'));
    for (const rule of staticRules) {
      expect(distPageExists(rule.to), `${rule.from} → ${rule.to}`).toBe(true);
    }
  });
});

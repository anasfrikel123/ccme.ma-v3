/**
 * Content ↔ code drift guard for IS examples in the reforme IS 2026 blog.
 * Parses published markdown golden values and asserts computeIS() matches.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { computeIS } from './tax-maroc';

const BLOG = resolve(
  'src/content/blog/reforme-is-2026-pme-tanger.md',
);

/** Parse French amounts like 1,2M / 280K / 56 000. */
function parseAmount(token: string): number {
  const raw = token.replace(/\s/g, '').replace(',', '.');
  if (/M/i.test(token)) return parseFloat(raw) * 1_000_000;
  if (/K/i.test(token)) return parseFloat(raw) * 1_000;
  return parseFloat(raw);
}

function parseIs2026Examples(md: string): { ca: number; benefice: number; is2026: number }[] {
  const cases: { ca: number; benefice: number; is2026: number }[] = [];
  const blocks = md.split(/\*\*Cas \d+/);
  for (const block of blocks.slice(1)) {
    const caM = block.match(/CA\s+([\d,]+(?:[,.][\d]+)?[KkMm]?)\s*DH/i);
    const benM = block.match(/bénéfice\s+([\d,]+(?:[,.][\d]+)?[KkMm]?)\s*DH/i);
    const isM = block.match(/IS 2026\s*:[^*]*=\s*\*\*([\d\s]+)\s*DH\*\*/i);
    if (!caM || !benM || !isM) continue;

    cases.push({
      ca: parseAmount(caM[1]),
      benefice: parseAmount(benM[1]),
      is2026: parseInt(isM[1].replace(/\s/g, ''), 10),
    });
  }
  return cases;
}

describe('IS blog ↔ computeIS() consistency', () => {
  const md = readFileSync(BLOG, 'utf8');

  it('IS 2026 example lines use 20 % only (not legacy 12,5 / 22,75)', () => {
    const lines = md.split('\n').filter((l) => /^\s*-\s*IS 2026/i.test(l));
    expect(lines.length).toBeGreaterThanOrEqual(3);
    for (const line of lines) {
      expect(line).toMatch(/20\s*%/);
      expect(line).not.toMatch(/12,5\s*%/);
      expect(line).not.toMatch(/22,75\s*%/);
    }
  });

  it('blog does not tie 20 % rate to CA threshold (bénéfice net fiscal)', () => {
    expect(md).not.toMatch(/CA est inférieur à 100/i);
    expect(md).toMatch(/bénéfice net fiscal/i);
  });

  it('every IS 2026 worked example in blog matches computeIS()', () => {
    const examples = parseIs2026Examples(md);
    expect(examples.length).toBeGreaterThanOrEqual(3);

    for (const { ca, benefice, is2026 } of examples) {
      const r = computeIS(ca, benefice);
      expect(r.isCalc).toBe(is2026);
    }
  });

  it('flat 20 % shortcut: benefice × 20 % equals computeIS for PME-scale profits', () => {
    for (const benefice of [280_000, 850_000, 4_200_000]) {
      const flat = benefice * 0.2;
      expect(computeIS(0, benefice).isCalc).toBe(Math.round(flat));
    }
  });
});

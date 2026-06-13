/**
 * Cabinet identity literals must live in src/data/cabinet.ts only.
 * Catches phone / address drift before it reaches Footer, APIs, schema.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'src');

const CANONICAL = join(SRC, 'data', 'cabinet.ts');

/** Literals that must not appear outside cabinet.ts (src tree). */
const FORBIDDEN = [
  '644080749',
  '+212 644 080 749',
  '+212-644-080749',
  'Immeuble Moulay Ismail, Avenue Moulay Ismail, 3',
] as const;

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const f = join(dir, name);
    if (statSync(f).isDirectory()) {
      if (name === 'node_modules') continue;
      walk(f, acc);
    } else if (/\.(ts|astro|md|mjs)$/.test(f)) {
      acc.push(f);
    }
  }
  return acc;
}

describe('cabinet.ts single source of truth', () => {
  it('forbidden identity literals appear only in cabinet.ts', () => {
    const offenders: { file: string; pattern: string }[] = [];

    for (const file of walk(SRC)) {
      if (file.replace(/\\/g, '/') === CANONICAL.replace(/\\/g, '/')) continue;
      const text = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN) {
        if (text.includes(pattern)) {
          offenders.push({ file: relative(ROOT, file), pattern });
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

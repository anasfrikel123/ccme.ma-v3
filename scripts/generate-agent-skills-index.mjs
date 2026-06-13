// Generates /public/.well-known/agent-skills/index.json — the discovery
// manifest required by the Cloudflare Agent Skills Discovery RFC v0.2.0
// (https://github.com/cloudflare/agent-skills-discovery-rfc).
//
// Each entry carries a sha256 digest so an agent can verify it received the
// expected SKILL content. We compute hashes at build time so the manifest
// stays in sync whenever a SKILL.md changes.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { writeFileSafe } from './lib/write-file-safe.mjs';

const SKILLS_DIR = path.resolve('public/.well-known/agent-skills');
const SITE = 'https://www.ccme.ma';

const sha256 = (buf) =>
  'sha256-' + crypto.createHash('sha256').update(buf).digest('base64');

const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
const skills = [];

for (const e of entries) {
  if (!e.isDirectory()) continue;
  const skillPath = path.join(SKILLS_DIR, e.name, 'SKILL.md');
  let raw;
  try {
    raw = await fs.readFile(skillPath);
  } catch {
    continue;
  }

  // Extract frontmatter `description` line, fall back to first heading.
  const text = raw.toString('utf8');
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  let description = '';
  if (fm) {
    const m = fm[1].match(/^description:\s*(.+)$/m);
    if (m) description = m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  if (!description) {
    const h1 = text.match(/^# (.+)$/m);
    description = h1 ? h1[1].trim() : e.name;
  }

  skills.push({
    name: e.name,
    type: 'markdown',
    description,
    url: `${SITE}/.well-known/agent-skills/${e.name}/SKILL.md`,
    sha256: sha256(raw),
  });
}

// Stable order (alphabetical by name) so the digest of the index itself
// stays deterministic across builds.
skills.sort((a, b) => a.name.localeCompare(b.name));

const out = {
  $schema:
    'https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema/v0.2.0/agent-skills-index.json',
  version: '0.2.0',
  publisher: {
    name: 'Consulting Maghreb Expertise',
    url: SITE,
  },
  generatedAt: new Date().toISOString(),
  skills,
};

const dest = path.join(SKILLS_DIR, 'index.json');
await writeFileSafe(dest, JSON.stringify(out, null, 2));
console.log(
  `[agent-skills] wrote ${path.relative(process.cwd(), dest)} — ${
    skills.length
  } skill(s)`,
);

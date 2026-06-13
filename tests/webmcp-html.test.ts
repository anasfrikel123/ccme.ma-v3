/**
 * Rendered homepage must expose WebMCP tool registry matching agentEndpoints.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { agentEndpoints } from '~/data/agent-tools';

const INDEX = join(import.meta.dirname, '..', 'dist', 'index.html');
const hasDist = existsSync(INDEX);

describe.skipIf(!hasDist)('WebMCP HTML contract', () => {
  it('data-webmcp-tools JSON matches agentEndpoints registry', () => {
    const html = readFileSync(INDEX, 'utf8');
    const m = html.match(
      /<script[^>]*data-webmcp-tools[^>]*>([\s\S]*?)<\/script>/i,
    );
    expect(m).toBeTruthy();

    const parsed = JSON.parse(m![1].trim()) as { name: string; path: string }[];
    expect(parsed).toHaveLength(agentEndpoints.length);

    for (const endpoint of agentEndpoints) {
      const row = parsed.find((p) => p.name === endpoint.webmcpName);
      expect(row, `missing ${endpoint.webmcpName}`).toBeTruthy();
      expect(row!.path).toBe(endpoint.path);
    }
  });
});

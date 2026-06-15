import { describe, expect, it } from 'vitest';
import { agentEndpoints, fullEndpointUrl } from './agent-tools';

/**
 * The agent-tools registry is consumed by both the WebMCP tool list in
 * Base.astro and the agent-manifest endpoint. Both surfaces must stay in
 * lockstep — drift here is exactly the issue the registry was created to
 * solve, so we lock its shape with a contract test.
 */

describe('agentEndpoints — discovery registry', () => {
  it('exposes the five expected ids', () => {
    const ids = agentEndpoints.map((e) => e.id).sort();
    expect(ids).toEqual([
      'blog-index',
      'cabinet',
      'contact',
      'reviews',
      'services',
    ]);
  });

  it('every endpoint has a unique stable webmcp tool name prefixed with ccme_', () => {
    const names = agentEndpoints.map((e) => e.webmcpName);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) {
      expect(n.startsWith('ccme_')).toBe(true);
    }
  });

  it('every path is rooted at /api/ and ends in .json', () => {
    for (const e of agentEndpoints) {
      expect(e.path.startsWith('/api/')).toBe(true);
      expect(e.path.endsWith('.json')).toBe(true);
    }
  });

  it('builds canonical absolute URLs', () => {
    const url = fullEndpointUrl('/api/services.json');
    expect(url).toBe('https://ccme.ma/api/services.json');
  });

  it('every endpoint has a non-empty plain-French description', () => {
    for (const e of agentEndpoints) {
      expect(e.description.length).toBeGreaterThan(40);
    }
  });
});

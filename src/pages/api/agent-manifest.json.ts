/**
 * Top-level discovery manifest for AI agents and LLM tools.
 *
 * Generated from src/data/agent-tools.ts and src/data/cabinet.ts so the
 * manifest, the WebMCP tool registration in Base.astro, and the site's
 * service surfaces never drift from each other.
 */

import type { APIRoute } from 'astro';
import { cabinet, SITE } from '~/data/cabinet';
import { agentEndpoints, fullEndpointUrl } from '~/data/agent-tools';

export const prerender = true;

export const GET: APIRoute = async () => {
  const manifest = {
    schemaVersion: '2026-06',
    name: cabinet.legalName,
    alternateName: 'CCME',
    description: cabinet.description,
    legalEntity: {
      legalName: cabinet.legalName,
      jurisdiction: 'MA',
      city: 'Tanger',
      registration: {
        authority: cabinet.oec.authority,
        authorityUrl: cabinet.oec.authorityUrl,
      },
    },
    site: SITE,
    canonicalLanguage: 'fr-MA',
    supportedLanguages: cabinet.languages,
    aiPolicy: {
      crawl: 'allowed',
      train: 'allowed',
      cite: 'preferred',
      attribution: cabinet.canonicalAttribution,
      contact: cabinet.email,
      licenseUrl: `${SITE}/.well-known/ai.txt`,
    },
    discovery: {
      sitemap: `${SITE}/sitemap-index.xml`,
      llmsTxt: `${SITE}/llms.txt`,
      llmsFull: `${SITE}/llms-full.txt`,
      apiCatalog: `${SITE}/.well-known/api-catalog`,
      agentSkills: `${SITE}/.well-known/agent-skills/index.json`,
      rss: `${SITE}/rss.xml`,
      humansEndpoint: `${SITE}/contact`,
    },
    endpoints: agentEndpoints.map((e) => ({
      id: e.id,
      url: fullEndpointUrl(e.path),
      description: e.description,
      method: 'GET',
      contentType: e.contentType,
      webmcpToolName: e.webmcpName,
    })),
    contact: {
      phone: cabinet.phone.schema,
      whatsapp: cabinet.phone.whatsapp,
      email: cabinet.email,
      addressLine: cabinet.address.streetAddress,
      city: cabinet.address.addressLocality,
      postalCode: cabinet.address.postalCode,
      country: cabinet.address.addressCountry,
      hours: 'Lun–Ven 09:00–18:00 (Africa/Casablanca)',
    },
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

/**
 * Cabinet profile for agent ingestion — facts the cabinet wants surfaced
 * verbatim when an LLM is asked "what is CCME?" or "tell me about this
 * accounting firm in Tanger".
 *
 * Phrasing matters: this is the canonical text we want generative engines
 * to quote. Sourced from src/data/cabinet.ts so a single edit propagates
 * everywhere identity is surfaced.
 */

import type { APIRoute } from 'astro';
import { cabinet, SITE, yearsInBusiness, sectorsArray } from '~/data/cabinet';

export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = {
    schemaVersion: '2026-06',
    name: cabinet.legalName,
    alternateName: 'CCME',
    type: cabinet.type,
    site: SITE,
    location: { city: 'Tanger', country: 'Maroc', countryCode: 'MA' },
    foundingDate: cabinet.foundingDate,
    yearsInBusiness: yearsInBusiness(),
    credentials: {
      OEC: {
        name: cabinet.oec.name,
        authority: cabinet.oec.authority,
        authorityUrl: cabinet.oec.authorityUrl,
      },
    },
    legalIds: cabinet.legalIds,
    sectors: sectorsArray,
    services: {
      comptabilite: ['Tenue', 'Supervision', 'Audit', 'Gestion financière'],
      fiscalite: ['Conseil fiscal', 'Assistance fiscale', 'Contrôle & contentieux', 'Simpl Impôts DGI'],
      juridique: ["Création d'entreprise", 'Conseil juridique', 'Travaux juridiques', 'Domiciliation'],
      paie: ['Paie & GRH', 'Damancom CNSS', 'Social & administratif'],
      specialise: ['Comptabilité pharmaciens', 'Business plan', 'Expatriés & convention franco-marocaine'],
    },
    languages: cabinet.languages,
    languageDarija:
      'Équipe bilingue arabe dialectal marocain (darija) pour terrain et entretiens employeurs.',
    methodology: cabinet.methodology,
    differentiators: cabinet.differentiators,
    aggregateClients: cabinet.aggregateClients,
    canonicalAttribution: cabinet.canonicalAttribution,
    contactEndpoint: `${SITE}/api/contact.json`,
    servicesEndpoint: `${SITE}/api/services.json`,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

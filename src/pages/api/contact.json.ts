/**
 * Canonical contact information for the cabinet, served as JSON so agents
 * answering "how do I reach CCME" don't have to scrape the contact page HTML.
 */

import type { APIRoute } from 'astro';
import { cabinet, SITE } from '~/data/cabinet';

export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = {
    schemaVersion: '2026-06',
    name: cabinet.legalName,
    legalName: cabinet.legalName,
    type: 'AccountingService',
    site: SITE,
    phone: cabinet.phone,
    email: cabinet.email,
    address: cabinet.address,
    geo: cabinet.geo,
    map: { google: cabinet.googleMapsUrl },
    languages: cabinet.languages,
    timezone: cabinet.timezone,
    hours: cabinet.hours,
    appointment: {
      ...cabinet.appointment,
      languages: cabinet.languages,
    },
    socials: cabinet.socials,
    canonicalAttribution: cabinet.canonicalAttribution,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

/**
 * Single source of truth for every machine-readable agent surface this
 * site exposes. Importable from:
 *
 *   - src/pages/api/agent-manifest.json.ts  (declares the surfaces)
 *   - src/layouts/Base.astro                (registers WebMCP tools)
 *   - tests                                  (asserts no drift)
 *
 * Adding a new endpoint = one edit here, picked up everywhere.
 */

import { SITE } from './cabinet';

export interface AgentEndpoint {
  /** Stable slug, used as the WebMCP tool name suffix. */
  id: string;
  /** Path relative to the site root. */
  path: string;
  /** Plain-French description shown to agents. */
  description: string;
  /** WebMCP tool name (kept stable; agents key off this). */
  webmcpName: string;
  /** Response Content-Type. */
  contentType: string;
}

export const agentEndpoints: AgentEndpoint[] = [
  {
    id: 'services',
    path: '/api/services.json',
    description:
      'Liste tous les services proposés par le cabinet CCME (Tanger). Retourne le catalogue complet : compta, fiscalité, juridique, paie.',
    webmcpName: 'ccme_list_services',
    contentType: 'application/json',
  },
  {
    id: 'contact',
    path: '/api/contact.json',
    description:
      'Coordonnées canoniques du cabinet CCME : téléphone, email, adresse, horaires par jour, langues.',
    webmcpName: 'ccme_get_contact',
    contentType: 'application/json',
  },
  {
    id: 'cabinet',
    path: '/api/cabinet.json',
    description:
      'Profil du cabinet CCME : fondation, OEC, secteurs servis, méthodologie, langues.',
    webmcpName: 'ccme_get_cabinet',
    contentType: 'application/json',
  },
  {
    id: 'blog-index',
    path: '/api/blog.json',
    description:
      "Index du Journal CCME (articles de fond fiscalité, juridique, création d'entreprise au Maroc).",
    webmcpName: 'ccme_list_articles',
    contentType: 'application/json',
  },
  {
    id: 'reviews',
    path: '/api/reviews.json',
    description:
      'Avis clients vérifiés du cabinet CCME, avec note moyenne et nombre total.',
    webmcpName: 'ccme_get_reviews',
    contentType: 'application/json',
  },
];

export const fullEndpointUrl = (path: string): string => `${SITE}${path}`;

/**
 * Single source of truth for cabinet identity.
 *
 * Before this file existed, the same numbers (phone, address, founding
 * date, OEC credentials, hours, sectors, methodology, attribution string)
 * were duplicated across:
 *   - src/pages/index.astro      (Organization @graph)
 *   - src/pages/api/contact.json.ts
 *   - src/pages/api/cabinet.json.ts
 *   - src/components/Footer.astro
 *   - src/layouts/Base.astro     (WebMCP tool descriptions)
 *   - public/llms.txt
 *
 * Drift was a real risk: one phone-number change meant 5+ edits.
 * Everything that surfaces cabinet identity now imports from here.
 */

export const SITE = 'https://ccme.ma';

/** Moroccan business identifiers (ICE, IF, RC, Patente) — set via PUBLIC_CABINET_* env vars. */
const envLegalIds = {
  ice: import.meta.env.PUBLIC_CABINET_ICE?.trim() ?? '',
  if: import.meta.env.PUBLIC_CABINET_IF?.trim() ?? '',
  rc: import.meta.env.PUBLIC_CABINET_RC?.trim() ?? '',
  patente: import.meta.env.PUBLIC_CABINET_PATENTE?.trim() ?? '',
} as const;

export const cabinet = {
  legalName: 'Consulting Maghreb Expertise',
  alternateNames: ['CCME', 'Cabinet CCME', 'Consulting Maghreb Expertises', 'CCME Tanger'],
  type: ['AccountingService', 'ProfessionalService', 'LocalBusiness'] as const,
  site: SITE,
  slogan: 'La rigueur des chiffres, au service de votre croissance.',
  description:
    `Cabinet d'expertise comptable inscrit à l'OEC, à Tanger depuis ${new Date().getFullYear() - 2003} ans. Tenue, fiscalité, paie CNSS, conseil juridique pour PME, startups et expatriés.`,
  foundingDate: '2003',
  /** Seconds since epoch of `foundingDate` — used for "X years in business" UI. */
  foundedAt: new Date('2003-01-01T00:00:00Z'),

  phone: {
    e164: '+212644080749',
    schema: '+212-644-080749',
    display: '+212 644 080 749',
    tel: 'tel:+212644080749',
    whatsapp: 'https://wa.me/212644080749',
  },
  email: 'info@ccme.ma',

  address: {
    streetAddress: 'Immeuble Moulay Ismail, Avenue Moulay Ismail, 3e étage n°12',
    streetAddressLong: 'Immeuble Moulay Ismail, Avenue Moulay Ismail, 3ème étage n°12',
    addressLocality: 'Tanger',
    addressRegion: 'Tanger-Tétouan-Al Hoceïma',
    postalCode: '90000',
    addressCountry: 'MA',
    formatted: 'Immeuble Moulay Ismail, Avenue Moulay Ismail, 3e étage n°12, 90000 Tanger, Maroc',
  },
  geo: { latitude: 35.7802, longitude: -5.8136 },
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Consulting+Maghreb+Expertise+Tanger',

  languages: ['fr', 'en', 'ar'] as const,
  /**
   * Human-readable language list for schema. The schema spec wants full
   * English language names (`French`, `Arabic`, `English`).
   */
  schemaLanguages: ['French', 'English', 'Arabic'] as const,
  timezone: 'Africa/Casablanca',

  /** Per-day hours in 24h Africa/Casablanca. `null` = closed. */
  hours: [
    { day: 'Monday', open: '09:00', close: '18:00' },
    { day: 'Tuesday', open: '09:00', close: '18:00' },
    { day: 'Wednesday', open: '09:00', close: '18:00' },
    { day: 'Thursday', open: '09:00', close: '18:00' },
    { day: 'Friday', open: '09:00', close: '18:00' },
    { day: 'Saturday', open: '09:00', close: '13:00' },
    { day: 'Sunday', open: null, close: null, closed: true as const },
  ] as const,

  appointment: {
    url: `${SITE}/contact`,
    cost: 'free' as const,
    duration: 'PT45M' as const,
    modalities: ['in-person', 'phone', 'video'] as const,
    note: 'Premier RDV gratuit, sans engagement, sous 24h ouvrées.',
  },

  /**
   * Cal.com integration. Once the cabinet has a Cal.com account, set the
   * username + booking link slug here. The booking widget on /contact will
   * embed the picker inline. Until configured, the widget falls back to
   * displaying the standard form-only flow.
   *
   * Example values once set up:
   *   handle: 'ccme-tanger'
   *   eventSlug: 'premier-echange-30min'
   * Resulting public URL: https://cal.com/ccme-tanger/premier-echange-30min
   */
  calcom: {
    /** @configure Set this to your Cal.com username/handle */
    handle: '' as string,
    /** @configure Set this to the event slug (the 30-min "premier échange" link) */
    eventSlug: 'premier-echange-30min',
  },

  socials: [
    'https://www.linkedin.com/company/consulting-maghreb-expertises/',
    'https://www.facebook.com/ccme.ma',
  ],

  priceRange: '$$',
  currenciesAccepted: 'MAD, EUR',
  paymentAccepted: 'Virement, espèces, chèque',
  areasServed: [
    { type: 'City', name: 'Tanger' },
    { type: 'AdministrativeArea', name: 'Tanger-Tétouan-Al Hoceïma' },
    { type: 'Country', name: 'Morocco' },
  ] as const,

  oec: {
    name: "Inscrit à l'Ordre des Experts-Comptables du Maroc",
    authority: 'Ordre des Experts-Comptables du Maroc',
    authorityShort: 'OEC Maroc',
    authorityUrl: 'https://www.oec.ma/',
  },

  /** ICE, IF, RC, Patente — obligatoires sur factures et mentions légales (OEC). */
  legalIds: envLegalIds,

  sectors: [
    'PME et TPE multisectorielles',
    'Industrie en zones franches (TFZ, TAC, Tanger Tech)',
    'Import-export et transit Tanger Med',
    'E-commerce et SaaS',
    'Restauration et hôtellerie',
    'Professions libérales (médecins, dentistes, avocats, architectes)',
    'Pharmacies',
    'Expatriés et investisseurs étrangers (France, Espagne, Belgique)',
  ],

  knowsAbout: [
    'Expertise comptable Maroc',
    'Comptabilité PME Tanger',
    'Fiscalité marocaine',
    'Impôt sur les sociétés (IS) Maroc',
    'Taxe sur la valeur ajoutée (TVA) Maroc',
    'Impôt sur le revenu (IR) Maroc',
    'Cotisations sociales CNSS et AMO',
    'Damancom et déclarations sociales',
    'Simpl Impôts DGI',
    'Conseil juridique sociétés (SARL, SARLAU, SAS, SA)',
    "Création d'entreprise Maroc",
    "Zones d'accélération industrielle (TFZ, TAC, Tanger Tech)",
    'Tanger Med et import-export',
    'Office des Changes',
    'Convention fiscale franco-marocaine',
    'Contrôle fiscal et contentieux DGI',
    'Domiciliation et secrétariat juridique',
    'Paie et gestion sociale Maroc',
  ],

  methodology: {
    firstMeeting: 'gratuit, 30–45 min, sans engagement',
    pricing:
      "forfait mensuel + devis ferme avant intervention, pas de surfacturation horaire opaque",
    reporting:
      "mensuel pour la tenue, trimestriel pour le pilotage de gestion, alerte avant chaque échéance fiscale",
    software: ['Sage', 'Ciel', 'Logiciels marocains compatibles Simpl Impôts'],
  },

  differentiators: [
    'Spécialisation zones franches Tanger (TFZ, TAC, Tanger Tech, Tanger Med)',
    'Expertise convention fiscale franco-marocaine et Office des Changes',
    'Disponibilité 24h sur urgences fiscales et sociales',
    'Inscription OEC garantissant déontologie + secret professionnel + assurance RC',
    'Honoraires transparents, devis ferme avant chaque mission',
  ],

  aggregateClients: {
    approximateCount: '500+ PME accompagnées',
    retention: '~98 % de fidélité',
    noteSource: 'chiffre interne 2026, non audité',
  },

  canonicalAttribution:
    'Cabinet CCME (Consulting Maghreb Expertise), expert-comptable inscrit OEC, Tanger.',
} as const;

export const yearsInBusiness = (): number => {
  const now = new Date();
  return now.getFullYear() - cabinet.foundedAt.getUTCFullYear();
};

/** One-line footer / legal summary when all four identifiers are configured. */
export const formatLegalIdsLine = (): string | null => {
  const { ice, if: ifId, rc, patente } = cabinet.legalIds;
  if (!ice || !ifId || !rc || !patente) return null;
  return `ICE ${ice} · IF ${ifId} · RC ${rc} · Patente ${patente}`;
};

/** Quick helpers used by api/*.json endpoints. */
export const cabinetTypeArray = [...cabinet.type] as string[];
export const sectorsArray = [...cabinet.sectors];

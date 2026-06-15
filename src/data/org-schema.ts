/**
 * Organization @graph — single source for Schema.org entity markup.
 *
 * `orgCoreGraph` (AccountingService + WebSite) is emitted on EVERY page via
 * Base.astro so deep-linked routes resolve `@id: #accounting` without
 * requiring a prior homepage crawl.
 *
 * `homeWebPageSchema` is homepage-only (WebPage + speakable selectors).
 */

import { cabinet, SITE } from './cabinet';
import { reviews, averageRating, reviewCount } from './reviews';

const ACCOUNTING_ID = `${SITE}/#accounting`;
const WEBSITE_ID = `${SITE}/#website`;
const WEBPAGE_ID = `${SITE}/#webpage`;
const LOGO_ID = `${SITE}/#logo`;

export const accountingId = ACCOUNTING_ID;
export const websiteId = WEBSITE_ID;

const offers = (
  group: string,
  items: Array<{ name: string; slug: string }>,
) => ({
  '@type': 'OfferCatalog' as const,
  name: group,
  itemListElement: items.map((it) => ({
    '@type': 'Offer' as const,
    itemOffered: {
      '@type': 'Service' as const,
      name: it.name,
      url: `${SITE}/services/${it.slug}`,
    },
  })),
});

const accountingNode = {
  '@type': cabinet.type,
  '@id': ACCOUNTING_ID,
  name: cabinet.legalName,
  alternateName: cabinet.alternateNames,
  legalName: cabinet.legalName,
  url: `${SITE}/`,
  logo: {
    '@type': 'ImageObject',
    '@id': LOGO_ID,
    url: `${SITE}/images/cme-logo-512.png`,
    contentUrl: `${SITE}/images/cme-logo-512.png`,
    width: 512,
    height: 512,
    caption: `Logo ${cabinet.legalName}`,
  },
  image: { '@id': LOGO_ID },
  slogan: cabinet.slogan,
  description: cabinet.description,
  foundingDate: cabinet.foundingDate,
  foundingLocation: { '@type': 'Place', name: 'Tanger, Maroc' },
  telephone: cabinet.phone.schema,
  email: cabinet.email,
  priceRange: cabinet.priceRange,
  currenciesAccepted: cabinet.currenciesAccepted,
  paymentAccepted: cabinet.paymentAccepted,
  areaServed: cabinet.areasServed.map((a) => ({
    '@type': a.type,
    name: a.name,
  })),
  address: {
    '@type': 'PostalAddress',
    streetAddress: cabinet.address.streetAddressLong,
    addressLocality: cabinet.address.addressLocality,
    addressRegion: cabinet.address.addressRegion,
    postalCode: cabinet.address.postalCode,
    addressCountry: cabinet.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: cabinet.geo.latitude,
    longitude: cabinet.geo.longitude,
  },
  hasMap: cabinet.googleMapsUrl,
  openingHoursSpecification: cabinet.hours
    .filter((h) => !('closed' in h))
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.day,
      opens: h.open as string,
      closes: h.close as string,
    })),
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: cabinet.phone.schema,
      contactType: 'customer service',
      areaServed: 'MA',
      availableLanguage: [...cabinet.schemaLanguages],
    },
    {
      '@type': 'ContactPoint',
      email: cabinet.email,
      contactType: 'sales',
      areaServed: ['MA', 'FR', 'ES', 'BE'],
      availableLanguage: [...cabinet.schemaLanguages],
    },
  ],
  sameAs: [...cabinet.socials],
  knowsAbout: [...cabinet.knowsAbout],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'professional certification',
    recognizedBy: {
      '@type': 'Organization',
      name: cabinet.oec.authority,
      alternateName: cabinet.oec.authorityShort,
      url: cabinet.oec.authorityUrl,
    },
  },
  memberOf: {
    '@type': 'Organization',
    name: cabinet.oec.authority,
    url: cabinet.oec.authorityUrl,
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Services CCME',
    itemListElement: [
      offers('Comptabilité', [
        { name: 'Tenue de comptabilité', slug: 'tenue-comptabilite' },
        { name: 'Supervision comptable', slug: 'supervision-comptable' },
      ]),
      offers('Fiscalité', [
        { name: 'Conseil fiscal', slug: 'conseil-fiscal' },
        { name: 'Assistance fiscale', slug: 'assistance-fiscale' },
        { name: 'Contrôle & contentieux', slug: 'controle-contentieux' },
      ]),
      offers('Juridique', [
        { name: "Création d'entreprise", slug: 'creation-entreprise' },
        { name: 'Conseil juridique', slug: 'conseil-juridique' },
        { name: 'Travaux juridiques annuels', slug: 'travaux-juridiques' },
        { name: 'Domiciliation', slug: 'domiciliation' },
      ]),
      offers('Paie & social', [
        { name: 'Paie & GRH', slug: 'paie-grh' },
        { name: 'Damancom CNSS', slug: 'damancom-cnss' },
        { name: 'Social & administratif', slug: 'social-administratif' },
      ]),
    ],
  },
} as const;

/**
 * Rating fragment for the #accounting entity. Emitted ONLY on home, /cabinet
 * and /avis-clients (the pages that legitimately represent the reviewed
 * business) — NOT on every service/city page, to comply with Google's policy
 * against self-serving review snippets on a business's own service pages.
 */
export const orgRatingNode = {
  '@type': cabinet.type,
  '@id': ACCOUNTING_ID,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: averageRating,
    reviewCount: String(reviewCount),
    bestRating: '5',
    worstRating: '1',
  },
  review: reviews.slice(0, 3).map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.author },
    datePublished: r.date,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
    reviewBody: r.text,
  })),
} as const;

/** WebSite node — no SearchAction (no on-site search handler exists). */
const websiteNode = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: cabinet.legalName,
  alternateName: 'CCME',
  url: `${SITE}/`,
  inLanguage: 'fr-MA',
  publisher: { '@id': ACCOUNTING_ID },
  copyrightHolder: { '@id': ACCOUNTING_ID },
} as const;

/** Emitted on every page via Base.astro. */
export const orgCoreGraph = {
  '@context': 'https://schema.org',
  '@graph': [accountingNode, websiteNode],
} as const;

/** Homepage-only WebPage node. */
export const homeWebPageSchema = {
  '@type': 'WebPage',
  '@id': WEBPAGE_ID,
  url: `${SITE}/`,
  name: 'Expert-comptable à Tanger | Cabinet CCME',
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': ACCOUNTING_ID },
  primaryImageOfPage: { '@id': LOGO_ID },
  inLanguage: 'fr-MA',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.hero-text h1', '.hero-text .lede', '.hero-points'],
  },
} as const;

/** Full homepage graph (core + homepage WebPage). Kept for tests. */
export const orgGraph = {
  '@context': 'https://schema.org',
  '@graph': [...orgCoreGraph['@graph'], homeWebPageSchema],
} as const;

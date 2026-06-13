import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    category: z.enum(['comptabilite', 'fiscalite', 'juridique', 'paie', 'autre']),
    icon: z.string().optional(),
    keywords: z.array(z.string()).default([]),
    order: z.number().default(99),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    priceFrom: z.string().optional(),
    bullets: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
    /**
     * Optional dates for the Service schema's `datePublished` / `dateModified`.
     * Google reads `dateModified` as a freshness signal — pages with recent
     * updates rank better for query intents that imply currency (e.g. "loi
     * de finances 2026", "TVA 2026"). Leave empty if a service page hasn't
     * been substantively updated; do not fake dates.
     */
    publishedTime: z.string().optional(),
    modifiedTime: z.string().optional(),
  }),
});

const secteurs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/secteurs' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    keywords: z.array(z.string()).default([]),
    icon: z.string().optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    bullets: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

const zones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/zones' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    keywords: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    bullets: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    publishedTime: z.string(),
    modifiedTime: z.string().optional(),
    author: z.string().default('Équipe CCME'),
    keywords: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    related: z.array(z.string()).default([]),
    /**
     * Canonical entities discussed in the post — used to populate the
     * BlogPosting `about` schema property. Accepts:
     *   - "/services/conseil-fiscal"  (internal page URL)
     *   - "#is-impot-sur-les-societes" (DefinedTerm anchor on /glossaire)
     *   - "https://..."  (external entity URL)
     *   - "Plain entity name"  (free-form)
     * Helps Gemini / AI Mode resolve which topics the article authoritatively
     * covers during query fan-out.
     */
    about: z.array(z.string()).default([]),
  }),
});

const quartiers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quartiers' }),
  schema: z.object({
    title: z.string(),
    h1: z.string(),
    description: z.string(),
    eyebrow: z.string(),
    keywords: z.array(z.string()).default([]),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    landmarks: z.array(z.string()).default([]),
    bullets: z.array(z.string()).default([]),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  }),
});

export const collections = { services, secteurs, zones, blog, quartiers };

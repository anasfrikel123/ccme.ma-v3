# CCME — Site Astro

Cabinet d'expertise comptable Tanger. Site reconstruit en Astro 5 (statique, SEO-first).

## Démarrer

```bash
cd astro-site
npm install
npm run dev
```

Build production :

```bash
npm run build
```

Sortie dans `dist/` — déployable sur Vercel, Netlify, GitHub Pages, ou hébergement statique classique.

## Architecture

```
astro-site/
├── astro.config.mjs        # Config Astro + sitemap intégration
├── src/
│   ├── content.config.ts   # Schémas content collections (Zod)
│   ├── content/
│   │   ├── services/       # 11 services (.md)
│   │   ├── secteurs/       # 6 secteurs spécialisés
│   │   ├── zones/          # 5 zones de Tanger
│   │   └── blog/           # 10 articles
│   ├── layouts/
│   │   ├── Base.astro      # HTML shell + SEO
│   │   ├── Page.astro      # Hero + breadcrumb + CTA
│   │   └── Article.astro   # Article BlogPosting + schema
│   ├── components/         # Header, Footer, SEO, FAQ, Stats, Reveal, etc.
│   ├── pages/
│   │   ├── index.astro     # Home
│   │   ├── services/       # Hub + dynamic [...slug]
│   │   ├── secteurs/
│   │   ├── zones/
│   │   ├── blog/
│   │   ├── cabinet.astro
│   │   ├── contact.astro
│   │   ├── tarifs.astro
│   │   ├── expat.astro
│   │   ├── 404.astro
│   │   ├── mentions-legales.astro
│   │   └── confidentialite.astro
│   └── styles/
│       ├── global.css
│       └── animations.css
└── public/
    ├── robots.txt
    ├── llms.txt            # AI crawler manifest
    └── images/             # placeholders à remplir
```

## Total pages générées

- 11 statiques (home, hubs, légal, etc.)
- 11 services
- 6 secteurs
- 5 zones
- 10 articles blog
- **= 43 pages**

Toutes indexées dans le sitemap auto-généré.

## SEO

- Meta dynamiques par page (SEO.astro)
- Schema.org JSON-LD : AccountingService, LocalBusiness, BreadcrumbList, BlogPosting, FAQPage, Service
- Open Graph + Twitter Cards
- Canonical + hreflang fr/en/ar/x-default
- Geo meta (region, position, ICBM) sur toutes les pages
- Sitemap auto via `@astrojs/sitemap`
- llms.txt pour AI crawlers (Google AI Overviews, ChatGPT, Perplexity)

## Animations

- Reveal-on-scroll (IntersectionObserver)
- Counter animations (stats)
- Hero gradient sweep
- Hover lift sur cards
- Page transition subtile
- Marquee partners (CSS)
- Float decoratif
- Respect `prefers-reduced-motion`

## Accessibilité

- Skip link "Aller au contenu principal"
- Focus visible sur tous les contrôles
- ARIA labels
- Hiérarchie h1-h4 stricte
- Contraste AA min
- Navigation clavier complète

## Déploiement Vercel

```bash
npm install -g vercel
vercel
```

`astro.config.mjs` est déjà configuré avec `site: 'https://www.ccme.ma'`.

## Mise à jour du contenu

**Ajouter un service** : créer `src/content/services/<slug>.md` avec frontmatter respectant le schéma. Apparaît automatiquement dans `/services` et accessible via `/services/<slug>`.

**Ajouter un article** : `src/content/blog/<slug>.md`. Pareil.

**Ajouter une zone ou un secteur** : pareil.

Pas de re-déploiement à coder, juste push.

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

Sortie dans `dist/` — déployé sur **Cloudflare Pages** (`public/_headers`, `public/_redirects`, `functions/_middleware.ts`).

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

## Déploiement Cloudflare Pages

Repo : [github.com/anasfrikel123/ccme.ma-v3](https://github.com/anasfrikel123/ccme.ma-v3)

| Paramètre | Valeur |
|-----------|--------|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Node.js | 22 |

**Workers Builds** uses `wrangler.jsonc` (Worker + static assets). Manual Pages deploy: `npm run deploy:pages` (uses `wrangler.pages.jsonc`).

Wrangler cannot mix `pages_build_output_dir` with `main`/`assets` — CI uses Worker deploy; Pages CLI uses the separate config file.

Variables d'environnement (Dashboard → Settings → Environment variables) :

- `PUBLIC_WEB3FORMS_KEY` — clé Web3Forms pour `/contact` (obligatoire en prod)
- `PUBLIC_GSC_TOKEN` — optionnel, Search Console

Le build exécute tests, génération OG/llms, Astro static, puis vérifie les liens internes. Les en-têtes CSP et les redirects legacy sont dans `public/_headers` et `public/_redirects`. La négociation `Accept: text/markdown` pour le blog : `worker/index.ts` (CI `wrangler deploy`) ou `functions/_middleware.ts` (Pages CLI).

`astro.config.mjs` est configuré avec `site: 'https://www.ccme.ma'`.

### Déploiement manuel (Wrangler CLI)

Une fois connecté (`npx wrangler login`) :

```powershell
cd astro-site
npm install
npm run deploy          # prod — branche main
npm run deploy:preview  # preview — branche courante
```

Équivalent direct :

```powershell
npm run build
npx wrangler pages deploy dist --project-name=ccme-ma-v3
```

`functions/_middleware.ts` est pris en charge automatiquement (dossier `functions/` à la racine du repo).

### Déploiement auto (recommandé)

Connecte le repo **ccme.ma-v3** dans Cloudflare Dashboard → Workers & Pages → ton projet → **Settings** → **Build** :

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Builds for non-production branches:** checked (preview URLs)

Pas de champ « output directory » — `dist` est dans `wrangler.jsonc` → `assets.directory`.

Chaque `git push` sur `main` déploie en prod. Pas besoin de `npm run deploy` en local si Git CI est actif.

## Mise à jour du contenu

**Ajouter un service** : créer `src/content/services/<slug>.md` avec frontmatter respectant le schéma. Apparaît automatiquement dans `/services` et accessible via `/services/<slug>`.

**Ajouter un article** : `src/content/blog/<slug>.md`. Pareil.

**Ajouter une zone ou un secteur** : pareil.

Pas de re-déploiement à coder, juste push.

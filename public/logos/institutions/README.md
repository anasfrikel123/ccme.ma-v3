# Institution logos — drop-in slots

The compliance marquee on the homepage (`src/components/Compliance.astro`)
loads **one SVG per institution** from this folder. The filenames below are
expected exactly — to replace a logo, **overwrite the file with the same
name**. No code change needed; the marquee picks it up on the next build.

## Active slots

| File                          | Institution                                                         | Used on the cabinet for…                          |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `oec.svg`                     | Ordre des Experts-Comptables du Maroc                               | Inscription du cabinet, déontologie               |
| `ministere-economie.svg`      | Ministère de l’Économie et des Finances                             | Tutelle DGI / Office des Changes / TGR            |
| `dgi.svg`                     | Direction Générale des Impôts                                       | IS, TVA, IR, liasse fiscale                       |
| `cnss.svg`                    | Caisse Nationale de Sécurité Sociale                                | Affiliations, AMO, cotisations                    |
| `ompic.svg`                   | Office Marocain de la Propriété Industrielle et Commerciale         | Certificat négatif, registre du commerce          |
| `office-des-changes.svg`      | Office des Changes                                                  | Transferts internationaux, rapatriement bénéfices |
| `tanger-med.svg`              | Tanger Med (TMSA — autorité portuaire & zones logistiques)          | Clients import-export, transitaires, zones        |

## Adding a new institution

1. Drop the new logo as `<slug>.svg` in this folder. Use lowercase, hyphens.
2. Open `src/components/Compliance.astro` and add an entry to the `items`
   array with the matching `slug`, the full `name`, and an `href` to the
   relevant internal page.
3. That's it — no other wiring required.

## Removing an institution

1. Remove its entry from the `items` array in
   `src/components/Compliance.astro`.
2. Delete the `<slug>.svg` file from this folder.

## File requirements

- **`.svg` only** — no `.png`, `.jpg`, `.eps`, `.ai`. The marquee renders
  them via `<img src>` with `object-fit: contain` so any aspect ratio works,
  but landscape (~160×64) reads best at marquee speed.
- **No external font references** — embed text as paths/outlines
  (`Type → Create Outlines` in Illustrator; `Outline stroke` / `Flatten` in
  Figma) so the logo doesn't fall back to system fonts in Safari / Firefox.
- **Trim transparent padding** around the artwork so each logo sits at a
  consistent visual size in the row.
- **Embed colors directly** in the SVG (no CSS variables / `currentColor`).
  Full-color logos are fine — the marquee desaturates them slightly at rest
  (15 %) and pops to full color on hover.
- **Keep file size sensible**. Anything > 50 KB is probably a traced raster
  with too many path nodes; run it through https://jakearchibald.github.io/svgomg/
  (preserve viewBox, remove metadata, lossless) to halve the size with no
  visible difference.

## Render behavior

Slot is a 64 px tall flex item; the SVG is constrained to **height 56 px,
max-width 200 px** at desktop, **height 44 px, max-width 160 px** on mobile,
with `object-fit: contain` to preserve aspect ratio. Default state is at
85 % opacity + 15 % greyscale; full opacity + full color on hover/focus.
Animation pauses on hover/focus and is fully disabled when the user has
`prefers-reduced-motion: reduce` set.

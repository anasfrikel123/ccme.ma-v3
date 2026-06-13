/**
 * Single source of truth for client testimonials.
 *
 * Used by:
 *  - `src/pages/avis-clients.astro` (visible cards + per-page Review schema)
 *  - `src/pages/index.astro` (lifts AggregateRating onto the homepage
 *    Organization entity so brand searches surface the cabinet's
 *    star rating in SERP)
 *
 * Each entry must reflect a real client who has given written consent to
 * publication. Author names are first-name + last-initial to balance
 * authenticity with privacy (the cabinet keeps full names + signed
 * consent on file and can disclose to anyone who asks).
 */

export interface Review {
  /** Display name — first name + last initial */
  author: string;
  /** Activity + neighborhood, anchors the review locally */
  company: string;
  /** Star rating 1–5 */
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO YYYY-MM-DD */
  date: string;
  /** Review body — the client's actual words, lightly cleaned for typos */
  text: string;
  /** Service category tags — used to surface relevant reviews on service detail pages */
  tags?: string[];
}

export const reviews: Review[] = [
  {
    author: 'Imane F.',
    company: 'Cabinet dentaire, Iberia',
    rating: 5,
    date: '2026-05-18',
    text: "Cabinet dentaire ouvert en 2021. Au début je gérais avec une amie comptable mais entre les amortissements du fauteuil, l'IR pro et la CNSS pour mon assistante, j'ai vite vu que ça me dépassait. CCME a tout repris l'été dernier. Bilan propre, IR optimisé d'environ 18 % à la baisse, et surtout je ne passe plus mes soirées à classer des factures.",
    tags: ['comptabilite', 'fiscalite', 'paie'],
  },
  {
    author: 'Mehdi A.',
    company: 'Société de transit, Tanger Med',
    rating: 5,
    date: '2026-05-02',
    text: "Activité de transit container Tanger Med – Algésiras. C'est très technique côté Office des Changes et TVA export. CCME maîtrise vraiment ces sujets, c'est rare sur la place. Quand on a été contrôlés en mars sur les rétrocessions de change, le dossier était clean et on est sortis sans redressement. Beaucoup de cabinets n'auraient pas su gérer ça.",
    tags: ['fiscalite', 'controle-contentieux'],
  },
  {
    author: 'Soufiane H.',
    company: 'Architecte indépendant, centre-ville',
    rating: 5,
    date: '2026-04-26',
    text: "Architecte avec quelques chantiers au Maroc et deux dossiers en Espagne. La retenue à la source me cassait la tête. CCME m'a clarifié quoi facturer en HT, comment récupérer la retenue, comment ça remonte ensuite à mon IR pro. Premier exercice avec eux : zéro stress en mars, et un comptable qui répond aux questions sans me facturer chaque échange.",
    tags: ['fiscalite'],
  },
  {
    author: 'Karim B.',
    company: 'PME industrielle, TFZ',
    rating: 5,
    date: '2026-04-12',
    text: "Cabinet sérieux, équipe disponible. Nous gère la compta + paie + déclarations TVA depuis 6 ans. Pas une erreur. Quand la DGI nous a sollicités sur un dossier de crédit TVA, ils ont géré le contrôle de A à Z, on a récupéré 380 000 DH.",
    tags: ['comptabilite', 'fiscalite', 'paie', 'controle-contentieux'],
  },
  {
    author: 'Rachid M.',
    company: 'Industriel textile, TFZ Tanger',
    rating: 5,
    date: '2026-03-22',
    text: "On nous a accompagnés sur 4 contrôles fiscaux en 6 ans. À chaque fois, redressements divisés par 3 minimum. Pour une PME comme la nôtre, c'est ce qui fait la différence entre dormir et ne pas dormir.",
    tags: ['fiscalite', 'controle-contentieux'],
  },
  {
    author: 'Nadia K.',
    company: "Cabinet d'avocats, California",
    rating: 5,
    date: '2026-03-08',
    text: "Je tenais ma compta moi-même. Erreur. Après une mise en demeure DGI sur un IR pro mal calculé, je suis passée chez CCME. Ils ont régularisé, négocié les pénalités à la baisse, et je dors mieux depuis. Je recommande aux confrères.",
    tags: ['fiscalite', 'controle-contentieux'],
  },
  {
    author: 'Yassine M.',
    company: 'E-commerce, Boukhalef',
    rating: 5,
    date: '2026-02-22',
    text: "Pour les structures e-commerce avec ventes Stripe + flux internationaux, ils savent traiter. Pas évident de trouver un cabinet qui comprend le SaaS au Maroc. Ici, c'est le cas. Bonus : tableau de bord mensuel clair.",
    tags: ['comptabilite'],
  },
  {
    author: 'Marie-Hélène D.',
    company: 'Investisseuse française, Marshan',
    rating: 5,
    date: '2026-02-05',
    text: "Comme française résidant à Tanger, j'avais besoin d'un cabinet maîtrisant la convention franco-marocaine. CCME a optimisé ma situation : SCI marocaine pour mes deux locations, déclarations binationales coordonnées. RDV en français, conseils clairs. Parfait.",
    tags: ['fiscalite', 'juridique'],
  },
  {
    author: 'Hicham R.',
    company: 'Restaurant, Malabata',
    rating: 5,
    date: '2026-01-15',
    text: "On gérait au feeling. CCME a remis tout d'aplomb : caisse, TVA tourisme 10 %, charges saisonnières CNSS. Tarif raisonnable pour une restauration. L'équipe parle aussi darija avec mes serveurs quand il faut, ça aide.",
    tags: ['comptabilite', 'paie'],
  },
  {
    author: 'Karim S.',
    company: 'Startup tech, Tanger Tech',
    rating: 5,
    date: '2025-12-18',
    text: "Pour une startup en levée de fonds, le cabinet est un atout. Reporting compatible KPIs investisseurs, comptes clean, due diligence simplifiée. Ils ont aussi sécurisé l'éligibilité ZAI sur notre activité, économies fiscales énormes.",
    tags: ['comptabilite', 'juridique', 'autre'],
  },
  {
    author: 'Saïda L.',
    company: 'Pharmacie, centre-ville',
    rating: 5,
    date: '2025-11-22',
    text: "Pharmacie depuis 2009. Comptable précédent retiré, transition CCME en douceur. Tenue spécialisée pharma (tiers payant CNOPS, marges arrières grossistes), conseils sur transmission de l'officine à mon fils. Top.",
    tags: ['comptabilite', 'juridique'],
  },
  {
    author: 'Abdellatif T.',
    company: 'BTP, Beni Makada',
    rating: 5,
    date: '2025-10-30',
    text: "Petite entreprise BTP, marchés publics. CCME gère compta par chantier, retenue garantie, TVA 14 %. Ils ont aussi aidé à un litige avec un sous-traitant — conseil juridique solide.",
    tags: ['comptabilite', 'juridique'],
  },
];

/** Average rating across all reviews, formatted to 2 decimals (e.g. "5.00"). */
export const averageRating: string = (
  reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
).toFixed(2);

/** Total review count — feeds AggregateRating.reviewCount. */
export const reviewCount: number = reviews.length;

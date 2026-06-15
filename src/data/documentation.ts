export interface DocGuideSection {
  h: string;
  p: string;
}

export interface DocGuideRef {
  label: string;
  href: string;
  external?: boolean;
}

export interface DocGuide {
  id: string;
  tag: string;
  title: string;
  summary: string;
  sections: DocGuideSection[];
  refs: DocGuideRef[];
}

export interface DocFile {
  name: string;
  format: string;
  href: string;
}

export interface DocGroup {
  title: string;
  items: DocFile[];
}

export interface OfficialLink {
  name: string;
  url: string;
}

/** In-page guides (synthèses) — mirrors main site DocumentationPage. */
export const DOC_GUIDES: DocGuide[] = [
  {
    id: 'entrepreneurs',
    tag: 'Guide pratique',
    title: 'Guide du nouvel entrepreneur',
    summary:
      "Les étapes essentielles pour lancer une activité au Maroc en 2026 : statut juridique, immatriculation, fiscalité de démarrage et obligations sociales — avec les points de vigilance que nous traitons au quotidien avec nos clients.",
    sections: [
      {
        h: '1. Choisir le statut adapté',
        p: "SARL, SARL AU, SA ou auto-entrepreneur (APP) : le choix dépend du capital, du nombre d'associés, du secteur et de l'ambition de croissance. L'APP convient aux petites activités encadrées ; la SARL reste le format le plus courant pour une PME structurée.",
      },
      {
        h: '2. Immatriculation & identifiants',
        p: "Après rédaction des statuts : inscription au registre de commerce (OMPIC), obtention de l'identifiant fiscal (IF), affiliation CNSS et ouverture des comptes bancaires professionnels. Prévoir 2 à 4 semaines selon le dossier.",
      },
      {
        h: '3. Premières obligations fiscales & sociales',
        p: "Déclaration d'existence fiscale, choix du régime d'imposition (IR/IS, TVA), télédéclarations via Simpl Impôts et premières déclarations sociales. Un calendrier clair dès le premier mois évite pénalités et rappels.",
      },
    ],
    refs: [
      { label: "Création d'entreprise — CCME", href: '/services/creation-entreprise' },
      { label: 'Circulaire APP0001 (PDF)', href: 'https://ccme.ma/files/Circulaire+APP0001.pdf', external: true },
      { label: 'FAQ APP (PDF)', href: 'https://ccme.ma/files/FAQ+APP.pdf', external: true },
    ],
  },
  {
    id: 'finance-2026',
    tag: 'Synthèse fiscale',
    title: 'Loi de Finances marocaine 2026 — synthèse',
    summary:
      "Panorama des mesures de la Loi de Finances n° 50-25 pour l'année budgétaire 2026 : impôts directs, TVA, taxes locales, dispositifs sectoriels et échéances déclaratives à retenir pour les entreprises marocaines.",
    sections: [
      {
        h: 'Impôts directs & retenues',
        p: "La note circulaire n° 734 précise l'application des dispositions de la loi n° 69-21 : barèmes IR, taux IS, retenues à la source et règles de déductibilité. Vérifiez vos prévisionnels et acomptes dès janvier 2026.",
      },
      {
        h: 'TVA, TP, TSC & taxes locales',
        p: "Les communiqués 2026 sur la taxe professionnelle (TP), la taxe sur les services communaux (TSC) et la taxe d'habitation (TH) fixent les déclarations chômage, vacance et éléments imposables. Le CGI 2026 (AR/FR) reste la référence pour les taux et exonérations.",
      },
      {
        h: 'Charte du contribuable & conformité',
        p: "La Charte du Contribuable 2026 rappelle droits et devoirs face à l'administration. Couplée à Simpl Impôts et aux délais DGI, elle guide la relation de confiance — document téléchargeable ci-dessous.",
      },
    ],
    refs: [
      {
        label: 'Note synthétique LF 2026 (PDF)',
        href: 'https://ccme.ma/files/NOTE+SYNTHETIQUE+DES+MESURES+FISCALES+DE+LA+LOI+DE+FINANCES+N%C2%B0+50-25+POUR+L%E2%80%99ANNEE+BUDGETAIRE+2026.VF.pdf',
        external: true,
      },
      {
        label: 'Note Circulaire 734 (PDF)',
        href: 'https://ccme.ma/files/NOTE+CIRCULAIRE+N%C2%B0+734+RELATIVE+AUX+DISPOSITIONS+DE+LA+LOI+N%C2%B0+69.21.PDF',
        external: true,
      },
      { label: 'CGI 2026 (Français)', href: 'https://ccme.ma/files/CGI+2026+FR.pdf', external: true },
      { label: 'Conseil fiscal — CCME', href: '/services/conseil-fiscal' },
    ],
  },
];

/**
 * PDF downloads — hosted on the legacy ccme.ma site (cross-domain). They are
 * large (6–12 MB each, ~70 MB total) and would bloat a Cloudflare Pages
 * deploy, so we link to the existing copies on ccme.ma. They render as
 * external links in the UI.
 */
const LEGACY_FILES = 'https://ccme.ma/files';

export const DOC_GROUPS: DocGroup[] = [
  {
    title: 'Code Général des Impôts & charte',
    items: [
      { name: 'CGI 2026 (Arabe)', format: 'PDF', href: `${LEGACY_FILES}/CGI+2026+AR.pdf` },
      { name: 'CGI 2026 (Français)', format: 'PDF', href: `${LEGACY_FILES}/CGI+2026+FR.pdf` },
      { name: 'Charte du Contribuable 2026 (FR)', format: 'PDF', href: `${LEGACY_FILES}/Charte+2026+Fr.pdf` },
    ],
  },
  {
    title: 'Loi de Finances 2026',
    items: [
      {
        name: 'Note Circulaire N° 734 (Loi 69.21)',
        format: 'PDF',
        href: `${LEGACY_FILES}/NOTE+CIRCULAIRE+N%C2%B0+734+RELATIVE+AUX+DISPOSITIONS+DE+LA+LOI+N%C2%B0+69.21.PDF`,
      },
      {
        name: 'Note synthétique – Loi de Finances 2026',
        format: 'PDF',
        href: `${LEGACY_FILES}/NOTE+SYNTHETIQUE+DES+MESURES+FISCALES+DE+LA+LOI+DE+FINANCES+N%C2%B0+50-25+POUR+L%E2%80%99ANNEE+BUDGETAIRE+2026.VF.pdf`,
      },
    ],
  },
  {
    title: 'Bulletin Officiel',
    items: [{ name: 'Bulletin Officiel 7412 (AR)', format: 'PDF', href: `${LEGACY_FILES}/B.O_7412_Ar.pdf` }],
  },
  {
    title: 'TP, TSC & TH – déclarations 2026',
    items: [
      {
        name: 'TP & TSC – Déclaration Chômage 2026 (FR)',
        format: 'PDF',
        href: `${LEGACY_FILES}/Communiqu%C3%A9_+TP+et+TSC__D%C3%A9claration+Ch%C3%B4mage_2026_FR_VF.pdf`,
      },
      {
        name: 'TP & TSC – Déclaration Vacance 2026 (FR)',
        format: 'PDF',
        href: `${LEGACY_FILES}/Communiqu%C3%A9_+TP+et+TSC__D%C3%A9claration+vacance_2026_FR_VF.pdf`,
      },
      {
        name: 'TP & TSC – Éléments imposables (Janv. 2026)',
        format: 'PDF',
        href: `${LEGACY_FILES}/Communiqu%C3%A9_+TP+et+TSC_D%C3%A9claration+El%C3%A9ments+imposables_Janv+2026_FR_VF.pdf`,
      },
      {
        name: 'TH & TSC – Achèvement 2026 (FR)',
        format: 'PDF',
        href: `${LEGACY_FILES}/communiqu%C3%A9+-TH+et+TSC+_ach%C3%A9vement_+2026-+FR+(2).pdf`,
      },
      { name: 'Communiqué TSAV 2026 (FR)', format: 'PDF', href: `${LEGACY_FILES}/communiqu%C3%A9_+TSAV+_FR_2026.pdf` },
      { name: 'Communiqué TSAV 2026 (AR)', format: 'PDF', href: `${LEGACY_FILES}/Communiqu%C3%A9+_TSAV+_AR+2026.pdf` },
    ],
  },
  {
    title: 'Auto-entrepreneur (APP)',
    items: [
      { name: 'Circulaire APP0001', format: 'PDF', href: `${LEGACY_FILES}/Circulaire+APP0001.pdf` },
      { name: 'FAQ APP', format: 'PDF', href: `${LEGACY_FILES}/FAQ+APP.pdf` },
      {
        name: 'Processus de traitement des demandes APP',
        format: 'PDF',
        href: `${LEGACY_FILES}/processus+de+traitement+des+demandes+des+APP.pdf`,
      },
    ],
  },
  {
    title: 'Secteurs & jurisprudence',
    items: [
      {
        name: 'Secteur Touristique 2025 (FR)',
        format: 'PDF',
        href: `${LEGACY_FILES}/SECTEUR+TOURISTIQUE_FR_2025_VF.pdf`,
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 6 (2025)',
        format: 'PDF',
        href: `${LEGACY_FILES}/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+6-2025.pdf`,
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 7 (2025)',
        format: 'PDF',
        href: `${LEGACY_FILES}/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+7-2025.pdf`,
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 8 (2025)',
        format: 'PDF',
        href: `${LEGACY_FILES}/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+8-2025.pdf`,
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 9 (2025)',
        format: 'PDF',
        href: `${LEGACY_FILES}/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+9-2025.pdf`,
      },
    ],
  },
  {
    title: 'Normes comptables & analyse financière',
    items: [
      { name: 'Code Général de Normalisation Comptable (CGNC)', format: 'PDF', href: `${LEGACY_FILES}/cgnc.pdf` },
      { name: 'Analyse du bilan & ratios financiers', format: 'PDF', href: `${LEGACY_FILES}/Analyse_du_bilan_et_ratio_1735848957.pdf` },
    ],
  },
  {
    title: 'Textes juridiques',
    items: [
      { name: 'Code de commerce (actualisé, 2023)', format: 'PDF', href: `${LEGACY_FILES}/Code%20de%20commerce%20actualis%C3%A9%20-%2015%20juin%202023.pdf` },
      { name: 'Droit des contrats et des obligations', format: 'PDF', href: `${LEGACY_FILES}/Droit%20des%20contrats%20.pdf` },
    ],
  },
  {
    title: 'Contrôle fiscal, change & circulaires',
    items: [
      { name: 'Base des anomalies fiscales (DGI)', format: 'PDF', href: `${LEGACY_FILES}/Base_de_donn_es_des_anomalies_fiscales__1731355200.pdf` },
      { name: 'Circulaire DGI (réf. 95253)', format: 'PDF', href: `${LEGACY_FILES}/circulaire_95253_241226_223116.pdf` },
      { name: 'Taux de change moyens 2025 (Office des Changes)', format: 'PDF', href: `${LEGACY_FILES}/%D8%B3%D8%B9%D8%B1+%D8%A7%D9%84%D8%B5%D8%B1%D9%81+%D8%A7%D9%84%D9%85%D8%B9%D8%AA%D9%85%D8%AF+%D9%84%D8%AA%D8%AD%D9%88%D9%8A%D9%84+%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84+%D8%A7%D9%84%D9%85%D8%AD%D8%B5%D9%84+%D8%B9%D9%84%D9%8A%D9%87%D8%A7+%D8%A8%D8%A7%D9%84%D8%B9%D9%85%D9%84%D8%A7%D8%AA+%D8%A7%D9%84%D8%A3%D8%AC%D9%86%D8%A8%D9%8A%D8%A9+%D8%AE%D9%84%D8%A7%D9%84+%D8%B3%D9%86%D8%A9+2025.PDF` },
    ],
  },
  {
    title: 'Agenda & fiscalité sectorielle',
    items: [
      { name: 'Agenda fiscal', format: 'PDF', href: `${LEGACY_FILES}/Agenda%20fiscal.pdf` },
      { name: 'Fiscalité agricole', format: 'PDF', href: `${LEGACY_FILES}/fiscalit%C3%A9%20agricole.pdf` },
    ],
  },
];

export const OFFICIAL_LINKS: OfficialLink[] = [
  { name: 'DGI — Impôts', url: 'https://www.tax.gov.ma' },
  { name: 'CNSS', url: 'https://www.cnss.ma' },
  { name: 'SGG', url: 'https://www.sgg.gov.ma' },
  { name: 'Ministère des Finances', url: 'https://www.finances.gov.ma' },
  { name: 'Office des Changes', url: 'https://www.oc.gov.ma' },
  { name: 'Douanes (ADII)', url: 'https://www.douane.gov.ma' },
  { name: 'Bank Al-Maghrib', url: 'https://www.bkam.ma' },
  { name: 'ANCFCC', url: 'https://www.ancfcc.gov.ma' },
];

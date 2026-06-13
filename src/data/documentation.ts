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
      { label: 'Circulaire APP0001 (PDF)', href: '/files/Circulaire+APP0001.pdf', external: true },
      { label: 'FAQ APP (PDF)', href: '/files/FAQ+APP.pdf', external: true },
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
        href: '/files/NOTE+SYNTHETIQUE+DES+MESURES+FISCALES+DE+LA+LOI+DE+FINANCES+N%C2%B0+50-25+POUR+L%E2%80%99ANNEE+BUDGETAIRE+2026.VF.pdf',
        external: true,
      },
      {
        label: 'Note Circulaire 734 (PDF)',
        href: '/files/NOTE+CIRCULAIRE+N%C2%B0+734+RELATIVE+AUX+DISPOSITIONS+DE+LA+LOI+N%C2%B0+69.21.PDF',
        external: true,
      },
      { label: 'CGI 2026 (Français)', href: '/files/CGI+2026+FR.pdf', external: true },
      { label: 'Conseil fiscal — CCME', href: '/services/conseil-fiscal' },
    ],
  },
];

/** PDF downloads — paths match main site `/files/` directory. */
export const DOC_GROUPS: DocGroup[] = [
  {
    title: 'Code Général des Impôts & charte',
    items: [
      { name: 'CGI 2026 (Arabe)', format: 'PDF', href: '/files/CGI+2026+AR.pdf' },
      { name: 'CGI 2026 (Français)', format: 'PDF', href: '/files/CGI+2026+FR.pdf' },
      { name: 'Charte du Contribuable 2026 (FR)', format: 'PDF', href: '/files/Charte+2026+Fr.pdf' },
    ],
  },
  {
    title: 'Loi de Finances 2026',
    items: [
      {
        name: 'Note Circulaire N° 734 (Loi 69.21)',
        format: 'PDF',
        href: '/files/NOTE+CIRCULAIRE+N%C2%B0+734+RELATIVE+AUX+DISPOSITIONS+DE+LA+LOI+N%C2%B0+69.21.PDF',
      },
      {
        name: 'Note synthétique – Loi de Finances 2026',
        format: 'PDF',
        href: '/files/NOTE+SYNTHETIQUE+DES+MESURES+FISCALES+DE+LA+LOI+DE+FINANCES+N%C2%B0+50-25+POUR+L%E2%80%99ANNEE+BUDGETAIRE+2026.VF.pdf',
      },
    ],
  },
  {
    title: 'Bulletin Officiel',
    items: [{ name: 'Bulletin Officiel 7412 (AR)', format: 'PDF', href: '/files/B.O_7412_Ar.pdf' }],
  },
  {
    title: 'TP, TSC & TH – déclarations 2026',
    items: [
      {
        name: 'TP & TSC – Déclaration Chômage 2026 (FR)',
        format: 'PDF',
        href: '/files/Communiqu%C3%A9_+TP+et+TSC__D%C3%A9claration+Ch%C3%B4mage_2026_FR_VF.pdf',
      },
      {
        name: 'TP & TSC – Déclaration Vacance 2026 (FR)',
        format: 'PDF',
        href: '/files/Communiqu%C3%A9_+TP+et+TSC__D%C3%A9claration+vacance_2026_FR_VF.pdf',
      },
      {
        name: 'TP & TSC – Éléments imposables (Janv. 2026)',
        format: 'PDF',
        href: '/files/Communiqu%C3%A9_+TP+et+TSC_D%C3%A9claration+El%C3%A9ments+imposables_Janv+2026_FR_VF.pdf',
      },
      {
        name: 'TH & TSC – Achèvement 2026 (FR)',
        format: 'PDF',
        href: '/files/communiqu%C3%A9+-TH+et+TSC+_ach%C3%A9vement_+2026-+FR+(2).pdf',
      },
      { name: 'Communiqué TSAV 2026 (FR)', format: 'PDF', href: '/files/communiqu%C3%A9_+TSAV+_FR_2026.pdf' },
      { name: 'Communiqué TSAV 2026 (AR)', format: 'PDF', href: '/files/Communiqu%C3%A9+_TSAV+_AR_2026.pdf' },
    ],
  },
  {
    title: 'Auto-entrepreneur (APP)',
    items: [
      { name: 'Circulaire APP0001', format: 'PDF', href: '/files/Circulaire+APP0001.pdf' },
      { name: 'FAQ APP', format: 'PDF', href: '/files/FAQ+APP.pdf' },
      {
        name: 'Processus de traitement des demandes APP',
        format: 'PDF',
        href: '/files/processus+de+traitement+des+demandes+des+APP.pdf',
      },
    ],
  },
  {
    title: 'Secteurs & jurisprudence',
    items: [
      {
        name: 'Secteur Touristique 2025 (FR)',
        format: 'PDF',
        href: '/files/SECTEUR+TOURISTIQUE_FR_2025_VF.pdf',
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 6 (2025)',
        format: 'PDF',
        href: '/files/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+6-2025.pdf',
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 7 (2025)',
        format: 'PDF',
        href: '/files/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+7-2025.pdf',
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 8 (2025)',
        format: 'PDF',
        href: '/files/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+8-2025.pdf',
      },
      {
        name: 'نشرة الاجتهاد القضائي – عدد 9 (2025)',
        format: 'PDF',
        href: '/files/%D9%86%D8%B4%D8%B1%D8%A9+%D8%A7%D9%84%D8%A7%D8%AC%D8%AA%D9%87%D8%A7%D8%AF+%D8%A7%D9%84%D9%82%D8%B6%D8%A7%D8%A6%D9%8A+%D8%B9%D8%AF%D8%AF+9-2025.pdf',
      },
    ],
  },
];

export const OFFICIAL_LINKS: OfficialLink[] = [
  { name: 'DGI — Impôts', url: 'https://www.tax.gov.ma' },
  { name: 'CNSS', url: 'https://www.cnss.ma' },
  { name: 'SGG', url: 'http://www.sgg.gov.ma' },
  { name: 'Ministère des Finances', url: 'https://www.finances.gov.ma' },
  { name: 'Office des Changes', url: 'https://www.oc.gov.ma' },
  { name: 'Douanes (ADII)', url: 'https://www.douane.gov.ma' },
  { name: 'Bank Al-Maghrib', url: 'https://www.bkam.ma' },
  { name: 'ANCFCC', url: 'https://www.ancfcc.gov.ma' },
];

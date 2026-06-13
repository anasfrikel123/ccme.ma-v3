export interface ServiceFamily {
  num: string;
  label: string;
  description: string;
  /** Content collection categories grouped under this family. */
  categories: Array<'comptabilite' | 'fiscalite' | 'juridique' | 'paie' | 'autre'>;
}

/** Editorial service families — mirrors main site ServicesPage layout. */
export const SERVICE_FAMILIES: ServiceFamily[] = [
  {
    num: '01',
    label: 'Comptabilité',
    description: 'Tenue, supervision et états financiers — tenus à jour et transmis en ligne.',
    categories: ['comptabilite'],
  },
  {
    num: '02',
    label: 'Fiscalité',
    description: 'Conseil, optimisation et défense face aux contrôles de la DGI.',
    categories: ['fiscalite'],
  },
  {
    num: '03',
    label: 'Juridique',
    description: 'De la création de société au secrétariat juridique courant.',
    categories: ['juridique'],
  },
  {
    num: '04',
    label: 'Services spécialisés',
    description: 'Paie, social et outils pour piloter votre activité au quotidien.',
    categories: ['paie', 'autre'],
  },
];

export const SERVICE_PROOF = [
  { value: '15', suffix: '+', label: "ans d'expertise" },
  { value: '500', suffix: '+', label: 'clients accompagnés' },
  { value: '24', suffix: 'h', label: 'délai de réponse' },
  { value: '100', suffix: '%', label: 'conformité DGI & CNSS' },
] as const;

export const CABINET_VALUES = [
  {
    num: '01',
    title: 'Rigueur & conformité',
    text: 'Chaque dépôt DGI, CNSS et social est préparé et vérifié avec méthode, dans les délais.',
  },
  {
    num: '02',
    title: 'Proximité & écoute',
    text: 'Un interlocuteur unique qui connaît votre dossier et répond vite, sans jargon.',
  },
  {
    num: '03',
    title: 'Digital & clarté',
    text: 'Collecte en ligne, transmission sécurisée et reporting lisible pour décider sereinement.',
  },
] as const;

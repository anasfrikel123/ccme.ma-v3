/** Auto-synced presentation fields from ../service-data.jsx (French). Run: node scripts/extract-services-detail.mjs */
export interface ServiceStep { t: string; d: string; }
export interface ServiceRelated { label: string; href: string; }
export interface ServiceDetailMeta {
  intro: string[];
  steps: ServiceStep[];
  related: ServiceRelated[];
  visual?: string;
}

export const servicesDetail: Record<string, ServiceDetailMeta> = {
  "tenue-comptabilite": {
    "intro": [
      "Nous prenons en charge l'intégralité de votre comptabilité : enregistrement des pièces, lettrage, rapprochements et établissement des états financiers. Vous gardez une visibilité claire sur la santé de votre entreprise, sans vous soucier de la technique.",
      "Nos outils digitaux simplifient la collecte des justificatifs et la transmission des documents, pour des échanges fluides et un archivage structuré."
    ],
    "steps": [
      {
        "t": "Reprise du dossier",
        "d": "Récupération de l'historique, paramétrage du plan comptable et mise en place des accès."
      },
      {
        "t": "Collecte digitale",
        "d": "Vous déposez vos pièces en ligne ; nous les traitons et les classons en continu."
      },
      {
        "t": "Traitement & contrôle",
        "d": "Saisie, rapprochements et vérifications avant chaque échéance déclarative."
      },
      {
        "t": "Reporting & conseil",
        "d": "Remise des états, points réguliers et recommandations pour optimiser votre gestion."
      }
    ],
    "related": [
      {
        "label": "Supervision comptable",
        "href": "/services/supervision-comptable"
      },
      {
        "label": "Gestion financière",
        "href": "/services/gestion-financiere"
      },
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      }
    ],
    "visual": "capture — journal & grand livre"
  },
  "supervision-comptable": {
    "intro": [
      "Pour les entreprises disposant d'un comptable interne, nous assurons une mission de supervision : revue régulière des écritures, contrôle de cohérence et accompagnement de votre équipe.",
      "Vous bénéficiez de la sécurité d'un expert sans perdre la maîtrise de votre comptabilité au quotidien."
    ],
    "steps": [
      {
        "t": "Audit initial",
        "d": "État des lieux de votre organisation comptable et de vos process actuels."
      },
      {
        "t": "Cadre de supervision",
        "d": "Définition de la fréquence des revues et des points de contrôle clés."
      },
      {
        "t": "Revues régulières",
        "d": "Vérification des écritures et des déclarations, corrections et conseils."
      },
      {
        "t": "Clôture & bilan",
        "d": "Validation des comptes annuels et préparation de la liasse fiscale."
      }
    ],
    "related": [
      {
        "label": "Tenue de comptabilité",
        "href": "/services/tenue-comptabilite"
      },
      {
        "label": "Gestion financière",
        "href": "/services/gestion-financiere"
      },
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      }
    ],
    "visual": "capture — révision des comptes"
  },
  "gestion-financiere": {
    "intro": [
      "Au-delà de la conformité, nous vous aidons à piloter votre performance : suivi de trésorerie, analyse des marges, budgets et prévisionnels.",
      "Des indicateurs clairs et réguliers pour anticiper, arbitrer et sécuriser votre développement."
    ],
    "steps": [
      {
        "t": "Diagnostic financier",
        "d": "Analyse de votre structure de coûts, marges et besoins en trésorerie."
      },
      {
        "t": "Indicateurs sur mesure",
        "d": "Définition des KPI pertinents pour votre secteur et vos objectifs."
      },
      {
        "t": "Suivi régulier",
        "d": "Mise à jour des tableaux de bord et commentaires d'analyse."
      },
      {
        "t": "Conseil & arbitrage",
        "d": "Recommandations pour optimiser la rentabilité et financer la croissance."
      }
    ],
    "related": [
      {
        "label": "Tenue de comptabilité",
        "href": "/services/tenue-comptabilite"
      },
      {
        "label": "Business plan",
        "href": "/services/business-plan"
      },
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      }
    ],
    "visual": "capture — tableau de bord financier"
  },
  "comptabilite-pharmaciens": {
    "intro": [
      "La pharmacie a ses propres règles : marges encadrées, gestion des stocks, conventions et fiscalité spécifique. Nous maîtrisons ces particularités.",
      "Un accompagnement comptable et fiscal pensé pour les pharmaciens, du démarrage à la transmission de l'officine."
    ],
    "steps": [
      {
        "t": "Prise en charge",
        "d": "Reprise du dossier de l'officine et paramétrage adapté au secteur."
      },
      {
        "t": "Suivi spécialisé",
        "d": "Traitement des spécificités : marges, stocks, conventions."
      },
      {
        "t": "Conformité",
        "d": "Déclarations dans les délais et veille réglementaire pharmacie."
      },
      {
        "t": "Conseil dédié",
        "d": "Accompagnement à l'installation, au développement ou à la cession."
      }
    ],
    "related": [
      {
        "label": "Tenue de comptabilité",
        "href": "/services/tenue-comptabilite"
      },
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      },
      {
        "label": "Création d'entreprise",
        "href": "/services/creation-entreprise"
      }
    ],
    "visual": "capture — comptabilité officine"
  },
  "conseil-fiscal": {
    "intro": [
      "Nos experts analysent votre situation et identifient les leviers d'optimisation adaptés à votre activité, tout en sécurisant votre conformité.",
      "Vous prenez vos décisions avec une vision claire de leur impact fiscal, sans mauvaise surprise."
    ],
    "steps": [
      {
        "t": "Bilan fiscal",
        "d": "Analyse de votre situation et de vos obligations actuelles."
      },
      {
        "t": "Stratégie",
        "d": "Identification des leviers d'optimisation conformes et pertinents."
      },
      {
        "t": "Mise en œuvre",
        "d": "Application des recommandations et suivi des déclarations."
      },
      {
        "t": "Veille continue",
        "d": "Adaptation à chaque évolution de la législation fiscale."
      }
    ],
    "related": [
      {
        "label": "Assistance fiscale & contentieux",
        "href": "/services/assistance-fiscale"
      },
      {
        "label": "Contrôle et contentieux",
        "href": "/services/controle-contentieux"
      },
      {
        "label": "Simpl Impôts DGI",
        "href": "/services/simpl-impots-dgi"
      }
    ],
    "visual": "capture — simulation fiscale"
  },
  "assistance-fiscale": {
    "intro": [
      "Nous gérons vos déclarations fiscales et vous assistons dans toutes vos relations avec la DGI, des demandes courantes aux situations complexes.",
      "En cas de désaccord, nous préparons et défendons votre dossier avec méthode."
    ],
    "steps": [
      {
        "t": "Analyse du dossier",
        "d": "Étude de votre situation et des points soulevés par l'administration."
      },
      {
        "t": "Préparation",
        "d": "Constitution des pièces et formalisation des réponses."
      },
      {
        "t": "Échanges",
        "d": "Dialogue avec la DGI et défense argumentée de votre position."
      },
      {
        "t": "Résolution",
        "d": "Régularisation ou contentieux, jusqu'à l'issue de la procédure."
      }
    ],
    "related": [
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      },
      {
        "label": "Contrôle et contentieux",
        "href": "/services/controle-contentieux"
      },
      {
        "label": "Simpl Impôts DGI",
        "href": "/services/simpl-impots-dgi"
      }
    ],
    "visual": "capture — dossier d'assistance fiscale"
  },
  "controle-contentieux": {
    "intro": [
      "Un contrôle fiscal se prépare. Nous analysons les enjeux, organisons votre documentation et vous assistons dans les échanges avec les vérificateurs.",
      "Notre objectif : sécuriser vos intérêts et obtenir l'issue la plus favorable possible."
    ],
    "steps": [
      {
        "t": "Préparation",
        "d": "Revue de votre dossier et anticipation des points de vigilance."
      },
      {
        "t": "Assistance",
        "d": "Présence et conseil tout au long de la vérification."
      },
      {
        "t": "Réponse",
        "d": "Analyse des conclusions et rédaction des observations."
      },
      {
        "t": "Règlement",
        "d": "Recours, négociation et suivi jusqu'à la clôture du dossier."
      }
    ],
    "related": [
      {
        "label": "Assistance fiscale & contentieux",
        "href": "/services/assistance-fiscale"
      },
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      },
      {
        "label": "Conseil juridique",
        "href": "/services/conseil-juridique"
      }
    ],
    "visual": "capture — procédure de contrôle"
  },
  "simpl-impots-dgi": {
    "intro": [
      "La dématérialisation des obligations fiscales est désormais la norme. Nous gérons l'ensemble de vos opérations sur le portail Simpl de la DGI.",
      "Déclarations et paiements transmis dans les délais, en toute sécurité, avec accusés de réception archivés."
    ],
    "steps": [
      {
        "t": "Mise en place",
        "d": "Configuration des accès au portail Simpl et de vos identifiants."
      },
      {
        "t": "Préparation",
        "d": "Établissement des déclarations à partir de votre comptabilité."
      },
      {
        "t": "Télétransmission",
        "d": "Dépôt et paiement en ligne avant chaque échéance."
      },
      {
        "t": "Archivage",
        "d": "Conservation structurée des justificatifs et accusés."
      }
    ],
    "related": [
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      },
      {
        "label": "Assistance fiscale & contentieux",
        "href": "/services/assistance-fiscale"
      },
      {
        "label": "Damancom CNSS",
        "href": "/services/damancom-cnss"
      }
    ],
    "visual": "capture — portail Simpl DGI"
  },
  "creation-entreprise": {
    "intro": [
      "Choix du statut, rédaction des statuts, immatriculation, démarches fiscales et sociales : nous vous accompagnons à chaque étape de la création.",
      "Particulièrement adaptés aux entrepreneurs et investisseurs expatriés, nous simplifions un parcours souvent complexe."
    ],
    "steps": [
      {
        "t": "Cadrage du projet",
        "d": "Choix de la structure adaptée à votre activité et à vos objectifs."
      },
      {
        "t": "Constitution",
        "d": "Rédaction des statuts et préparation du dossier complet."
      },
      {
        "t": "Formalités",
        "d": "Immatriculation, publications et inscriptions obligatoires."
      },
      {
        "t": "Démarrage",
        "d": "Mise en place comptable, fiscale et sociale pour lancer l'activité."
      }
    ],
    "related": [
      {
        "label": "Conseil juridique",
        "href": "/services/conseil-juridique"
      },
      {
        "label": "Domiciliation",
        "href": "/services/domiciliation"
      },
      {
        "label": "Business plan",
        "href": "/services/business-plan"
      }
    ],
    "visual": "capture — dossier de constitution"
  },
  "conseil-juridique": {
    "intro": [
      "Nous conseillons les dirigeants sur les aspects juridiques de leur activité : contrats, relations entre associés, conformité et sécurisation des opérations.",
      "Un interlocuteur de confiance pour anticiper les risques et prendre les bonnes décisions."
    ],
    "steps": [
      {
        "t": "Écoute",
        "d": "Compréhension de votre besoin et du contexte de votre société."
      },
      {
        "t": "Analyse",
        "d": "Étude juridique et identification des risques et options."
      },
      {
        "t": "Recommandation",
        "d": "Conseil clair et solutions adaptées à votre situation."
      },
      {
        "t": "Mise en œuvre",
        "d": "Rédaction des actes et accompagnement dans leur application."
      }
    ],
    "related": [
      {
        "label": "Création d'entreprise",
        "href": "/services/creation-entreprise"
      },
      {
        "label": "Travaux juridiques",
        "href": "/services/travaux-juridiques"
      },
      {
        "label": "Domiciliation",
        "href": "/services/domiciliation"
      }
    ],
    "visual": "capture — conseil juridique"
  },
  "travaux-juridiques": {
    "intro": [
      "Approbation des comptes, assemblées, modifications statutaires : nous gérons l'ensemble des travaux juridiques courants de votre entreprise.",
      "Vos obligations sont respectées, vos registres tenus à jour et vos formalités accomplies."
    ],
    "steps": [
      {
        "t": "Planification",
        "d": "Calendrier des obligations juridiques annuelles de la société."
      },
      {
        "t": "Préparation",
        "d": "Rédaction des actes, convocations et procès-verbaux."
      },
      {
        "t": "Formalisation",
        "d": "Tenue des assemblées et signature des documents."
      },
      {
        "t": "Dépôts",
        "d": "Publications, enregistrements et mise à jour des registres."
      }
    ],
    "related": [
      {
        "label": "Conseil juridique",
        "href": "/services/conseil-juridique"
      },
      {
        "label": "Création d'entreprise",
        "href": "/services/creation-entreprise"
      },
      {
        "label": "Domiciliation",
        "href": "/services/domiciliation"
      }
    ],
    "visual": "capture — secrétariat juridique"
  },
  "domiciliation": {
    "intro": [
      "Donnez à votre entreprise une adresse de référence à Tanger. Nous assurons la domiciliation légale et la gestion de votre courrier.",
      "Une solution idéale pour les créateurs, les sociétés en développement et les investisseurs étrangers."
    ],
    "steps": [
      {
        "t": "Souscription",
        "d": "Signature du contrat de domiciliation conforme."
      },
      {
        "t": "Mise en place",
        "d": "Attribution de l'adresse et activation du service courrier."
      },
      {
        "t": "Gestion",
        "d": "Réception, tri et notification de votre courrier."
      },
      {
        "t": "Suivi",
        "d": "Mise à disposition des documents pour vos démarches."
      }
    ],
    "related": [
      {
        "label": "Création d'entreprise",
        "href": "/services/creation-entreprise"
      },
      {
        "label": "Conseil juridique",
        "href": "/services/conseil-juridique"
      },
      {
        "label": "Travaux juridiques",
        "href": "/services/travaux-juridiques"
      }
    ],
    "visual": "capture — contrat de domiciliation"
  },
  "business-plan": {
    "intro": [
      "Que ce soit pour lever des fonds, obtenir un financement ou structurer votre projet, nous construisons avec vous un business plan crédible et chiffré.",
      "Études de faisabilité, prévisionnels financiers et argumentaire : tous les éléments pour passer à l'action."
    ],
    "steps": [
      {
        "t": "Cadrage",
        "d": "Compréhension du projet, du marché et de vos objectifs."
      },
      {
        "t": "Modélisation",
        "d": "Construction des hypothèses et des prévisionnels chiffrés."
      },
      {
        "t": "Rédaction",
        "d": "Mise en forme d'un dossier clair et convaincant."
      },
      {
        "t": "Présentation",
        "d": "Préparation à la présentation devant banques et investisseurs."
      }
    ],
    "related": [
      {
        "label": "Gestion financière",
        "href": "/services/gestion-financiere"
      },
      {
        "label": "Création d'entreprise",
        "href": "/services/creation-entreprise"
      },
      {
        "label": "Conseil fiscal",
        "href": "/services/conseil-fiscal"
      }
    ],
    "visual": "capture — prévisionnel & business plan"
  },
  "paie-grh": {
    "intro": [
      "Bulletins de paie, contrats, déclarations sociales : nous gérons l'ensemble de votre paie et vous accompagnons sur les aspects RH.",
      "Vos salariés sont payés à temps, vos obligations respectées et votre conformité sociale assurée."
    ],
    "steps": [
      {
        "t": "Paramétrage",
        "d": "Mise en place de votre dossier paie et de vos variables."
      },
      {
        "t": "Production",
        "d": "Établissement mensuel des bulletins et des déclarations."
      },
      {
        "t": "Déclarations",
        "d": "Transmission CNSS et paiements sociaux dans les délais."
      },
      {
        "t": "Conseil RH",
        "d": "Accompagnement sur les contrats, procédures et conformité."
      }
    ],
    "related": [
      {
        "label": "Damancom CNSS",
        "href": "/services/damancom-cnss"
      },
      {
        "label": "Social et administratif",
        "href": "/services/social-administratif"
      },
      {
        "label": "Conseil juridique",
        "href": "/services/conseil-juridique"
      }
    ],
    "visual": "capture — bulletins de paie"
  },
  "damancom-cnss": {
    "intro": [
      "Nous prenons en charge l'ensemble de vos obligations sociales sur le portail Damancom : déclarations des salaires et télépaiements des cotisations.",
      "Une gestion fiable et ponctuelle, pour une conformité sociale sans faille."
    ],
    "steps": [
      {
        "t": "Accès",
        "d": "Configuration de votre compte Damancom et des accès."
      },
      {
        "t": "Préparation",
        "d": "Établissement des déclarations à partir de la paie."
      },
      {
        "t": "Télétransmission",
        "d": "Dépôt et paiement des cotisations en ligne."
      },
      {
        "t": "Suivi",
        "d": "Archivage des bordereaux et gestion des régularisations."
      }
    ],
    "related": [
      {
        "label": "Paie et GRH",
        "href": "/services/paie-grh"
      },
      {
        "label": "Social et administratif",
        "href": "/services/social-administratif"
      },
      {
        "label": "Simpl Impôts DGI",
        "href": "/services/simpl-impots-dgi"
      }
    ],
    "visual": "capture — portail Damancom CNSS"
  },
  "social-administratif": {
    "intro": [
      "Au-delà de la paie, nous vous déchargeons des démarches sociales et administratives qui rythment la vie de l'entreprise.",
      "Attestations, formalités, relations avec les organismes : un interlocuteur unique pour tout gérer."
    ],
    "steps": [
      {
        "t": "Recensement",
        "d": "Inventaire de vos démarches et obligations récurrentes."
      },
      {
        "t": "Organisation",
        "d": "Mise en place d'un suivi et d'un calendrier dédié."
      },
      {
        "t": "Exécution",
        "d": "Réalisation des formalités auprès des organismes."
      },
      {
        "t": "Suivi",
        "d": "Archivage et anticipation des prochaines échéances."
      }
    ],
    "related": [
      {
        "label": "Paie et GRH",
        "href": "/services/paie-grh"
      },
      {
        "label": "Damancom CNSS",
        "href": "/services/damancom-cnss"
      },
      {
        "label": "Conseil juridique",
        "href": "/services/conseil-juridique"
      }
    ],
    "visual": "capture — démarches administratives"
  }
} as const;

export function getServiceDetail(slug: string): ServiceDetailMeta | undefined {
  return servicesDetail[slug];
}

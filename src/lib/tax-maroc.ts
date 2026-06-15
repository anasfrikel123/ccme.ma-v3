/**
 * Pure Moroccan tax math used by the /outils/* simulators.
 *
 * Every function in this module is side-effect-free, accepts plain
 * numbers, and returns a structured result. The simulator pages
 * (`src/pages/outils/*.astro`) import these helpers and only handle the
 * DOM glue. This split lets Vitest exercise tax-math regressions on
 * every commit without booting Astro or jsdom.
 *
 * Source of truth for the bareme IS (régime de droit commun, LF 2026) :
 *   Réforme IS 2023–2026 — taux cibles atteints en 2026 (CGI art. 19).
 *   Bénéfice net fiscal ≤ 100 000 000 DH → 20 % (toutes tranches).
 *   Bénéfice net fiscal > 100 000 000 DH → 35 % sur la fraction excédentaire.
 *   Cotisation minimale = max(0,25 % CA, 3 000 DH)
 *   Banques/assurances : 40 %. Industrie, export, hôtellerie : barèmes
 *   spécifiques — non couverts par ce simulateur généraliste.
 *   - IR mensuel 2026 — bareme officiel après réforme PLF 2025
 *     0–2 500           → 0 %
 *     2 501–4 166       → 10 %  (déduction 250)
 *     4 167–5 000       → 20 %  (déduction 666,67)
 *     5 001–6 666       → 30 %  (déduction 1 166,67)
 *     6 667–15 000      → 34 %  (déduction 1 433,33)
 *     > 15 000          → 37 %  (déduction 1 883,33)
 *   - CNSS (salarié 4,48 % plafonné 6 000 DH ; patronal 8,98 % plafonné)
 *   - AMO (salarié 2,26 % déplafonné ; patronal 4,11 %)
 *   - Allocations familiales 6,4 % patronal (plafond 6 000)
 *   - Taxe formation pro 1,6 % patronal (plafond 6 000)
 *
 * Any change to a rate or threshold should land here AND in the matching
 * `tax-maroc.test.ts` golden value. If a test fails after a rate change,
 * update the test to match the new law and link to the legal source in
 * the test comment.
 */

const round2 = (n: number): number => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// IS — Impôt sur les sociétés
// ---------------------------------------------------------------------------

export interface AcompteIs {
  numero: 1 | 2 | 3 | 4;
  montant: number;
  dateLimite: string;
  label: string;
}

export interface IsResult {
  /** Net IS computed bracket-by-bracket (no minimum). */
  isCalc: number;
  /** Per-bracket breakdown, useful for the UI. */
  tranches: { t1: number; t2: number; t3: number; t4: number };
  /** Cotisation minimale: max(0,25 % CA, 3 000 DH). */
  cotisationMinimale: number;
  /** Final IS due = max(isCalc, cotisationMinimale). */
  isDue: number;
  /** Which side won — useful for the UI note. */
  mode: 'bareme' | 'cotisation-minimale';
  /** Four quarterly provisional installments (25 % each, remainder on Q4). */
  acomptes: ReturnType<typeof computeAcomptesIs>;
}

/** Split IS due into four equal quarterly acomptes provisionnels (Moroccan law). */
export function computeAcomptesIs(
  isDue: number,
  year = 2026,
): { acomptes: AcompteIs[]; total: number } {
  if (!Number.isFinite(isDue) || isDue <= 0) {
    return { acomptes: [], total: 0 };
  }

  const due = round2(isDue);
  const base = Math.floor(due / 4);
  const q4Amount = round2(due - base * 3);

  const schedule: Array<{ numero: 1 | 2 | 3 | 4; dateLimite: string; label: string }> = [
    { numero: 1, dateLimite: `${year}-03-31`, label: '1er acompte IS' },
    { numero: 2, dateLimite: `${year}-06-30`, label: '2e acompte IS' },
    { numero: 3, dateLimite: `${year}-09-30`, label: '3e acompte IS' },
    { numero: 4, dateLimite: `${year}-12-31`, label: '4e acompte IS' },
  ];

  const acomptes: AcompteIs[] = schedule.map((s, i) => ({
    numero: s.numero,
    dateLimite: s.dateLimite,
    label: s.label,
    montant: i < 3 ? base : q4Amount,
  }));

  return { acomptes, total: due };
}

const trancheTax = (
  base: number,
  lower: number,
  upper: number,
  rate: number,
): number => {
  if (base <= lower) return 0;
  const taxable = Math.min(base, upper) - lower;
  return taxable * rate;
};

export function computeIS(ca: number, benefice: number): IsResult {
  if (!Number.isFinite(ca) || ca < 0) ca = 0;
  if (!Number.isFinite(benefice) || benefice < 0) benefice = 0;

  const t1 = trancheTax(benefice, 0, 300_000, 0.20);
  const t2 = trancheTax(benefice, 300_000, 1_000_000, 0.20);
  const t3 = trancheTax(benefice, 1_000_000, 100_000_000, 0.20);
  const t4 = trancheTax(benefice, 100_000_000, Infinity, 0.35);
  const isCalc = t1 + t2 + t3 + t4;
  const cotisationMinimale = Math.max(ca * 0.0025, 3_000);
  const isDue = round2(Math.max(isCalc, cotisationMinimale));
  return {
    isCalc: round2(isCalc),
    tranches: {
      t1: round2(t1),
      t2: round2(t2),
      t3: round2(t3),
      t4: round2(t4),
    },
    cotisationMinimale: round2(cotisationMinimale),
    isDue,
    mode: isDue === round2(cotisationMinimale) && isDue !== round2(isCalc)
      ? 'cotisation-minimale'
      : 'bareme',
    acomptes: computeAcomptesIs(isDue),
  };
}

// ---------------------------------------------------------------------------
// TVA
// ---------------------------------------------------------------------------

export type TvaDirection = 'htttc' | 'ttcht';

export interface TvaResult {
  ht: number;
  tva: number;
  ttc: number;
}

export function computeTVA(
  amount: number,
  rate: number,
  direction: TvaDirection,
): TvaResult {
  if (!Number.isFinite(amount) || amount < 0) amount = 0;
  if (!Number.isFinite(rate) || rate < 0) rate = 0;
  let ht: number;
  let ttc: number;
  if (direction === 'htttc') {
    ht = amount;
    ttc = ht * (1 + rate);
  } else {
    ttc = amount;
    ht = ttc / (1 + rate);
  }
  const tva = ttc - ht;
  return { ht: round2(ht), tva: round2(tva), ttc: round2(ttc) };
}

// ---------------------------------------------------------------------------
// IR — barème mensuel
// ---------------------------------------------------------------------------

export interface IrBracket {
  /** Inclusive upper bound of the bracket (Infinity for the last one). */
  upper: number;
  rate: number;
  deduction: number;
  /** Display label used by the sidebar — "10 %", "20 %", … */
  label: string;
}

export const irBrackets: readonly IrBracket[] = [
  { upper: 2_500, rate: 0.0, deduction: 0, label: '0 %' },
  { upper: 4_166, rate: 0.10, deduction: 250, label: '10 %' },
  { upper: 5_000, rate: 0.20, deduction: 666.67, label: '20 %' },
  { upper: 6_666, rate: 0.30, deduction: 1_166.67, label: '30 %' },
  { upper: 15_000, rate: 0.34, deduction: 1_433.33, label: '34 %' },
  { upper: Infinity, rate: 0.37, deduction: 1_883.33, label: '37 %' },
] as const;

export interface IrResult {
  /** IR before family deduction. */
  irBrut: number;
  /** Family deduction = `charges * 360`, capped at the IR brut. */
  chargesFamiliales: number;
  /** Final monthly IR due. */
  irMensuel: number;
  /** Bracket label (used by the simulator UI). */
  trancheLabel: string;
}

/**
 * Compute monthly IR on a base imposable (after CNSS / AMO / FP if you
 * chained from `computePaie`, or directly on a pension/freelance figure
 * otherwise). `charges` is the number of dependants (capped at 6 by the
 * tax code — anything above ignored).
 */
export function computeIR(baseImposable: number, charges = 0): IrResult {
  if (!Number.isFinite(baseImposable) || baseImposable < 0) baseImposable = 0;
  const dep = Math.max(0, Math.min(6, Math.floor(charges)));
  const bracket =
    irBrackets.find((b) => baseImposable <= b.upper) ?? irBrackets[irBrackets.length - 1];
  const irBrut = Math.max(0, baseImposable * bracket.rate - bracket.deduction);
  const chargesFamiliales = dep * 360;
  const irMensuel = Math.max(0, irBrut - chargesFamiliales);
  return {
    irBrut: round2(irBrut),
    chargesFamiliales: round2(chargesFamiliales),
    irMensuel: round2(irMensuel),
    trancheLabel: bracket.label,
  };
}

// ---------------------------------------------------------------------------
// Paie — full payslip
// ---------------------------------------------------------------------------

export interface PaieInput {
  brut: number;
  /** Number of dependants (charges familiales). Capped at 6. */
  charges?: number;
  /** Active CIMR contribution (3 % salarié). */
  cimr?: boolean;
}

export interface PaieResult {
  brut: number;
  /** Salarié contributions. */
  salarie: {
    cnss: number;
    amo: number;
    cimr: number;
    fraisProfessionnels: number;
    irBrut: number;
    chargesFamiliales: number;
    ir: number;
    net: number;
  };
  /** Patronal (employer) contributions. */
  patronal: {
    cnss: number;
    amo: number;
    allocationsFamiliales: number;
    taxeFormationPro: number;
  };
  /** Total cost to employer = brut + patronal. */
  coutEmployeur: number;
}

const PLAFOND_CNSS = 6_000;
const FP_CAP = 6_250;
const FP_RATE = 0.25;

export function computePaie(input: PaieInput): PaieResult {
  const brut = Math.max(0, Number.isFinite(input.brut) ? input.brut : 0);
  const charges = Math.max(0, Math.min(6, Math.floor(input.charges ?? 0)));
  const cimrActive = !!input.cimr;

  const cnssBase = Math.min(brut, PLAFOND_CNSS);
  const cnss = cnssBase * 0.0448;
  const amo = brut * 0.0226;
  const cimr = cimrActive ? brut * 0.03 : 0;

  // Frais professionnels: 25 % du brut imposable, plafonnés à 6 250 DH/mois.
  const baseFp = brut - cnss - amo - cimr;
  const fp = Math.min(Math.max(baseFp, 0) * FP_RATE, FP_CAP);
  const baseIr = baseFp - fp;
  const ir = computeIR(baseIr, charges);

  const net = brut - cnss - amo - cimr - ir.irMensuel;

  const cnssP = cnssBase * 0.0898;
  const amoP = brut * 0.0411;
  const af = cnssBase * 0.064;
  const tfp = cnssBase * 0.016;

  return {
    brut: round2(brut),
    salarie: {
      cnss: round2(cnss),
      amo: round2(amo),
      cimr: round2(cimr),
      fraisProfessionnels: round2(fp),
      irBrut: ir.irBrut,
      chargesFamiliales: ir.chargesFamiliales,
      ir: ir.irMensuel,
      net: round2(net),
    },
    patronal: {
      cnss: round2(cnssP),
      amo: round2(amoP),
      allocationsFamiliales: round2(af),
      taxeFormationPro: round2(tfp),
    },
    coutEmployeur: round2(brut + cnssP + amoP + af + tfp),
  };
}

// ---------------------------------------------------------------------------
// Création d'entreprise — coûts standards
// ---------------------------------------------------------------------------

export type FormeJuridique = 'sarl' | 'sarlau' | 'sas' | 'sa';

export interface CreationInput {
  forme: FormeJuridique;
  capital: number;
  /** Acte notarié (toujours requis pour SA). */
  acteNotarie?: boolean;
  /** Cabinet en mission clé-en-main (sinon DIY). */
  cabinet?: boolean;
}

export interface CreationResult {
  certificatNegatif: number;
  droitsEnregistrement: number;
  depotJuridique: number;
  notaire: number;
  bulletinOfficiel: number;
  honorairesCabinet: number;
  total: number;
  note: 'sa' | 'standard';
}

const COUT_CN = 230;
const COUT_DEPOT = 350;
const COUT_BO = 800;

export function computeCreation(input: CreationInput): CreationResult {
  const capital = Math.max(0, Number.isFinite(input.capital) ? input.capital : 0);
  const droits = Math.max(capital * 0.01, 1_000);
  const requiresNotaire = input.forme === 'sa' || !!input.acteNotarie;
  const notaire = requiresNotaire ? Math.max(capital * 0.005, 2_500) : 0;
  const honoraires = input.cabinet ? (input.forme === 'sa' ? 6_000 : 3_500) : 0;
  const total =
    COUT_CN + droits + COUT_DEPOT + notaire + COUT_BO + honoraires;
  return {
    certificatNegatif: COUT_CN,
    droitsEnregistrement: round2(droits),
    depotJuridique: COUT_DEPOT,
    notaire: round2(notaire),
    bulletinOfficiel: COUT_BO,
    honorairesCabinet: round2(honoraires),
    total: round2(total),
    note: input.forme === 'sa' ? 'sa' : 'standard',
  };
}

// ---------------------------------------------------------------------------
// Dividende — retenue à la source PFL (LF 2026: 12,5 %)
// ---------------------------------------------------------------------------

/**
 * Retenue PFL sur dividendes — Loi de Finances 2026 a abaissé le taux de
 * 13,75 % à 12,5 % pour les distributions de bénéfices d'exercices ouverts
 * à compter du 01/01/2026 (CGI art. 19 bis & 73-II). Les dividendes
 * distribués au titre d'exercices antérieurs restent taxés à l'ancien taux
 * — le simulateur expose les deux taux pour permettre la comparaison.
 *
 * Cas particulier non couvert ici : redistribution intra-groupe, conventions
 * fiscales internationales (taux conventionnels souvent réduits), holding
 * personnelle imposée à l'IS sur les dividendes reçus.
 */
export type DividendeRegime = '12.5' | '13.75' | '0';

export interface DividendeInput {
  /** Bénéfice net distribuable (après IS). */
  beneficeNetApresIs: number;
  /** Quote-part distribuée (0 à 1). */
  ratioDistribue: number;
  /** Régime applicable selon l'exercice. */
  regime: DividendeRegime;
}

export interface DividendeResult {
  beneficeNetApresIs: number;
  montantDistribue: number;
  retenuePfl: number;
  netActionnaire: number;
  tauxEffectif: number;
}

export function computeDividende(input: DividendeInput): DividendeResult {
  const benef = Math.max(0, Number.isFinite(input.beneficeNetApresIs) ? input.beneficeNetApresIs : 0);
  const ratio = Math.min(1, Math.max(0, Number.isFinite(input.ratioDistribue) ? input.ratioDistribue : 0));
  const taux = input.regime === '0' ? 0 : input.regime === '13.75' ? 0.1375 : 0.125;
  const distribue = benef * ratio;
  const retenue = distribue * taux;
  const net = distribue - retenue;
  return {
    beneficeNetApresIs: round2(benef),
    montantDistribue: round2(distribue),
    retenuePfl: round2(retenue),
    netActionnaire: round2(net),
    tauxEffectif: round2(taux * 100),
  };
}

// ---------------------------------------------------------------------------
// Rémunération gérant : salaire vs dividende — comparateur
// ---------------------------------------------------------------------------

/**
 * Compare deux stratégies de rémunération pour un gérant majoritaire :
 *   - 100 % salaire (cotisations CNSS / AMO + IR mensuel) ;
 *   - 100 % dividende (PFL 12,5 % LF 2026, après IS sur le bénéfice).
 *
 * Hypothèses : société à l'IS au taux unique 20 % (PME, CGI art. 19 LF 2026),
 * gérant majoritaire = TNS au régime général CNSS, plafond CNSS 6 000 DH.
 * Pas d'optimisation hybride dans ce modèle — l'objectif est de cadrer les
 * ordres de grandeur, pas de remplacer un avis fiscal personnalisé.
 */
export interface RemunerationInput {
  /** Enveloppe brute disponible avant tout choix de répartition (DH/an). */
  enveloppeBrute: number;
  /** Charges familiales (capées 6). */
  charges?: number;
  /** Taux IS applicable (par défaut 20 % LF 2026 régime PME). */
  tauxIs?: number;
  /** Régime PFL dividende (par défaut 12,5 %). */
  regimeDividende?: DividendeRegime;
}

export interface RemunerationStrategy {
  /** Net annuel perçu par le gérant. */
  netAnnuel: number;
  /** Total prélèvements (charges + impôts) sur l'enveloppe. */
  totalPrelevements: number;
  /** Taux global de prélèvement (%). */
  tauxGlobal: number;
}

export interface RemunerationResult {
  enveloppeBrute: number;
  salaire: RemunerationStrategy & {
    brutAnnuel: number;
    cnssSalarie: number;
    cnssPatronal: number;
    irAnnuel: number;
  };
  dividende: RemunerationStrategy & {
    isDuSurBenefice: number;
    distribuable: number;
    retenuePfl: number;
  };
  /** Différentiel net (salaire − dividende). Positif → salaire gagne. */
  differentielNet: number;
  /** Stratégie la plus avantageuse. */
  recommandation: 'salaire' | 'dividende' | 'equivalent';
}

export function computeRemuneration(input: RemunerationInput): RemunerationResult {
  const env = Math.max(0, Number.isFinite(input.enveloppeBrute) ? input.enveloppeBrute : 0);
  const charges = Math.max(0, Math.min(6, Math.floor(input.charges ?? 0)));
  const tauxIs = Number.isFinite(input.tauxIs) && (input.tauxIs as number) > 0 ? (input.tauxIs as number) : 0.20;
  const regime = input.regimeDividende ?? '12.5';

  // Stratégie 1 : 100% salaire. L'enveloppe couvre brut + cotisations patronales.
  // On résout brut tel que cout employeur = enveloppe annuelle.
  // Cout employeur ≈ brut * (1 + tauxPatronalEffectif). Le taux patronal
  // dépend du plafond CNSS, donc on itère mensuellement.
  // Approximation : on tente brut = env / 1.21 (taux patronal moyen 21% pour
  // bruts > plafond) puis on ajuste via computePaie.
  let brutMensuelEstime = env / 12 / 1.21;
  for (let i = 0; i < 12; i++) {
    const pa = computePaie({ brut: brutMensuelEstime, charges });
    const coutAnnuel = pa.coutEmployeur * 12;
    if (Math.abs(coutAnnuel - env) < 1) break;
    brutMensuelEstime *= env / coutAnnuel;
  }
  const paie = computePaie({ brut: brutMensuelEstime, charges });
  const netSalaireAnnuel = paie.salarie.net * 12;
  const cnssSalAnnuel = paie.salarie.cnss * 12;
  const irAnnuel = paie.salarie.ir * 12;
  const cnssPatAnnuel = (paie.patronal.cnss + paie.patronal.amo + paie.patronal.allocationsFamiliales + paie.patronal.taxeFormationPro) * 12;
  const totalPrelevSalaire = env - netSalaireAnnuel;

  // Stratégie 2 : 100% dividende. L'enveloppe est le bénéfice avant IS.
  const isDu = env * tauxIs;
  const distribuable = env - isDu;
  const div = computeDividende({
    beneficeNetApresIs: distribuable,
    ratioDistribue: 1,
    regime,
  });
  const totalPrelevDiv = env - div.netActionnaire;

  const diff = netSalaireAnnuel - div.netActionnaire;
  const recommandation: 'salaire' | 'dividende' | 'equivalent' =
    Math.abs(diff) < env * 0.01
      ? 'equivalent'
      : diff > 0
        ? 'salaire'
        : 'dividende';

  return {
    enveloppeBrute: round2(env),
    salaire: {
      brutAnnuel: round2(brutMensuelEstime * 12),
      cnssSalarie: round2(cnssSalAnnuel),
      cnssPatronal: round2(cnssPatAnnuel),
      irAnnuel: round2(irAnnuel),
      netAnnuel: round2(netSalaireAnnuel),
      totalPrelevements: round2(totalPrelevSalaire),
      tauxGlobal: round2((totalPrelevSalaire / env) * 100),
    },
    dividende: {
      isDuSurBenefice: round2(isDu),
      distribuable: round2(distribuable),
      retenuePfl: round2(div.retenuePfl),
      netAnnuel: div.netActionnaire,
      totalPrelevements: round2(totalPrelevDiv),
      tauxGlobal: round2((totalPrelevDiv / env) * 100),
    },
    differentielNet: round2(diff),
    recommandation,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers used by simulator UIs
// ---------------------------------------------------------------------------

export const fmtDH = (n: number, fractionDigits = 0): string =>
  n.toLocaleString('fr-FR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }) + ' DH';

export const fmtDH2 = (n: number): string => fmtDH(n, 2);

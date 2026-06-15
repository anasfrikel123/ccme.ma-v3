import { describe, expect, it } from 'vitest';
import {
  computeIS,
  computeIR,
  computeTVA,
  computePaie,
  computeCreation,
  computeDividende,
  computeRemuneration,
  computeAcomptesIs,
  irBrackets,
} from './tax-maroc';

/**
 * Golden values are computed by hand from the published bareme. If a
 * test fails after a rate change, update the golden number AND link to
 * the legal source (BO, PLF, instruction DGI) in the test comment.
 *
 * IS 2026 (régime de droit commun, LF 2026 / réforme 2023–2026) :
 *   20 % sur bénéfice ≤ 100 MDH, 35 % au-delà.
 */

describe('computeIS — Impôt sur les sociétés', () => {
  it('returns the cotisation minimale floor when no benefice', () => {
    const r = computeIS(2_000_000, 0);
    expect(r.isCalc).toBe(0);
    // 0,25 % × 2 000 000 = 5 000 DH > 3 000 floor
    expect(r.cotisationMinimale).toBe(5_000);
    expect(r.isDue).toBe(5_000);
    expect(r.mode).toBe('cotisation-minimale');
  });

  it('applies the absolute 3 000 DH floor on tiny revenue', () => {
    const r = computeIS(500_000, 0);
    expect(r.cotisationMinimale).toBe(3_000);
    expect(r.isDue).toBe(3_000);
  });

  it('applies 20 % on benefit within first tranche (LF 2026)', () => {
    const r = computeIS(0, 200_000);
    expect(r.tranches.t1).toBe(40_000); // 200 000 × 20 %
    expect(r.tranches.t2).toBe(0);
    expect(r.tranches.t3).toBe(0);
    expect(r.tranches.t4).toBe(0);
    expect(r.isCalc).toBe(40_000);
  });

  it('matches blog example — boutique 280K bénéfice → 56K IS', () => {
    const r = computeIS(1_200_000, 280_000);
    expect(r.isCalc).toBe(56_000);
  });

  it('matches blog example — services 850K bénéfice → 170K IS', () => {
    const r = computeIS(6_000_000, 850_000);
    expect(r.isCalc).toBe(170_000);
  });

  it('matches blog example — industrie 4,2M bénéfice → 840K IS', () => {
    const r = computeIS(35_000_000, 4_200_000);
    expect(r.isCalc).toBe(840_000);
  });

  it('crosses into bracket 4 (35 %) past 100 MDH bénéfice', () => {
    const r = computeIS(0, 150_000_000);
    // 100 MDH × 20 % + 50 MDH × 35 % = 20M + 17,5M
    expect(r.tranches.t1).toBe(60_000);
    expect(r.tranches.t2).toBe(140_000);
    expect(r.tranches.t3).toBe(19_800_000);
    expect(r.tranches.t4).toBe(17_500_000);
    expect(r.isCalc).toBe(37_500_000);
  });

  it('coerces negative inputs to zero', () => {
    const r = computeIS(-1, -1);
    expect(r.isCalc).toBe(0);
    // CA=0 → CM = 3 000 DH floor
    expect(r.cotisationMinimale).toBe(3_000);
    expect(r.isDue).toBe(3_000);
  });
});

describe('computeTVA — sens HT→TTC and TTC→HT', () => {
  it('HT → TTC at 20 %', () => {
    const r = computeTVA(1_000, 0.20, 'htttc');
    expect(r.ht).toBe(1_000);
    expect(r.tva).toBe(200);
    expect(r.ttc).toBe(1_200);
  });

  it('HT → TTC at 14 % (transport, beurre)', () => {
    const r = computeTVA(500, 0.14, 'htttc');
    expect(r.ht).toBe(500);
    expect(r.tva).toBe(70);
    expect(r.ttc).toBe(570);
  });

  it('TTC → HT at 20 %', () => {
    const r = computeTVA(1_200, 0.20, 'ttcht');
    expect(r.ht).toBe(1_000);
    expect(r.tva).toBe(200);
    expect(r.ttc).toBe(1_200);
  });

  it('round-trip stability: HT→TTC→HT', () => {
    const a = computeTVA(847.55, 0.20, 'htttc');
    const b = computeTVA(a.ttc, 0.20, 'ttcht');
    expect(b.ht).toBeCloseTo(847.55, 1);
  });
});

describe('computeIR — barème mensuel', () => {
  it('zero IR under the 2 500 floor', () => {
    const r = computeIR(2_400, 0);
    expect(r.irBrut).toBe(0);
    expect(r.irMensuel).toBe(0);
    expect(r.trancheLabel).toBe('0 %');
  });

  it('matches the 4 000 DH × 10 % bracket (déduction 250)', () => {
    // 4 000 × 10 % - 250 = 150 DH
    const r = computeIR(4_000, 0);
    expect(r.irBrut).toBe(150);
    expect(r.trancheLabel).toBe('10 %');
  });

  it('hits the 34 % bracket at 10 000 DH', () => {
    // 10 000 × 34 % - 1 433,33 = 1 966,67
    const r = computeIR(10_000, 0);
    expect(r.irBrut).toBeCloseTo(1_966.67, 2);
    expect(r.trancheLabel).toBe('34 %');
  });

  it('caps charges familiales at 6 dependants × 360 = 2 160', () => {
    const r = computeIR(20_000, 99);
    expect(r.chargesFamiliales).toBe(2_160);
  });

  it('charges familiales never push IR negative', () => {
    const r = computeIR(2_500, 6);
    expect(r.irMensuel).toBe(0);
  });

  it('exposes 6 brackets in increasing order', () => {
    expect(irBrackets).toHaveLength(6);
    let last = -1;
    for (const b of irBrackets) {
      expect(b.upper).toBeGreaterThan(last);
      last = b.upper === Infinity ? Infinity : b.upper;
    }
  });
});

describe('computeAcomptesIs — acomptes provisionnels trimestriels', () => {
  it('splits 200 000 DH into four equal 50 000 installments', () => {
    const r = computeAcomptesIs(200_000);
    expect(r.acomptes).toHaveLength(4);
    expect(r.acomptes.map((a) => a.montant)).toEqual([50_000, 50_000, 50_000, 50_000]);
    expect(r.total).toBe(200_000);
  });

  it('puts rounding remainder on the 4th quarter (100 001 DH)', () => {
    const r = computeAcomptesIs(100_001);
    expect(r.acomptes[0].montant).toBe(25_000);
    expect(r.acomptes[1].montant).toBe(25_000);
    expect(r.acomptes[2].montant).toBe(25_000);
    expect(r.acomptes[3].montant).toBe(25_001);
    expect(r.acomptes.reduce((s, a) => s + a.montant, 0)).toBe(100_001);
  });

  it('uses civil-year due dates for 2026', () => {
    const r = computeAcomptesIs(40_000, 2026);
    expect(r.acomptes[0].dateLimite).toBe('2026-03-31');
    expect(r.acomptes[1].dateLimite).toBe('2026-06-30');
    expect(r.acomptes[2].dateLimite).toBe('2026-09-30');
    expect(r.acomptes[3].dateLimite).toBe('2026-12-31');
  });

  it('returns empty acomptes when IS due is zero or negative', () => {
    expect(computeAcomptesIs(0).acomptes).toEqual([]);
    expect(computeAcomptesIs(-100).acomptes).toEqual([]);
    expect(computeAcomptesIs(0).total).toBe(0);
  });
});

describe('computeIS — includes acomptes', () => {
  it('attaches acomptes to computeIS result', () => {
    const r = computeIS(0, 200_000);
    expect(r.acomptes.acomptes).toHaveLength(4);
    expect(r.acomptes.total).toBe(r.isDue);
  });
});

describe('computePaie — full payslip', () => {
  it('mid-range 8 000 DH brut, 2 charges, no CIMR', () => {
    const r = computePaie({ brut: 8_000, charges: 2, cimr: false });
    expect(r.salarie.cnss).toBeCloseTo(268.80, 2);
    expect(r.salarie.amo).toBeCloseTo(180.80, 2);
    expect(r.salarie.fraisProfessionnels).toBeCloseTo(1_887.60, 1);
    expect(r.salarie.irBrut).toBeCloseTo(532.17, 1);
    expect(r.salarie.chargesFamiliales).toBe(720);
    expect(r.salarie.ir).toBe(0);
    expect(r.salarie.net).toBeCloseTo(7_550.40, 1);
  });

  it('CNSS plafond holds at 6 000 DH for 25 000 brut', () => {
    const r = computePaie({ brut: 25_000 });
    expect(r.salarie.cnss).toBeCloseTo(268.80, 2);
    expect(r.patronal.cnss).toBeCloseTo(538.80, 2);
    expect(r.patronal.allocationsFamiliales).toBeCloseTo(384, 2);
    expect(r.patronal.taxeFormationPro).toBeCloseTo(96, 2);
  });

  it('AMO is uncapped (scales with brut)', () => {
    const a = computePaie({ brut: 6_000 }).salarie.amo;
    const b = computePaie({ brut: 12_000 }).salarie.amo;
    expect(b).toBeCloseTo(a * 2, 1);
  });

  it('CIMR adds 3 % salarié contribution when active', () => {
    const off = computePaie({ brut: 10_000, cimr: false });
    const on = computePaie({ brut: 10_000, cimr: true });
    expect(on.salarie.cimr).toBeCloseTo(300, 2);
    expect(off.salarie.cimr).toBe(0);
  });

  it('coût employeur > brut for non-zero salaries', () => {
    const r = computePaie({ brut: 10_000 });
    expect(r.coutEmployeur).toBeGreaterThan(r.brut);
  });

  it('FP cap at 6 250 DH/mois holds for very high brut', () => {
    const r = computePaie({ brut: 50_000 });
    expect(r.salarie.fraisProfessionnels).toBe(6_250);
  });
});

describe('computeCreation — coût création société', () => {
  it('SARL with 100 000 DH capital + cabinet', () => {
    const r = computeCreation({
      forme: 'sarl',
      capital: 100_000,
      cabinet: true,
    });
    expect(r.droitsEnregistrement).toBe(1_000);
    expect(r.notaire).toBe(0);
    expect(r.honorairesCabinet).toBe(3_500);
    expect(r.total).toBe(5_880);
    expect(r.note).toBe('standard');
  });

  it('SA forces notaire even without explicit acte', () => {
    const r = computeCreation({ forme: 'sa', capital: 300_000 });
    expect(r.notaire).toBe(2_500);
    expect(r.note).toBe('sa');
  });

  it('droits floor at 1 000 DH for tiny capital', () => {
    const r = computeCreation({ forme: 'sarlau', capital: 10_000 });
    expect(r.droitsEnregistrement).toBe(1_000);
  });

  it('explicit acte notarié on SARL adds notaire fee', () => {
    const a = computeCreation({ forme: 'sarl', capital: 200_000 });
    const b = computeCreation({
      forme: 'sarl',
      capital: 200_000,
      acteNotarie: true,
    });
    expect(a.notaire).toBe(0);
    expect(b.notaire).toBe(2_500);
    expect(b.total - a.total).toBe(2_500);
  });
});

/**
 * computeDividende — Loi de Finances 2026 a uniformisé le taux PFL à 12,5 %
 * pour les exercices ouverts à compter du 01/01/2026 (CGI art. 73-II).
 */
describe('computeDividende — PFL sur dividendes', () => {
  it('applies 12,5 % PFL on full distribution (LF 2026)', () => {
    const r = computeDividende({
      beneficeNetApresIs: 800_000,
      ratioDistribue: 1,
      regime: '12.5',
    });
    expect(r.montantDistribue).toBe(800_000);
    expect(r.retenuePfl).toBe(100_000);
    expect(r.netActionnaire).toBe(700_000);
    expect(r.tauxEffectif).toBe(12.5);
  });

  it('applies 13,75 % PFL on legacy regime', () => {
    const r = computeDividende({
      beneficeNetApresIs: 1_000_000,
      ratioDistribue: 1,
      regime: '13.75',
    });
    expect(r.retenuePfl).toBe(137_500);
    expect(r.netActionnaire).toBe(862_500);
  });

  it('respects partial distribution ratio', () => {
    const r = computeDividende({
      beneficeNetApresIs: 1_000_000,
      ratioDistribue: 0.4,
      regime: '12.5',
    });
    expect(r.montantDistribue).toBe(400_000);
    expect(r.retenuePfl).toBe(50_000);
    expect(r.netActionnaire).toBe(350_000);
  });

  it('handles zero benefit gracefully', () => {
    const r = computeDividende({ beneficeNetApresIs: 0, ratioDistribue: 1, regime: '12.5' });
    expect(r.netActionnaire).toBe(0);
  });
});

describe('computeRemuneration — comparateur salaire vs dividende', () => {
  it('returns both strategies with consistent envelope', () => {
    const r = computeRemuneration({ enveloppeBrute: 600_000, charges: 2 });
    // Salaire path: net should be < envelope after CNSS/IR
    expect(r.salaire.netAnnuel).toBeLessThan(600_000);
    expect(r.salaire.netAnnuel).toBeGreaterThan(0);
    // Dividende path: 600 000 * 80 % = 480 000 distribuable, * 87.5 % = 420 000 net
    expect(r.dividende.isDuSurBenefice).toBe(120_000);
    expect(r.dividende.distribuable).toBe(480_000);
    expect(r.dividende.netAnnuel).toBe(420_000);
  });

  it('respects custom IS rate (zone franche 8,75 %)', () => {
    const r = computeRemuneration({
      enveloppeBrute: 500_000,
      tauxIs: 0.0875,
    });
    expect(r.dividende.isDuSurBenefice).toBe(43_750);
    expect(r.dividende.distribuable).toBe(456_250);
  });

  it('produces a non-empty recommandation', () => {
    const r = computeRemuneration({ enveloppeBrute: 800_000 });
    expect(['salaire', 'dividende', 'equivalent']).toContain(r.recommandation);
  });

  it('converges employer cost within 1 DH for a 5 MDH envelope', () => {
    const env = 5_000_000;
    const r = computeRemuneration({ enveloppeBrute: env, charges: 0 });
    const brutMensuel = r.salaire.brutAnnuel / 12;
    const pa = computePaie({ brut: brutMensuel, charges: 0 });
    const coutAnnuel = pa.coutEmployeur * 12;
    expect(Math.abs(coutAnnuel - env)).toBeLessThan(1);
  });
});

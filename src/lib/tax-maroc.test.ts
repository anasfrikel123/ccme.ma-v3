import { describe, expect, it } from 'vitest';
import {
  computeIS,
  computeIR,
  computeTVA,
  computePaie,
  computeCreation,
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

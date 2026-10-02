import { test } from "node:test";
import assert from "node:assert/strict";
import { splitMontant, PRESTATAIRE_SHARE_RATE, PLATFORM_COMMISSION_RATE } from "../src/config/commission.config";

test("les taux couvrent 100 %", () => {
  assert.equal(Math.round((PRESTATAIRE_SHARE_RATE + PLATFORM_COMMISSION_RATE) * 100), 100);
});

test("répartition d'un montant rond", () => {
  assert.deepEqual(splitMontant(100), { montantPrestataire: 85, commissionTasky: 15 });
});

test("part prestataire + commission = montant payé, au centime près (0,01 € → 9 999,99 €)", () => {
  const ecarts: number[] = [];
  for (let c = 1; c <= 999_999; c++) {
    const { montantPrestataire, commissionTasky } = splitMontant(c / 100);
    if (Math.round(montantPrestataire * 100) + Math.round(commissionTasky * 100) !== c) ecarts.push(c);
  }
  assert.equal(ecarts.length, 0, `${ecarts.length} montants désalignés, ex. ${ecarts.slice(0, 5).map((c) => c / 100).join(", ")} €`);
});

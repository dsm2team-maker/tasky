import { test } from "node:test";
import assert from "node:assert/strict";
import {
  expectedAmountCentimes,
  verifyPaymentIntentForPrestation,
  PaymentIntentLike,
  PrestationPaymentInfo,
} from "../src/modules/payment/payment.verification";

const prestation: PrestationPaymentInfo = {
  id: "presta_1",
  montant: 120,
  montantFinal: null,
  stripePaymentIntentId: "pi_1",
};

const pi = (over: Partial<PaymentIntentLike> = {}): PaymentIntentLike => ({
  id: "pi_1",
  status: "succeeded",
  amount: 12000,
  amount_received: 12000,
  currency: "eur",
  metadata: { prestationId: "presta_1" },
  ...over,
});

const reason = (p: PaymentIntentLike, presta = prestation) => {
  const r = verifyPaymentIntentForPrestation(p, presta);
  return r.ok ? "OK" : r.reason;
};

test("PI conforme → accepté", () => {
  assert.equal(reason(pi()), "OK");
});

test("montantFinal prioritaire sur montant", () => {
  const presta = { ...prestation, montantFinal: 99.99 };
  assert.equal(expectedAmountCentimes(presta), 9999);
  assert.equal(reason(pi({ amount: 9999, amount_received: 9999 }), presta), "OK");
  assert.equal(reason(pi(), presta), "AMOUNT_MISMATCH");
});

test("arrondi au centime sans erreur flottante", () => {
  assert.equal(expectedAmountCentimes({ ...prestation, montant: 19.99 }), 1999);
  assert.equal(expectedAmountCentimes({ ...prestation, montant: 0.29 }), 29);
});

test("PI non réussi → refusé", () => {
  assert.equal(reason(pi({ status: "requires_payment_method" })), "PI_NOT_SUCCEEDED");
});

test("PI d'une autre prestation → refusé (SEC-002)", () => {
  assert.equal(reason(pi({ id: "pi_autre" })), "PI_MISMATCH");
  assert.equal(reason(pi({ metadata: { prestationId: "presta_2" } })), "PRESTATION_MISMATCH");
  assert.equal(reason(pi({ metadata: null })), "PRESTATION_MISMATCH");
});

test("prestation sans PI enregistré → refusé", () => {
  assert.equal(reason(pi(), { ...prestation, stripePaymentIntentId: null }), "PI_MISMATCH");
});

test("devise ou montant incorrects → refusé", () => {
  assert.equal(reason(pi({ currency: "usd" })), "CURRENCY_MISMATCH");
  assert.equal(reason(pi({ amount: 1000, amount_received: 1000 })), "AMOUNT_MISMATCH");
  // Montant encaissé partiel alors que amount est correct
  assert.equal(reason(pi({ amount_received: 1000 })), "AMOUNT_MISMATCH");
});

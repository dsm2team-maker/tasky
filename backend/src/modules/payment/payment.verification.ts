// Vérifie qu'un PaymentIntent Stripe correspond bien à la prestation qu'il prétend payer.
// Sans cette liaison, un PI réussi (ex. 10 € sur une autre prestation) pouvait être
// présenté pour faire passer n'importe quelle prestation en EN_COURS (SEC-002).

export interface PaymentIntentLike {
  id: string;
  status: string;
  amount: number;
  amount_received?: number | null;
  currency: string;
  metadata?: Record<string, string> | null;
}

export interface PrestationPaymentInfo {
  id: string;
  montant: number;
  montantFinal: number | null;
  stripePaymentIntentId: string | null;
}

export type PaymentVerification =
  | { ok: true }
  | { ok: false; reason: "PI_NOT_SUCCEEDED" | "PI_MISMATCH" | "PRESTATION_MISMATCH" | "AMOUNT_MISMATCH" | "CURRENCY_MISMATCH" };

export function expectedAmountCentimes(prestation: Pick<PrestationPaymentInfo, "montant" | "montantFinal">): number {
  return Math.round((prestation.montantFinal ?? prestation.montant) * 100);
}

export function verifyPaymentIntentForPrestation(
  pi: PaymentIntentLike,
  prestation: PrestationPaymentInfo,
): PaymentVerification {
  if (pi.status !== "succeeded") return { ok: false, reason: "PI_NOT_SUCCEEDED" };
  if (!prestation.stripePaymentIntentId || prestation.stripePaymentIntentId !== pi.id) {
    return { ok: false, reason: "PI_MISMATCH" };
  }
  if (pi.metadata?.prestationId !== prestation.id) return { ok: false, reason: "PRESTATION_MISMATCH" };
  if (pi.currency !== "eur") return { ok: false, reason: "CURRENCY_MISMATCH" };
  const received = pi.amount_received ?? pi.amount;
  if (received !== expectedAmountCentimes(prestation)) return { ok: false, reason: "AMOUNT_MISMATCH" };
  return { ok: true };
}

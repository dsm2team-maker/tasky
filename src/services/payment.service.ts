/**
 * 🔌 TASKY — Service paiement frontend
 * Appels HTTP vers le backend — aucune logique métier ici
 */
import { apiClient } from "@/lib/api-client";
import { routes } from "@/config/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConnectStatus {
  stripeAccountId: string | null;
  stripeOnboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "RESTRICTED" | "COMPLETE";
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeDetailsSubmitted: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentService = {
  createPaymentIntent: (prestationId: string) =>
    apiClient.post<{ clientSecret: string }>(
      routes.api.payment.createPaymentIntent,
      { prestationId },
    ),

  confirmPayment: (prestationId: string, paymentIntentId: string) =>
    apiClient.post<{ success: boolean }>(routes.api.payment.confirmPayment, {
      prestationId,
      paymentIntentId,
    }),

  createConnectAccount: () =>
    apiClient.post<{ success: boolean; stripeAccountId: string }>(
      routes.api.connect.account,
      {},
    ),

  createConnectAccountSession: () =>
    apiClient.post<{ success: boolean; clientSecret: string }>(
      routes.api.connect.accountSession,
      {},
    ),

  getConnectStatus: () =>
    apiClient.get<{ success: boolean; data: ConnectStatus }>(
      routes.api.connect.status,
    ),
};

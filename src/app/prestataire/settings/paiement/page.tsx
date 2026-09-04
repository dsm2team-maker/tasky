"use client";

import React, { useEffect, useMemo, useState } from "react";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from "@stripe/react-connect-js";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  useConnectStatus,
  useCreateConnectAccount,
  useCreateAccountSession,
} from "@/hooks/usePaymentConnect";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "Non configuré", className: "bg-gray-100 text-gray-600" },
  IN_PROGRESS: { label: "En cours", className: "bg-yellow-100 text-yellow-700" },
  RESTRICTED: { label: "Restreint — informations manquantes", className: "bg-red-100 text-red-700" },
  COMPLETE: { label: "✓ Activé", className: "bg-emerald-100 text-emerald-700" },
};

export default function PaiementSettingsPage() {
  const { isHydrated, isReady } = useAuthGuard({ requireEmailVerified: false });
  const { data: status, isLoading: statusLoading } = useConnectStatus();
  const createAccount = useCreateConnectAccount();
  const createSession = useCreateAccountSession();

  const [connectInstance, setConnectInstance] = useState<ReturnType<
    typeof loadConnectAndInitialize
  > | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

  const isComplete = status?.stripeOnboardingStatus === "COMPLETE";

  useEffect(() => {
    if (!isReady || connectInstance || isComplete) return;

    let cancelled = false;

    const init = async () => {
      try {
        if (!status?.stripeAccountId) {
          await createAccount.mutateAsync();
        }
        if (cancelled) return;

        const instance = loadConnectAndInitialize({
          publishableKey,
          fetchClientSecret: async () => {
            const clientSecret = await createSession.mutateAsync();
            return clientSecret;
          },
          appearance: {
            variables: { colorPrimary: "#10b981", borderRadius: "12px" },
          },
          locale: "fr-FR",
        });

        if (!cancelled) setConnectInstance(instance);
      } catch (err: any) {
        if (!cancelled) {
          setInitError(
            err?.response?.data?.message ?? "Impossible d'initialiser le paiement Stripe.",
          );
        }
      }
    };

    if (status !== undefined) init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, status, isComplete]);

  const statusInfo = useMemo(
    () => STATUS_LABELS[status?.stripeOnboardingStatus ?? "NOT_STARTED"],
    [status],
  );

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.secondary.border}`}
        />
      </div>
    );

  if (!isReady) return null;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />

      <main className={`${spacing.container} py-8 max-w-3xl`}>
        <h1 className={`${typography.h5.base} ${colors.text.primary} mb-1`}>
          💰 Recevez vos rémunérations
        </h1>
        <p className={`text-sm ${colors.text.tertiary} mb-6`}>
          Renseignez vos informations bancaires une seule fois pour recevoir automatiquement votre part sur votre compte, dès qu'une prestation est validée.
        </p>

        <div className="flex items-center gap-2 mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.className}`}>
            {statusLoading ? "Chargement…" : statusInfo.label}
          </span>
        </div>

        {!isComplete && (
          <div className={`rounded-2xl border ${colors.secondary.borderLight} ${colors.secondary.bg} p-5 mb-6`}>
            <p className={`text-sm font-semibold ${colors.secondary.textDark} mb-3`}>
              Pourquoi Stripe ?
            </p>
            <ul className={`space-y-2 text-sm ${colors.text.secondary}`}>
              <li className="flex items-start gap-2">
                <span>🔒</span>
                <span>
                  Stripe est le partenaire de paiement utilisé par des millions d'entreprises (Uber, Airbnb...). Tasky n'a jamais accès à votre IBAN : tout est géré et chiffré directement par Stripe.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>⚡</span>
                <span>
                  Une fois configuré, vous n'avez plus rien à faire : votre part (85% du montant) est virée automatiquement dès qu'un client valide votre prestation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>⏱️</span>
                <span>La création prend environ 5 minutes, avec une pièce d'identité et un RIB.</span>
              </li>
              <li className="flex items-start gap-2">
                <span>💡</span>
                <span>
                  Vous n'avez pas de société ? Laissez l'option par défaut « Entrepreneur individuel / Micro-entrepreneur / Auto-entrepreneur » — c'est fait pour vous, aucune création d'entreprise n'est nécessaire.
                </span>
              </li>
            </ul>
          </div>
        )}

        <div
          className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
        >
          {isComplete && (
            <p className={`text-sm ${colors.text.secondary}`}>
              ✓ Votre compte Stripe est configuré. Vous recevrez automatiquement vos paiements après chaque prestation terminée.
            </p>
          )}

          {!isComplete && initError && (
            <p className={`text-sm ${colors.error.text} mb-4`}>{initError}</p>
          )}

          {!isComplete && !publishableKey && (
            <p className={`text-sm ${colors.error.text}`}>
              Configuration Stripe manquante — contactez le support.
            </p>
          )}

          {!isComplete && publishableKey && !connectInstance && !initError && (
            <div className="flex items-center justify-center py-12">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${colors.secondary.border}`}
              />
            </div>
          )}

          {!isComplete && connectInstance && (
            <ConnectComponentsProvider connectInstance={connectInstance}>
              <ConnectAccountOnboarding
                onExit={() => window.location.reload()}
              />
            </ConnectComponentsProvider>
          )}
        </div>
      </main>
    </div>
  );
}

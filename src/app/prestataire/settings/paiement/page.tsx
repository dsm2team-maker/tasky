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

  useEffect(() => {
    if (!isReady || connectInstance) return;

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
  }, [isReady, status]);

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
          💳 Paiement
        </h1>
        <p className={`text-sm ${colors.text.tertiary} mb-6`}>
          Configurez votre compte Stripe pour recevoir vos paiements après chaque prestation terminée.
        </p>

        <div className="flex items-center gap-2 mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.className}`}>
            {statusLoading ? "Chargement…" : statusInfo.label}
          </span>
        </div>

        <div
          className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
        >
          {initError && (
            <p className={`text-sm ${colors.error.text} mb-4`}>{initError}</p>
          )}

          {!publishableKey && (
            <p className={`text-sm ${colors.error.text}`}>
              Configuration Stripe manquante — contactez le support.
            </p>
          )}

          {publishableKey && !connectInstance && !initError && (
            <div className="flex items-center justify-center py-12">
              <div
                className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${colors.secondary.border}`}
              />
            </div>
          )}

          {connectInstance && (
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

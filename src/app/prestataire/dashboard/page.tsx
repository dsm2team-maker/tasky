"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile, usePrestataireCompetences } from "@/hooks/useProfile";
import { Button } from "@/components/ui/Button";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing, transitions } from "@/config/design-tokens";
import { routes } from "@/config/routes";

const BIO_MIN = 100;

export default function PrestataireDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: profile } = useProfile();
  const { data: competences } = usePrestataireCompetences();

  // ── Calcul profil complet 5/5 ─────────────────────────────────────────────
  const hasBio = (profile?.prestataire?.bio?.length ?? 0) >= BIO_MIN;
  const hasCompetences = (competences?.length ?? 0) > 0;
  const hasPointDepot = !!profile?.prestataire?.pointDepotAdresse;
  const hasIban = !!profile?.prestataire?.iban;
  const emailVerified = !!profile?.emailVerified;
  const profileComplete =
    emailVerified && hasBio && hasCompetences && hasPointDepot && hasIban;

  useEffect(() => setIsHydrated(true), []);
  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push(routes.auth.login);
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500`}
        />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />

      <main className={`${spacing.container} py-8`}>
        {/* ── Bandeau profil incomplet ── */}
        {!profileComplete && (
          <div className="mb-6 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 mb-1">
                Votre compte n'est pas encore actif
              </h3>
              <p className="text-sm text-amber-700">
                Complétez votre profil pour commencer à recevoir des demandes de
                clients.
              </p>
            </div>
            <Link
              href={routes.prestataire.profile.view}
              className="flex-shrink-0"
            >
              <Button variant="secondary" size="sm">
                Compléter mon profil →
              </Button>
            </Link>
          </div>
        )}

        {/* ── Welcome Banner ── */}
        <div
          className={`${colors.secondary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue,{" "}
            {user?.firstName || user?.email?.split("@")[0] || "Prestataire"} !
            🛠️
          </h1>
          <p className="text-emerald-100 mb-6">
            {profileComplete
              ? "Votre profil est actif. Consultez les demandes disponibles."
              : "Complétez votre profil pour être visible par les clients."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={routes.prestataire.profile.view}>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Mon profil
              </Button>
            </Link>
            {profileComplete && (
              <Link href={routes.prestataire.requests.list}>
                <Button
                  variant="outline"
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Voir les demandes
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Actions rapides ── */}
        <h2 className={`text-xl font-bold ${colors.text.primary} mb-4`}>
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Demandes disponibles */}
          {profileComplete ? (
            <Link href={routes.prestataire.requests.list}>
              <div
                className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light} hover:shadow-md ${transitions.base} cursor-pointer group`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 ${transitions.base}`}
                  >
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold ${colors.text.primary} mb-2`}
                    >
                      Demandes disponibles
                    </h3>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      Consultez les nouvelles demandes de clients près de chez
                      vous
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              onClick={() => router.push(routes.prestataire.profile.view)}
              className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light} cursor-pointer opacity-60`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${colors.text.primary} mb-2`}
                  >
                    Demandes disponibles
                  </h3>
                  <p className={`text-sm ${colors.warning.text} font-medium`}>
                    ⚠️ Complétez votre profil pour accéder aux demandes
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mes prestations */}
          {profileComplete ? (
            <Link href={routes.prestataire.services.list}>
              <div
                className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light} hover:shadow-md ${transitions.base} cursor-pointer group`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 ${transitions.base}`}
                  >
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-bold ${colors.text.primary} mb-2`}
                    >
                      Mes prestations
                    </h3>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      Gérez vos prestations en cours et votre historique
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              onClick={() => router.push(routes.prestataire.profile.view)}
              className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light} cursor-pointer opacity-60`}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-7 h-7 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${colors.text.primary} mb-2`}
                  >
                    Mes prestations
                  </h3>
                  <p className={`text-sm ${colors.warning.text} font-medium`}>
                    ⚠️ Complétez votre profil pour accéder aux prestations
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Empty State ── */}
        <div
          className={`${colors.background.white} rounded-xl p-12 text-center shadow-sm border ${colors.border.light}`}
        >
          <div
            className={`w-20 h-20 ${colors.background.light} rounded-full flex items-center justify-center mx-auto mb-4 text-4xl`}
          >
            🛠️
          </div>
          <h3 className={`text-xl font-bold ${colors.text.primary} mb-2`}>
            {profileComplete
              ? "Aucune prestation en cours"
              : "Profil incomplet"}
          </h3>
          <p className={`${colors.text.secondary} mb-6`}>
            {profileComplete
              ? "Commencez par consulter les demandes disponibles et proposez vos services"
              : "Complétez votre profil pour apparaître dans les recherches des clients"}
          </p>
          <Link
            href={
              profileComplete
                ? routes.prestataire.requests.list
                : routes.prestataire.profile.view
            }
          >
            <Button size="lg" variant="secondary" className="text-white">
              {profileComplete ? "Voir les demandes" : "Compléter mon profil →"}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/Button";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing, transitions, gradients } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function PrestataireDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push(routes.auth.login);
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500`}
        ></div>
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />

      <main className={`${spacing.container} py-8`}>
        {/* Welcome Banner */}
        <div
          className={`${colors.secondary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue,{" "}
            {user?.firstName || user?.email?.split("@")[0] || "Prestataire"} !
            🛠️
          </h1>
          <p className="text-emerald-100 mb-6">
            Gérez vos prestations et développez votre activité
          </p>
          <Link href={routes.prestataire.requests.list}>
            <Button
              size="lg"
              className={`bg-white ${colors.secondary.text} ${colors.secondary.bgHover}`}
            >
              Voir les demandes disponibles
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Nouvelles demandes", icon: "🔔", color: colors.neutral },
            {
              label: "Prestations en cours",
              icon: "⏱️",
              color: colors.warning,
            },
            { label: "Terminées ce mois", icon: "✅", color: colors.success },
            {
              label: "Revenus ce mois",
              icon: "💶",
              value: "0 €",
              color: colors.secondary,
            },
          ].map(({ label, icon, value, color }) => (
            <div
              key={label}
              className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light}`}
            >
              <div
                className={`w-12 h-12 ${color.bg} rounded-lg flex items-center justify-center mb-4 text-xl`}
              >
                {icon}
              </div>
              <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
                {value ?? "0"}
              </h3>
              <p className={`text-sm ${colors.text.secondary}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          <Link href={routes.prestataire.services.list}>
            <div
              className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light} hover:shadow-md ${transitions.base} cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 ${gradients.neutralDark} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 ${transitions.base}`}
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
        </div>

        {/* Empty State */}
        <div
          className={`${colors.background.white} rounded-xl p-12 text-center shadow-sm border ${colors.border.light}`}
        >
          <div
            className={`w-20 h-20 ${colors.background.light} rounded-full flex items-center justify-center mx-auto mb-4 text-4xl`}
          >
            🛠️
          </div>
          <h3 className={`text-xl font-bold ${colors.text.primary} mb-2`}>
            Aucune prestation en cours
          </h3>
          <p className={`${colors.text.secondary} mb-6`}>
            Commencez par consulter les demandes disponibles et proposez vos
            services
          </p>
          <Link href={routes.prestataire.requests.list}>
            <Button size="lg" variant="secondary" className="text-white">
              Voir les demandes
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

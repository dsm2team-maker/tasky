"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/Button";
import { colors } from "@/config/colors";
import { spacing, transitions } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import Logo from "@/components/Logo";

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // ✅ Fix refresh
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(routes.auth.login);
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push(routes.public.home);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      {/* Header */}
      <header
        className={`${colors.background.white} shadow-sm border-b ${colors.border.light}`}
      >
        <div className={spacing.container}>
          <div className="flex items-center justify-between h-16">
            <Link href={routes.public.home}>
              <Logo />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={routes.client.dashboard}
                className={`${colors.primary.text} font-semibold`}
              >
                Tableau de bord
              </Link>
              <Link
                href={routes.client.search.base}
                className={`${colors.text.secondary} hover:text-purple-600 transition-colors`}
              >
                Trouver un prestataire
              </Link>
              <Link
                href={routes.client.requests.list}
                className={`${colors.text.secondary} hover:text-purple-600 transition-colors`}
              >
                Mes demandes
              </Link>
              <Link
                href={routes.client.messages.list}
                className={`${colors.text.secondary} hover:text-purple-600 transition-colors`}
              >
                Messages
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href={routes.client.profile.view}>
                <Button
                  variant="outline"
                  className={`${colors.primary.border} ${colors.primary.text} ${colors.primary.bgHover}`}
                >
                  Mon profil
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className={colors.text.secondary}
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={`${spacing.container} py-8`}>
        {/* Welcome Banner */}
        <div
          className={`${colors.primary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue,{" "}
            {user?.firstName || user?.email?.split("@")[0] || "Client"} ! 👋
          </h1>
          <p className="text-pink-100 mb-6">
            Trouvez des prestataires locaux pour vos projets
          </p>
          <Link href={routes.client.requests.new}>
            <Button
              size="lg"
              className={`bg-white ${colors.primary.text} ${colors.primary.bgHover}`}
            >
              + Créer une nouvelle demande
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light}`}
          >
            <div className="mb-4">
              <div
                className={`w-12 h-12 ${colors.neutral.bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-6 h-6 ${colors.neutral.text}`}
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
            </div>
            <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
              0
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Demandes actives
            </p>
          </div>

          <div
            className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light}`}
          >
            <div className="mb-4">
              <div
                className={`w-12 h-12 ${colors.warning.bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-6 h-6 ${colors.warning.text}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
              0
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>En cours</p>
          </div>

          <div
            className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light}`}
          >
            <div className="mb-4">
              <div
                className={`w-12 h-12 ${colors.success.bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-6 h-6 ${colors.success.text}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
              0
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>Terminées</p>
          </div>

          <div
            className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light}`}
          >
            <div className="mb-4">
              <div
                className={`w-12 h-12 ${colors.primary.bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-6 h-6 ${colors.primary.text}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
              0
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Nouveaux messages
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href={routes.client.search.base}>
            <div
              className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light} hover:shadow-md ${transitions.base} cursor-pointer group`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 ${colors.primary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 ${transitions.base}`}
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${colors.text.primary} mb-2`}
                  >
                    Trouver un prestataire
                  </h3>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    Recherchez des artisans qualifiés près de chez vous
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href={routes.client.requests.new}>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold ${colors.text.primary} mb-2`}
                  >
                    Créer une demande
                  </h3>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    Décrivez votre projet et recevez des propositions
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
            className={`w-20 h-20 ${colors.background.light} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <svg
              className={`w-10 h-10 ${colors.text.muted}`}
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
          <h3 className={`text-xl font-bold ${colors.text.primary} mb-2`}>
            Aucune demande pour le moment
          </h3>
          <p className={`${colors.text.secondary} mb-6`}>
            Commencez par créer votre première demande ou parcourez les
            prestataires disponibles
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={routes.client.requests.new}>
              <Button
                size="lg"
                className={`${colors.primary.gradient} ${colors.primary.gradientHover} text-white`}
              >
                Créer une demande
              </Button>
            </Link>
            <Link href={routes.client.search.base}>
              <Button
                variant="outline"
                className={`${colors.primary.border} ${colors.primary.text} ${colors.primary.bgHover}`}
              >
                Rechercher des prestataires
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

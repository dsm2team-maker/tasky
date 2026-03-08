"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/Button";
import { colors } from "@/config/colors";
import { gradients, spacing, transitions } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import Logo from "@/components/Logo";

export default function ArtisanDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // ✅ Fix refresh : attendre que Zustand soit hydraté
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

  // Loader pendant l'hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      {/* ===== HEADER PRESTATAIRE ===== */}
      <header
        className={`${colors.background.white} shadow-sm border-b ${colors.border.light}`}
      >
        <div className={spacing.container}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={routes.public.home} className="flex items-center gap-2">
              <Logo />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={routes.artisan.dashboard}
                className={`${colors.premium.text} font-semibold`}
              >
                Tableau de bord
              </Link>
              <Link
                href={routes.artisan.requests.list}
                className={`${colors.text.secondary} hover:text-purple-600 transition-colors`}
              >
                Demandes disponibles
              </Link>
              <Link
                href={routes.artisan.services.list}
                className={`${colors.text.secondary} hover:text-purple-600 transition-colors`}
              >
                Mes prestations
              </Link>
              <Link
                href={routes.artisan.messages.list}
                className={`${colors.text.secondary} hover:text-purple-600 transition-colors`}
              >
                Messages
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <Link href={routes.artisan.profile.view}>
                <Button
                  variant="outline"
                  className={`${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bgHover}`}
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

      {/* ===== MAIN CONTENT ===== */}
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
          <Link href={routes.artisan.requests.list}>
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
              0
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Nouvelles demandes
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
            <p className={`text-sm ${colors.text.secondary}`}>
              Prestations en cours
            </p>
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
            <p className={`text-sm ${colors.text.secondary}`}>
              Terminées ce mois
            </p>
          </div>

          <div
            className={`${colors.background.white} rounded-xl p-6 shadow-sm border ${colors.border.light}`}
          >
            <div className="mb-4">
              <div
                className={`w-12 h-12 ${colors.secondary.bg} rounded-lg flex items-center justify-center`}
              >
                <svg
                  className={`w-6 h-6 ${colors.secondary.text}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>
              0 €
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Revenus ce mois
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href={routes.artisan.requests.list}>
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

          <Link href={routes.artisan.services.list}>
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className={`text-xl font-bold ${colors.text.primary} mb-2`}>
            Aucune prestation en cours
          </h3>
          <p className={`${colors.text.secondary} mb-6`}>
            Commencez par consulter les demandes disponibles et proposez vos
            services
          </p>

          <Link href={routes.artisan.requests.list}>
            <Button
              variant="secondary"
              size="lg"
              className="shadow-xl text-white"
            >
              Voir les demandes
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/Button";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";
import { typography, gradients } from "@/config/design-tokens";

export default function ArtisanDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Protection : rediriger si non authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.auth.login);
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push(routes.public.home);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={routes.public.home} className="flex items-center gap-2">
              <img src="/logo-tasky.png" alt="Tasky" className="h-10 w-auto" />
              <span
                className={`text-xl font-bold bg-gradient-to-r from-pink-500 to-emerald-500 bg-clip-text text-transparent`}
              >
                Tasky
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href={routes.artisan.dashboard}
                className={`${colors.secondary.text} font-semibold`}
              >
                Tableau de bord
              </Link>
              <Link
                href={routes.artisan.requests.list}
                className={`text-gray-700 hover:${colors.secondary.text}`}
              >
                Demandes disponibles
              </Link>
              <Link
                href={routes.artisan.services.list}
                className={`text-gray-700 hover:${colors.secondary.text}`}
              >
                Mes prestations
              </Link>
              <Link
                href={routes.artisan.messages.list}
                className={`text-gray-700 hover:${colors.secondary.text}`}
              >
                Messages
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
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
                className="text-gray-700"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div
          className={`${colors.secondary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.email?.split("@")[0] || "Prestataire"} ! 🛠️
          </h1>
          <p className={`${colors.secondary.textLight} mb-6`}>
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
          {/* Nouvelles demandes */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Nouvelles demandes</p>
          </div>

          {/* En cours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Prestations en cours</p>
          </div>

          {/* Terminées */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Terminées ce mois</p>
          </div>

          {/* Revenus */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${colors.secondary.bg} rounded-lg flex items-center justify-center`}
              >
                00 rounded-lg flex items-center justify-center"
                <svg
                  className="w-6 h-6 text-emerald-600"
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0 €</h3>
            <p className="text-sm text-gray-600">Revenus ce mois</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Consulter les demandes */}
          <Link href={routes.artisan.requests.list}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}
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
                    className={`text-lg font-bold text-gray-900 mb-2 group-hover:${colors.secondary.text} transition`}
                  >
                    Demandes disponibles
                  </h3>
                  <p className="text-sm text-gray-600">
                    Consultez les nouvelles demandes de clients près de chez
                    vous
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Mes prestations */}
          <Link href={routes.artisan.services.list}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 ${gradients.neutralDark} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}
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
                    className={`text-lg font-bold text-gray-900 mb-2 group-hover:${colors.neutral.text} transition`}
                  >
                    Mes prestations
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gérez vos prestations en cours et votre historique
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Aucune prestation en cours
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par consulter les demandes disponibles et proposez vos
            services
          </p>
          <Link href={routes.artisan.requests.list}>
            <Button
              className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
            >
              Voir les demandes
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}

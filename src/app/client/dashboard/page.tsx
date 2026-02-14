"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/Button";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function ClientDashboard() {
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
    router.push("/");
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
                href={routes.client.dashboard}
                className={`${colors.primary.text} font-semibold`}
              >
                Tableau de bord
              </Link>
              <Link
                href={routes.client.search.base}
                className={`text-gray-700 hover:${colors.primary.text}`}
              >
                Trouver un prestataire
              </Link>
              <Link
                href={routes.client.requests.list}
                className={`text-gray-700 hover:${colors.primary.text}`}
              >
                Mes demandes
              </Link>
              <Link
                href={routes.client.messages.list}
                className={`text-gray-700 hover:${colors.primary.text}`}
              >
                Messages
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
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
          className={`${colors.primary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.email?.split("@")[0] || "Client"} ! 👋
          </h1>
          <p className={`${colors.primary.textLight} mb-6`}>
            Trouvez des prestataires locaux pour vos projets
          </p>
          <Link href="/client/requests/new">
            <Button
              size="lg"
              className={`bg-white ${colors.primary.text} ${colors.primary.bgHover}`}
            >
              + Créer une nouvelle demande
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Demandes actives */}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Demandes actives</p>
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
            <p className="text-sm text-gray-600">En cours</p>
          </div>

          {/* Terminées */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Terminées</p>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">0</h3>
            <p className="text-sm text-gray-600">Nouveaux messages</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Trouver un prestataire */}
          <Link href="/client/search">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 ${colors.primary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition`}
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
                    className={`text-lg font-bold text-gray-900 mb-2 group-hover:${colors.primary.text} transition`}
                  >
                    Trouver un prestataire
                  </h3>
                  <p className="text-sm text-gray-600">
                    Recherchez des artisans qualifiés près de chez vous
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* Créer une demande */}
          <Link href="/client/requests/new">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold text-gray-900 mb-2 group-hover:${colors.secondary.text} transition`}
                  >
                    Créer une demande
                  </h3>
                  <p className="text-sm text-gray-600">
                    Décrivez votre projet et recevez des propositions
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Aucune demande pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Commencez par créer votre première demande ou parcourez les
            prestataires disponibles
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/client/requests/new">
              <Button
                className={`${colors.primary.gradient} ${colors.primary.gradientHover}`}
              >
                Créer une demande
              </Button>
            </Link>
            <Link href="/client/search">
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

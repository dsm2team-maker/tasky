"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function DashClientDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-tasky.png" alt="Tasky" className="h-10 w-auto" />
              <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-emerald-500 bg-clip-text text-transparent">
                Tasky
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/demo/dashClient"
                className="text-pink-600 font-semibold border-b-2 border-pink-600 pb-1"
              >
                Tableau de bord
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-pink-600 transition"
              >
                Trouver un prestataire
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-pink-600 transition"
              >
                Mes demandes
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-pink-600 transition"
              >
                Messages
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-pink-600 text-pink-600 hover:bg-pink-50"
              >
                Mon profil
              </Button>
              <Button variant="ghost" className="text-gray-700">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Badge DEMO */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-800 font-bold">
            🎨 PAGE DE DÉMONSTRATION - Client Dashboard
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Ceci est une prévisualisation du tableau de bord client
          </p>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Bienvenue, Marie ! 👋</h1>
          <p className="text-pink-100 mb-6">
            Trouvez des prestataires locaux pour tous vos projets
          </p>
          <Button
            size="lg"
            className="bg-white text-pink-600 hover:bg-pink-50 shadow-md"
          >
            + Créer une nouvelle demande
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Demandes actives */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">3</h3>
            <p className="text-sm text-gray-600">Demandes actives</p>
          </div>

          {/* En cours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">2</h3>
            <p className="text-sm text-gray-600">En cours</p>
          </div>

          {/* Terminées */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">8</h3>
            <p className="text-sm text-gray-600">Terminées</p>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-pink-600"
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
              <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                5
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">5</h3>
            <p className="text-sm text-gray-600">Nouveaux messages</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Trouver un prestataire */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition">
                  Trouver un prestataire
                </h3>
                <p className="text-sm text-gray-600">
                  Recherchez des artisans qualifiés près de chez vous
                </p>
              </div>
            </div>
          </div>

          {/* Créer une demande */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition">
                  Créer une demande
                </h3>
                <p className="text-sm text-gray-600">
                  Décrivez votre projet et recevez des propositions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Mes demandes récentes
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="text-pink-600 border-pink-600 hover:bg-pink-50"
            >
              Voir tout
            </Button>
          </div>

          {/* Request List */}
          <div className="space-y-4">
            {/* Request 1 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Réparation machine à laver
                    </h3>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      En cours
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Ma machine à laver fait un bruit bizarre lors de
                    l'essorage...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Jean Dupont
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Il y a 2 jours
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">85 €</p>
                  <p className="text-xs text-gray-500">Budget estimé</p>
                </div>
              </div>
            </div>

            {/* Request 2 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Retouche costume
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      3 propositions
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    J'ai besoin de faire retoucher un costume pour un mariage...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📍 Paris 15ème</span>
                    <span>⏰ Il y a 5 jours</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">45 €</p>
                  <p className="text-xs text-gray-500">Budget estimé</p>
                </div>
              </div>
            </div>

            {/* Request 3 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Cours de tricot
                    </h3>
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      Terminé
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Je cherche quelqu'un pour m'apprendre les bases du tricot...
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Sophie Martin
                    </span>
                    <span>⭐ 5/5</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">30 €</p>
                  <p className="text-xs text-gray-500">Payé</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

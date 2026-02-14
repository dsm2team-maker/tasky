"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function DashArtisanDemo() {
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
                href="/demo/dashArtisan"
                className="text-emerald-600 font-semibold border-b-2 border-emerald-600 pb-1"
              >
                Tableau de bord
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-emerald-600 transition"
              >
                Demandes disponibles
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-emerald-600 transition"
              >
                Mes prestations
              </Link>
              <Link
                href="#"
                className="text-gray-700 hover:text-emerald-600 transition"
              >
                Messages
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
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
            🎨 PAGE DE DÉMONSTRATION - Artisan Dashboard
          </p>
          <p className="text-sm text-yellow-700 mt-1">
            Ceci est une prévisualisation du tableau de bord prestataire
          </p>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Bienvenue, Jean ! 🛠️</h1>
          <p className="text-emerald-100 mb-6">
            Gérez vos prestations et développez votre activité
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-md"
          >
            Voir les demandes disponibles
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Nouvelles demandes */}
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>
              <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                12
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
            <p className="text-sm text-gray-600">Nouvelles demandes</p>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">5</h3>
            <p className="text-sm text-gray-600">Prestations en cours</p>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">23</h3>
            <p className="text-sm text-gray-600">Terminées ce mois</p>
          </div>

          {/* Revenus */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
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
            <h3 className="text-2xl font-bold text-gray-900 mb-1">1 847 €</h3>
            <p className="text-sm text-gray-600">Revenus ce mois</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Consulter les demandes */}
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition">
                  Demandes disponibles
                </h3>
                <p className="text-sm text-gray-600">
                  Consultez les nouvelles demandes de clients près de chez vous
                </p>
              </div>
            </div>
          </div>

          {/* Mes prestations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
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
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  Mes prestations
                </h3>
                <p className="text-sm text-gray-600">
                  Gérez vos prestations en cours et votre historique
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prestations en cours */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Prestations en cours
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            >
              Voir tout
            </Button>
          </div>

          {/* Service List */}
          <div className="space-y-4">
            {/* Service 1 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Réparation machine à laver
                    </h3>
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                      En cours
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Client : Marie Dubois • 📍 Paris 12ème
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      ⏰ Prévu demain 14h
                    </span>
                    <span className="text-xs text-gray-500">
                      📦 Point relais : Relais Colis Bastille
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">85 €</p>
                  <p className="text-xs text-gray-500">Commission : 12,75 €</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Contacter le client
                </Button>
                <Button size="sm" variant="outline">
                  Détails
                </Button>
              </div>
            </div>

            {/* Service 2 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Retouche costume
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                      À récupérer
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Client : Thomas Laurent • 📍 Paris 15ème
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      ✅ Travail terminé
                    </span>
                    <span className="text-xs text-gray-500">
                      📦 À déposer au point relais
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">45 €</p>
                  <p className="text-xs text-gray-500">Commission : 6,75 €</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Confirmer dépôt
                </Button>
                <Button size="sm" variant="outline">
                  Détails
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Nouvelles demandes disponibles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Nouvelles demandes disponibles
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
            >
              Voir tout (12)
            </Button>
          </div>

          {/* Request List */}
          <div className="space-y-4">
            {/* Request 1 */}
            <div className="border-2 border-emerald-200 bg-emerald-50 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Réparation vélo électrique
                    </h3>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                      🎯 Correspond à votre profil
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Mon vélo électrique ne s'allume plus. Batterie ou problème
                    électrique ?
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📍 Paris 11ème (2,3 km de vous)</span>
                    <span>⏰ Publié il y a 2h</span>
                    <span className="text-emerald-600 font-medium">
                      0 propositions
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">120 €</p>
                  <p className="text-xs text-gray-500">Budget client</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Envoyer une proposition
                </Button>
                <Button size="sm" variant="outline">
                  Voir détails
                </Button>
              </div>
            </div>

            {/* Request 2 */}
            <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      Cours de couture débutant
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Je cherche quelqu'un pour m'apprendre les bases de la
                    couture (ourlets, boutons...)
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📍 Paris 18ème (4,7 km de vous)</span>
                    <span>⏰ Publié il y a 1 jour</span>
                    <span className="text-amber-600 font-medium">
                      2 propositions
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">40 €</p>
                  <p className="text-xs text-gray-500">Budget client</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Envoyer une proposition
                </Button>
                <Button size="sm" variant="outline">
                  Voir détails
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

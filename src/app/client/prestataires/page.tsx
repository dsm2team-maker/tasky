"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useListPrestataires } from "@/hooks/usePrestataire";
import HeaderClient from "@/components/headers/HeaderClient";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import categoriesData from "@/data/categories.json";
import type { Categorie } from "@/types/categories.types";
import type { PublicPrestataire } from "@/services/prestataire.service";

const categories = categoriesData.categories as Categorie[];

// ─── Étoiles ──────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-sm ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Carte prestataire ────────────────────────────────────────────────────────

function CardPrestataire({ p }: { p: PublicPrestataire }) {
  const uniqueCategories = p.competences
    .map((c) => c.category)
    .filter(Boolean)
    .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 3);

  return (
    <Link href={`/prestataires/${p.id}`}>
      <div className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
            {p.avatar ? (
              <img src={p.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-bold ${colors.text.primary} text-base`}>{p.firstName}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                p.disponibilite === "ACTIF"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}>
                {p.disponibilite === "ACTIF" ? "✅ Disponible" : "⏳ Occupé"}
              </span>
            </div>
            {p.city && (
              <p className={`text-xs ${colors.text.muted} mt-0.5`}>📍 {p.city}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={p.rating} />
              <span className={`text-xs font-semibold ${colors.text.primary}`}>
                {p.rating > 0 ? p.rating.toFixed(1) : "—"}
              </span>
              <span className={`text-xs ${colors.text.muted}`}>({p.reviewCount} avis)</span>
            </div>
          </div>
        </div>

        {p.bio && (
          <p className={`text-sm ${colors.text.secondary} leading-relaxed mb-3 line-clamp-2`}>
            {p.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {uniqueCategories.map((c) => (
            <span
              key={c.id}
              className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
            >
              {c.icon} {c.nom}
            </span>
          ))}
        </div>

        <div className={`flex gap-4 text-xs ${colors.text.muted} pt-3 border-t ${colors.border.light}`}>
          <span>🛠️ {p.nbPrestations} prestation{p.nbPrestations > 1 ? "s" : ""}</span>
          {p.delaiMoyen != null && <span>⏱️ {p.delaiMoyen}j en moy.</span>}
          {p.tauxReussite != null && <span>✅ {p.tauxReussite}% réussite</span>}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecherchePrestatairesPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const [ville, setVille] = useState("");
  const [villeDebounced, setVilleDebounced] = useState("");
  const [nom, setNom] = useState("");
  const [nomDebounced, setNomDebounced] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [disponibilite, setDisponibilite] = useState("");

  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    const t = setTimeout(() => setVilleDebounced(ville), 400);
    return () => clearTimeout(t);
  }, [ville]);

  useEffect(() => {
    const t = setTimeout(() => setNomDebounced(nom), 400);
    return () => clearTimeout(t);
  }, [nom]);

  const filters = {
    city: villeDebounced || undefined,
    nom: nomDebounced || undefined,
    categoryId: categoryId || undefined,
    disponibilite: disponibilite || undefined,
  };

  const { data: prestataires, isLoading } = useListPrestataires(filters);

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`} />
      </div>
    );

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Trouver un prestataire</h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            {prestataires?.length ?? 0} prestataire{(prestataires?.length ?? 0) > 1 ? "s" : ""} disponible{(prestataires?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-2xl border ${colors.border.light} shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="👤 Rechercher par nom..."
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className={`flex-1 px-4 py-2.5 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300`}
          />
          <input
            type="text"
            placeholder="📍 Rechercher par ville..."
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            className={`flex-1 px-4 py-2.5 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300`}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 ${colors.text.secondary} bg-white`}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.nom}
              </option>
            ))}
          </select>
          <select
            value={disponibilite}
            onChange={(e) => setDisponibilite(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 ${colors.text.secondary} bg-white`}
          >
            <option value="">Toute disponibilité</option>
            <option value="ACTIF">✅ Disponible</option>
            <option value="OCCUPE">⏳ Occupé</option>
          </select>
          {(ville || nom || categoryId || disponibilite) && (
            <button
              onClick={() => { setVille(""); setNom(""); setCategoryId(""); setDisponibilite(""); }}
              className={`px-4 py-2.5 rounded-xl border ${colors.border.light} text-sm ${colors.text.secondary} hover:bg-gray-50 transition-colors`}
            >
              Effacer
            </button>
          )}
        </div>

        {/* Résultats */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`} />
          </div>
        ) : !prestataires || prestataires.length === 0 ? (
          <div className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}>
            <div className="text-5xl mb-4">🔍</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Aucun prestataire trouvé
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Essayez avec une autre ville ou catégorie
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prestataires.map((p) => (
              <CardPrestataire key={p.id} p={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

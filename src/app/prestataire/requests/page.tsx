"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDemandesDisponibles } from "@/hooks/useDevis";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { Button } from "@/components/ui/Button";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { DemandeDisponible, MatchLabel } from "@/services/devis.service";

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const matchConfig: Record<
  MatchLabel,
  {
    label: string;
    icon: string;
    badgeColor: string;
    borderColor: string;
    message: string;
  }
> = {
  PARFAIT: {
    label: "Match parfait",
    icon: "🌟",
    badgeColor: "bg-green-100 text-green-700 border border-green-200",
    borderColor: "border-green-300",
    message: "",
  },
  BON: {
    label: "Bon match",
    icon: "✅",
    badgeColor: "bg-blue-100 text-blue-700 border border-blue-200",
    borderColor: "border-blue-200",
    message: "",
  },
  PARTIEL: {
    label: "Match partiel",
    icon: "⚠️",
    badgeColor: "bg-orange-100 text-orange-700 border border-orange-200",
    borderColor: "border-gray-200",
    message: "Vous pouvez répondre à une partie du besoin",
  },
};

const urgenceConfig: Record<string, { icon: string; label: string }> = {
  NORMAL: { icon: "🟢", label: "Normal" },
  URGENT: { icon: "🟡", label: "Urgent" },
  TRES_URGENT: { icon: "🔴", label: "Très urgent" },
};

const typeConfig: Record<string, string> = {
  MODIFICATION: "🔧 Modification",
  CREATION: "✨ Création",
  FORMATION: "🎓 Formation",
};

// ─── Carte demande ────────────────────────────────────────────────────────────

function CardDemande({ demande }: { demande: DemandeDisponible }) {
  const [showScore, setShowScore] = useState(false);
  const match = matchConfig[demande.matching.label];
  const urgence = urgenceConfig[demande.urgence] || urgenceConfig.NORMAL;

  const scoreDetails = [
    { label: "Catégorie", pts: demande.matching.details.categorie, max: 40 },
    {
      label: "Sous-catégorie",
      pts: demande.matching.details.sousCategorie,
      max: 25,
    },
    {
      label: "Interventions",
      pts: demande.matching.details.interventions,
      max: 20,
    },
    { label: "Localisation", pts: demande.matching.details.ville, max: 10 },
    { label: "Note prestataire", pts: demande.matching.details.rating, max: 5 },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border-2 ${match.borderColor} shadow-sm flex flex-col`}
    >
      {/* Corps de la carte */}
      <div className="p-5 flex-1">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold ${match.badgeColor}`}
          >
            {match.icon} {match.label}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-100 text-gray-600`}
          >
            {Math.round(demande.matching.score)}/100
          </span>
          <span className={`text-xs ${colors.text.muted}`}>
            {urgence.icon} {urgence.label}
          </span>
          <span className={`text-xs ${colors.text.muted}`}>
            {typeConfig[demande.typePrestation]}
          </span>
        </div>

        {/* Message match partiel */}
        {match.message && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-xs text-orange-700 font-medium">
              💡 {match.message}
            </p>
          </div>
        )}

        {/* Titre + photo */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1">
            <h3
              className={`font-bold ${colors.text.primary} text-base leading-tight`}
            >
              {demande.titre}
            </h3>
          </div>
          {demande.photos && demande.photos.length > 0 && (
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={demande.photos[0]}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <p className={`text-sm ${colors.text.secondary} mb-3 line-clamp-2`}>
          {demande.description}
        </p>

        {/* Catégorie */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
          >
            {demande.category.icon} {demande.category.nom}
          </span>
          {demande.subCategory && (
            <span
              className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
            >
              › {demande.subCategory.nom}
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="flex flex-wrap gap-3 mb-3">
          {demande.ville && (
            <span className={`text-xs ${colors.text.secondary}`}>
              📍 {demande.ville}
            </span>
          )}
          {demande.budget && (
            <span className={`text-xs ${colors.text.secondary}`}>
              💶 {demande.budget} €
            </span>
          )}
          {demande.dateEcheance && (
            <span className={`text-xs ${colors.text.secondary}`}>
              📅 {new Date(demande.dateEcheance).toLocaleDateString("fr-FR")}
            </span>
          )}
          <span className={`text-xs ${colors.text.muted}`}>
            💬 {demande._count.devis} devis reçu
            {demande._count.devis > 1 ? "s" : ""}
          </span>
        </div>

        {/* Détail du score — toggle */}
        <button
          onClick={() => setShowScore(!showScore)}
          className={`text-xs ${colors.text.muted} hover:${colors.text.secondary} underline mb-2`}
        >
          {showScore
            ? "Masquer le détail du score ▲"
            : "Voir le détail du score ▼"}
        </button>

        {showScore && (
          <div
            className={`p-3 rounded-xl ${colors.background.gray} mb-3 space-y-1.5`}
          >
            {scoreDetails.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-2"
              >
                <span className={`text-xs ${colors.text.secondary}`}>
                  {item.pts > 0 ? "✔️" : "✖️"} {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full ${item.pts > 0 ? "bg-green-400" : "bg-gray-200"}`}
                      style={{ width: `${(item.pts / item.max) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium ${item.pts > 0 ? colors.success.text : colors.text.muted} w-10 text-right`}
                  >
                    {item.pts}/{item.max}
                  </span>
                </div>
              </div>
            ))}
            <div
              className={`flex items-center justify-between pt-1 border-t ${colors.border.light}`}
            >
              <span className={`text-xs font-bold ${colors.text.primary}`}>
                Total
              </span>
              <span className={`text-xs font-bold ${colors.secondary.text}`}>
                {Math.round(demande.matching.score)}/100
              </span>
            </div>
          </div>
        )}

        {/* Client */}
        <div
          className={`flex items-center gap-2 pt-3 border-t ${colors.border.light}`}
        >
          <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {demande.client.user.avatar ? (
              <img
                src={demande.client.user.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs">
                👤
              </div>
            )}
          </div>
          <span className={`text-xs ${colors.text.secondary}`}>
            {demande.client.user.firstName} · Publié le{" "}
            {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      {/* CTA — toujours en bas */}
      <div className={`p-4 border-t ${colors.border.light} flex gap-2`}>
        <Link href={`/prestataire/requests/${demande.id}`} className="flex-1">
          <Button variant="outline" size="sm" fullWidth>
            👁️ Voir la demande
          </Button>
        </Link>
        <Link href={`/prestataire/requests/${demande.id}`} className="flex-1">
          <Button variant="secondary" size="sm" fullWidth>
            📝 Envoyer un devis
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PrestataireRequestsPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<MatchLabel | "TOUTES">("TOUTES");
  const { data: demandes, isLoading, error } = useDemandesDisponibles();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  const filtered = demandes?.filter((d) =>
    filter === "TOUTES" ? true : d.matching.label === filter,
  );

  const filters: { value: MatchLabel | "TOUTES"; label: string }[] = [
    { value: "TOUTES", label: "Toutes" },
    { value: "PARFAIT", label: "🌟 Match parfait" },
    { value: "BON", label: "✅ Bon match" },
    { value: "PARTIEL", label: "⚠️ Match partiel" },
  ];

  // Compteurs par label
  const counts = {
    PARFAIT:
      demandes?.filter((d) => d.matching.label === "PARFAIT").length ?? 0,
    BON: demandes?.filter((d) => d.matching.label === "BON").length ?? 0,
    PARTIEL:
      demandes?.filter((d) => d.matching.label === "PARTIEL").length ?? 0,
  };

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>
            Demandes disponibles
          </h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            {demandes?.length ?? 0} demande
            {(demandes?.length ?? 0) > 1 ? "s" : ""} correspondent à votre
            profil
          </p>
        </div>

        {/* Filtres avec compteurs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f.value
                  ? `${colors.secondary.gradient} text-white border-transparent`
                  : `bg-white ${colors.text.secondary} ${colors.border.light} hover:border-gray-300`
              }`}
            >
              {f.label}
              {f.value !== "TOUTES" && counts[f.value] > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === f.value ? "bg-white/20" : "bg-gray-100"}`}
                >
                  {counts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : error ? (
          <div
            className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Profil incomplet
            </h3>
            <p className={`text-sm ${colors.text.secondary} mb-6`}>
              Complétez votre profil pour voir les demandes disponibles
            </p>
            <Link href={routes.prestataire.profile.view}>
              <Button variant="secondary">Compléter mon profil →</Button>
            </Link>
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div
            className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}
          >
            <div className="text-5xl mb-4">🔍</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Aucune demande pour le moment
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              {filter !== "TOUTES"
                ? "Essayez un autre filtre"
                : "De nouvelles demandes apparaîtront ici dès qu'un client poste une demande correspondant à vos compétences"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((demande) => (
              <CardDemande key={demande.id} demande={demande} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMesPrestations } from "@/hooks/usePrestation";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import type { Prestation } from "@/services/prestation.service";

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  EN_COURS: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700",
    icon: "⚡",
  },
  EN_ATTENTE: {
    label: "En attente",
    color: "bg-yellow-100 text-yellow-700",
    icon: "⏳",
  }, // ← ajouter

  A_VALIDER: {
    label: "À valider",
    color: "bg-purple-100 text-purple-700",
    icon: "⏳",
  },
  TERMINEE: {
    label: "Terminée",
    color: "bg-green-100 text-green-700",
    icon: "✅",
  },
  ANNULEE: { label: "Annulée", color: "bg-red-100 text-red-600", icon: "❌" },
};

const typeConfig: Record<string, string> = {
  MODIFICATION: "🔧 Modification",
  CREATION: "✨ Création",
  FORMATION: "🎓 Formation",
};

// ─── Carte prestation ─────────────────────────────────────────────────────────

function CardPrestation({ prestation }: { prestation: Prestation }) {
  const status = statusConfig[prestation.status] || statusConfig.EN_COURS;
  const montant = prestation.montantFinal || prestation.montant;

  return (
    <Link href={`/prestataire/services/${prestation.id}`}>
      <div
        className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}
              >
                {(() => {
                  const displayStatus =
                    prestation.demande.typePrestation === "MODIFICATION" &&
                    prestation.status === "EN_COURS" &&
                    !prestation.etatDesLieux
                      ? statusConfig["EN_ATTENTE"]
                      : status;
                  return (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${displayStatus.color}`}
                    >
                      {displayStatus.icon} {displayStatus.label}
                    </span>
                  );
                })()}
              </span>
              <span className={`text-xs ${colors.text.muted}`}>
                {typeConfig[prestation.demande.typePrestation]}
              </span>
            </div>
            <h3
              className={`font-bold ${colors.text.primary} text-base leading-tight`}
            >
              {prestation.demande.titre}
            </h3>
          </div>
          {prestation.demande.photos &&
            prestation.demande.photos.length > 0 && (
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={prestation.demande.photos[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
        </div>

        {/* Catégorie */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
          >
            {prestation.demande.category.icon} {prestation.demande.category.nom}
          </span>
          {prestation.demande.subCategory && (
            <span
              className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
            >
              › {prestation.demande.subCategory.nom}
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="flex flex-wrap gap-4 mb-3">
          <span className={`text-sm font-bold ${colors.secondary.text}`}>
            💶 {montant} €
          </span>
          {prestation.demande.ville && (
            <span className={`text-xs ${colors.text.secondary}`}>
              📍 {prestation.demande.ville}
            </span>
          )}
          {prestation.demande.client?.user && (
            <span className={`text-xs ${colors.text.secondary}`}>
              👤 {prestation.demande.client.user.firstName}
            </span>
          )}
        </div>

        {/* État des lieux */}
        {prestation.demande.typePrestation === "MODIFICATION" && (
          <div
            className={`text-xs px-3 py-1.5 rounded-lg ${
              !prestation.etatDesLieux
                ? "bg-orange-50 text-orange-700"
                : prestation.etatDesLieux.status === "EN_ATTENTE"
                  ? "bg-yellow-50 text-yellow-700"
                  : prestation.etatDesLieux.status === "VALIDE"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
            }`}
          >
            {!prestation.etatDesLieux
              ? "⚠️ État des lieux à créer"
              : prestation.etatDesLieux.status === "EN_ATTENTE"
                ? "⏳ État des lieux en attente de validation"
                : prestation.etatDesLieux.status === "VALIDE"
                  ? "✅ État des lieux validé"
                  : "❌ État des lieux refusé"}
          </div>
        )}

        {/* A_VALIDER */}
        {prestation.status === "A_VALIDER" && prestation.autoValidateAt && (
          <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
            ⏱️ Auto-validation le{" "}
            {new Date(prestation.autoValidateAt).toLocaleDateString("fr-FR")}
          </div>
        )}

        {/* Avis */}
        {prestation.status === "TERMINEE" && prestation.review && (
          <div className="mt-2 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
            ⭐ {prestation.review.rating}/5 —{" "}
            {prestation.review.comment || "Aucun commentaire"}
          </div>
        )}

        <div
          className={`mt-3 pt-3 border-t ${colors.border.light} text-xs ${colors.text.muted}`}
        >
          Débutée le{" "}
          {new Date(prestation.createdAt).toLocaleDateString("fr-FR")}
          {prestation.completedAt &&
            ` · Terminée le ${new Date(prestation.completedAt).toLocaleDateString("fr-FR")}`}
        </div>
      </div>
    </Link>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PrestatairePrestationsPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<string>("TOUTES");
  const { data: prestations, isLoading } = useMesPrestations();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  const filters = [
    { value: "TOUTES", label: "Toutes" },
    { value: "EN_ATTENTE", label: "⏳ En attente" }, // ← ajouter

    { value: "EN_COURS", label: "⚡ En cours" },
    { value: "A_VALIDER", label: "⏳ À valider" },
    { value: "TERMINEE", label: "✅ Terminées" },
    { value: "ANNULEE", label: "❌ Annulées" },
  ];

  const filtered = prestations?.filter((p) =>
    filter === "TOUTES" ? true : p.status === filter,
  );

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8`}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>
            Mes prestations
          </h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            {prestations?.length ?? 0} prestation
            {(prestations?.length ?? 0) > 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtres */}
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
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div
            className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}
          >
            <div className="text-5xl mb-4">🛠️</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              {filter === "TOUTES"
                ? "Aucune prestation pour le moment"
                : "Aucune prestation dans cette catégorie"}
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Consultez les demandes disponibles et envoyez des devis pour
              démarrer
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((p) => (
              <CardPrestation key={p.id} prestation={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

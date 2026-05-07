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
  { label: string; color: string; icon: string; tooltip: string }
> = {
  EN_ATTENTE_INSPECTION: {
    label: "En attente d'inspection",
    color: "bg-orange-100 text-orange-700",
    icon: "🔍",
    tooltip:
      "L'objet du client est déposé au point de dépôt. Inspectez-le et créez l'état des lieux.",
  },
  EN_ATTENTE_PAIEMENT: {
    label: "En attente de paiement",
    color: "bg-yellow-100 text-yellow-700",
    icon: "💳",
    tooltip:
      "L'état des lieux a été validé par le client. En attente de son paiement pour démarrer.",
  },
  EN_COURS: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700",
    icon: "⚡",
    tooltip:
      "La prestation est en cours. Marquez-la comme terminée quand le travail est achevé.",
  },
  A_VALIDER: {
    label: "À valider",
    color: "bg-purple-100 text-purple-700",
    icon: "⏳",
    tooltip:
      "Vous avez marqué la prestation terminée. Le client a 3 jours pour valider. Auto-validation sinon.",
  },
  TERMINEE: {
    label: "Terminée",
    color: "bg-green-100 text-green-700",
    icon: "✅",
    tooltip:
      "Prestation terminée et validée. Votre paiement (moins 15% de commission Tasky) sera versé.",
  },
  ANNULEE: {
    label: "Annulée",
    color: "bg-red-100 text-red-600",
    icon: "❌",
    tooltip: "Cette prestation a été annulée.",
  },
};

const typeConfig: Record<string, string> = {
  MODIFICATION: "🔧 Modification",
  CREATION: "✨ Création",
  FORMATION: "🎓 Formation",
};

// ─── Badge statut avec infobulle ──────────────────────────────────────────────

function StatusBadge({
  color,
  icon,
  label,
  tooltip,
}: {
  color: string;
  icon: string;
  label: string;
  tooltip: string;
}) {
  return (
    <span className="relative group inline-flex items-center gap-1">
      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${color}`}>
        {icon} {label}
      </span>
      <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
      <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-30 w-56 bg-gray-800 text-white text-xs p-2.5 rounded-xl shadow-xl leading-relaxed pointer-events-none">
        {tooltip}
        <span className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
      </span>
    </span>
  );
}

// Statut d'affichage contextuel (distingue inspection soumise vs pas encore faite)
function getDisplayStatus(prestation: Prestation) {
  if (
    prestation.status === "EN_ATTENTE_INSPECTION" &&
    prestation.etatDesLieux
  ) {
    return {
      label: "État soumis — attente client",
      color: "bg-yellow-100 text-yellow-700",
      icon: "⏳",
      tooltip: "Vous avez soumis l'état des lieux. En attente de la validation du client.",
    };
  }
  return statusConfig[prestation.status] ?? statusConfig.EN_COURS;
}

// ─── Carte prestation ─────────────────────────────────────────────────────────

function CardPrestation({ prestation }: { prestation: Prestation }) {
  const displayStatus = getDisplayStatus(prestation);
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
              <StatusBadge
                color={displayStatus.color}
                icon={displayStatus.icon}
                label={displayStatus.label}
                tooltip={displayStatus.tooltip ?? ""}
              />
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
          {prestation.demande.photos && prestation.demande.photos.length > 0 && (
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

        {/* Bandeau état des lieux (MODIFICATION, hors ANNULEE/TERMINEE) */}
        {prestation.demande.typePrestation === "MODIFICATION" &&
          !["ANNULEE", "TERMINEE"].includes(prestation.status) && (() => {
            const edl = prestation.etatDesLieux;
            const enInspection = prestation.status === "EN_ATTENTE_INSPECTION";

            let bg = "bg-green-50 text-green-700";
            let msg = "✅ Inspection effectuée";

            if (enInspection && !edl) {
              bg = "bg-orange-50 text-orange-700";
              msg = "🔍 Inspecter l'objet";
            } else if (enInspection && edl?.status === "EN_ATTENTE") {
              bg = "bg-yellow-50 text-yellow-700";
              msg = "⏳ En attente de validation client";
            } else if (edl?.status === "REFUSE") {
              bg = "bg-red-50 text-red-600";
              msg = "❌ État des lieux refusé";
            }

            return (
              <div className={`text-xs px-3 py-1.5 rounded-lg ${bg}`}>
                {msg}
              </div>
            );
          })()}

        {/* Auto-validation */}
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

type FilterValue =
  | "TOUTES"
  | "EN_ATTENTE_INSPECTION"
  | "EN_ATTENTE_PAIEMENT"
  | "EN_COURS"
  | "A_VALIDER"
  | "TERMINEE"
  | "ANNULEE";

const filters: { value: FilterValue; label: string; tooltip: string }[] = [
  { value: "TOUTES", label: "Toutes", tooltip: "Afficher toutes mes prestations" },
  { value: "EN_ATTENTE_INSPECTION", label: "🔍 Inspection", tooltip: "Objet déposé à inspecter — créer l'état des lieux" },
  { value: "EN_ATTENTE_PAIEMENT", label: "💳 Paiement", tooltip: "État des lieux validé — en attente du paiement client" },
  { value: "EN_COURS", label: "⚡ En cours", tooltip: "Prestation en cours de réalisation" },
  { value: "A_VALIDER", label: "⏳ À valider", tooltip: "En attente de validation client" },
  { value: "TERMINEE", label: "✅ Terminées", tooltip: "Prestations terminées et validées" },
  { value: "ANNULEE", label: "❌ Annulées", tooltip: "Prestations annulées (inspection refusée ou autre)" },
];

export default function PrestatairePrestationsPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("TOUTES");
  const { data: prestations, isLoading } = useMesPrestations();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

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
            <span key={f.value} className="relative group">
              <button
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  filter === f.value
                    ? `${colors.secondary.gradient} text-white border-transparent`
                    : `bg-white ${colors.text.secondary} ${colors.border.light} hover:border-gray-300`
                }`}
              >
                {f.label}
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-44 bg-gray-800 text-white text-xs p-2 rounded-xl shadow-xl text-center pointer-events-none">
                {f.tooltip}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </span>
            </span>
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

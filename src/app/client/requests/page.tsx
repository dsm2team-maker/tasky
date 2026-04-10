"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyDemandes, useDeleteDemande } from "@/hooks/useDemande";
import { Button } from "@/components/ui/Button";
import HeaderClient from "@/components/headers/HeaderClient";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { Demande } from "@/services/demande.service";

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const statusLabel: Record<string, { label: string; color: string }> = {
  PUBLIEE: { label: "Publiée", color: "bg-blue-100 text-blue-700" },
  EN_ATTENTE: { label: "En attente", color: "bg-yellow-100 text-yellow-700" },
  EN_COURS: { label: "En cours", color: "bg-green-100 text-green-700" },
  A_VALIDER: { label: "À valider", color: "bg-purple-100 text-purple-700" },
  TERMINEE: { label: "Terminée", color: "bg-gray-100 text-gray-600" },
  ANNULEE: { label: "Annulée", color: "bg-red-100 text-red-600" },
};

const urgenceLabel: Record<string, { label: string; icon: string }> = {
  NORMAL: { label: "Normal", icon: "🟢" },
  URGENT: { label: "Urgent", icon: "🟡" },
  TRES_URGENT: { label: "Très urgent", icon: "🔴" },
};

const typeLabel: Record<string, string> = {
  MODIFICATION: "🔧 Modification",
  CREATION: "✨ Création",
  FORMATION: "🎓 Formation",
};

// ─── Carte demande ────────────────────────────────────────────────────────────

function CardDemande({
  demande,
  onDelete,
}: {
  demande: Demande;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = statusLabel[demande.status] || {
    label: demande.status,
    color: "bg-gray-100 text-gray-600",
  };
  const urgence = urgenceLabel[demande.urgence] || {
    label: demande.urgence,
    icon: "🟢",
  };

  return (
    <div
      className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}
            >
              {status.label}
            </span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors.background.gray} ${colors.text.secondary}`}
            >
              {urgence.icon} {urgence.label}
            </span>
            <span className={`text-xs ${colors.text.muted}`}>
              {typeLabel[demande.typePrestation]}
            </span>
          </div>
          <h3
            className={`font-bold ${colors.text.primary} text-base leading-tight truncate`}
          >
            {demande.titre}
          </h3>
          <p className={`text-sm ${colors.text.secondary} mt-1 line-clamp-2`}>
            {demande.description}
          </p>
        </div>
        {demande.photos && demande.photos.length > 0 && (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={demande.photos[0]}
              alt="Photo"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div
          className={`flex items-center gap-1.5 text-xs ${colors.text.secondary}`}
        >
          <span>{demande.category.icon}</span>
          <span>{demande.category.nom}</span>
        </div>
        {demande.subCategory && (
          <div
            className={`flex items-center gap-1.5 text-xs ${colors.text.secondary}`}
          >
            <span>›</span>
            <span>{demande.subCategory.nom}</span>
          </div>
        )}
        {demande.interventionIds && demande.interventionIds.length > 0 && (
          <div
            className={`flex items-center gap-1.5 text-xs ${colors.text.secondary}`}
          >
            <span>›</span>
            <span>{demande.interventionIds.length} intervention(s)</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
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
        {demande._count && (
          <span
            className={`text-xs font-semibold ${demande._count.devis > 0 ? colors.success.text : colors.text.muted}`}
          >
            💬 {demande._count.devis} devis
          </span>
        )}
      </div>

      <div className={`text-xs ${colors.text.muted} mb-4`}>
        Publiée le {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={routes.client.requests.detail(demande.id)}
          className="flex-1"
        >
          <Button variant="outline" size="sm" fullWidth>
            Voir les devis
          </Button>
        </Link>
        {["PUBLIEE", "EN_ATTENTE"].includes(demande.status) && (
          <>
            {confirmDelete ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => onDelete(demande.id)}
                >
                  Confirmer
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className={colors.error.text}
              >
                🗑️
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ClientRequestsPage() {
  useAuthGuard();
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: demandes, isLoading } = useMyDemandes();
  const deleteDemande = useDeleteDemande();
  const [filter, setFilter] = useState<string>("TOUTES");
  useEffect(() => setIsHydrated(true), []);
  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
        />
      </div>
    );

  const handleDelete = (id: string) => {
    deleteDemande.mutate(id);
  };

  const filters = [
    { value: "TOUTES", label: "Toutes" },
    { value: "PUBLIEE", label: "Publiées" },
    { value: "EN_COURS", label: "En cours" },
    { value: "TERMINEE", label: "Terminées" },
  ];

  const filteredDemandes = demandes?.filter((d) =>
    filter === "TOUTES" ? true : d.status === filter,
  );

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${colors.text.primary}`}>
              Mes demandes
            </h1>
            <p className={`text-sm ${colors.text.secondary} mt-1`}>
              {demandes?.length ?? 0} demande
              {(demandes?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <Link href={routes.client.requests.new}>
            <Button variant="primary">+ Nouvelle demande</Button>
          </Link>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter === f.value
                  ? `${colors.primary.gradient} text-white border-transparent`
                  : `bg-white ${colors.text.secondary} ${colors.border.light} hover:border-gray-300`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
            />
          </div>
        ) : !filteredDemandes || filteredDemandes.length === 0 ? (
          <div
            className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light} shadow-sm`}
          >
            <div className="text-5xl mb-4">📋</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              {filter === "TOUTES"
                ? "Aucune demande pour le moment"
                : "Aucune demande dans cette catégorie"}
            </h3>
            <p className={`text-sm ${colors.text.secondary} mb-6`}>
              Créez votre première demande et recevez des propositions de
              prestataires
            </p>
            <Link href={routes.client.requests.new}>
              <Button variant="primary">+ Créer une demande</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDemandes.map((demande) => (
              <CardDemande
                key={demande.id}
                demande={demande}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

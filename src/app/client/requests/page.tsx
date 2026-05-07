"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMyDemandes, useDeleteDemande } from "@/hooks/useDemande";
import { useMesPrestationsClient } from "@/hooks/usePrestation";
import type { Prestation } from "@/services/prestation.service";
import { Button } from "@/components/ui/Button";
import HeaderClient from "@/components/headers/HeaderClient";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { Demande } from "@/services/demande.service";

// ─── Config statuts ───────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string; tooltip: string }
> = {
  PUBLIEE: {
    label: "Publiée",
    color: "bg-blue-100 text-blue-700",
    icon: "📢",
    tooltip:
      "Votre demande est visible par les artisans. En attente de devis.",
  },
  EN_ATTENTE_INSPECTION: {
    label: "Inspection",
    color: "bg-orange-100 text-orange-700",
    icon: "🔍",
    tooltip:
      "Un artisan a été sélectionné. Remettez votre objet à son point de dépôt pour qu'il puisse l'inspecter.",
  },
  EN_ATTENTE_PAIEMENT: {
    label: "En attente de paiement",
    color: "bg-yellow-100 text-yellow-700",
    icon: "💳",
    tooltip:
      "L'inspection est validée. En attente de votre paiement pour démarrer la prestation.",
  },
  EN_COURS: {
    label: "En cours",
    color: "bg-green-100 text-green-700",
    icon: "⚡",
    tooltip: "Votre prestation est en cours de réalisation par l'artisan.",
  },
  A_VALIDER: {
    label: "À valider",
    color: "bg-purple-100 text-purple-700",
    icon: "⏳",
    tooltip:
      "L'artisan a terminé. Vous avez 3 jours pour valider ou contester. Sans action, la validation est automatique.",
  },
  TERMINEE: {
    label: "Terminée",
    color: "bg-gray-100 text-gray-600",
    icon: "✅",
    tooltip: "Prestation terminée et validée. Merci pour votre confiance !",
  },
  ANNULEE: {
    label: "Annulée",
    color: "bg-red-100 text-red-600",
    icon: "❌",
    tooltip: "Cette prestation a été annulée.",
  },
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

// ─── Badge statut avec infobulle ──────────────────────────────────────────────

function StatusBadge({ statusKey }: { statusKey: string }) {
  const cfg = statusConfig[statusKey] ?? {
    label: statusKey,
    color: "bg-gray-100 text-gray-600",
    icon: "•",
    tooltip: "",
  };

  return (
    <span className="relative group inline-flex items-center gap-1">
      <span
        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cfg.color}`}
      >
        {cfg.icon} {cfg.label}
      </span>
      {cfg.tooltip && (
        <>
          <span className="text-gray-400 cursor-help text-xs">ⓘ</span>
          <span className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-30 w-56 bg-gray-800 text-white text-xs p-2.5 rounded-xl shadow-xl leading-relaxed pointer-events-none">
            {cfg.tooltip}
            <span className="absolute top-full left-4 border-4 border-transparent border-t-gray-800" />
          </span>
        </>
      )}
    </span>
  );
}

// ─── Carte demande ────────────────────────────────────────────────────────────

const STATUSES_SUPPRIMABLES = ["PUBLIEE"];

function CardDemande({
  demande,
  prestation,
  onDelete,
}: {
  demande: Demande;
  prestation?: Prestation;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const urgence = urgenceLabel[demande.urgence] ?? { label: demande.urgence, icon: "🟢" };
  const nbDevis = demande._count?.devis ?? 0;
  const canDelete = STATUSES_SUPPRIMABLES.includes(demande.status);

  // Badge révision de montant : état des lieux EN_ATTENTE avec montantRevise
  const montantRevise =
    prestation?.etatDesLieux?.status === "EN_ATTENTE" &&
    prestation.etatDesLieux.montantRevise
      ? prestation.etatDesLieux.montantRevise
      : null;

  return (
    <div
      className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge statusKey={demande.status} />
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

      {/* Catégorie */}
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

      {/* Infos */}
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
        {nbDevis > 0 ? (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors.primary.light} ${colors.primary.text} border border-pink-200`}
          >
            💬 {nbDevis} devis reçu{nbDevis > 1 ? "s" : ""} ✨
          </span>
        ) : (
          <span className={`text-xs ${colors.text.muted}`}>💬 Aucun devis</span>
        )}
        {montantRevise && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
            💰 Nouveau montant proposé : {montantRevise} €
          </span>
        )}
      </div>

      <div className={`text-xs ${colors.text.muted} mb-4`}>
        Publiée le {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href={routes.client.requests.detail(demande.id)} className="flex-1">
          <Button
            variant={nbDevis > 0 ? "primary" : "outline"}
            size="sm"
            fullWidth
          >
            Voir le détail →
          </Button>
        </Link>
        {canDelete && (
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

type FilterValue =
  | "TOUTES"
  | "PUBLIEE"
  | "EN_ATTENTE_INSPECTION"
  | "EN_ATTENTE_PAIEMENT"
  | "EN_COURS"
  | "A_VALIDER"
  | "TERMINEE"
  | "ANNULEE";

const filters: { value: FilterValue; label: string; tooltip: string }[] = [
  { value: "TOUTES", label: "Toutes", tooltip: "Afficher toutes mes demandes" },
  {
    value: "PUBLIEE",
    label: "📢 Publiées",
    tooltip: "Demandes en attente de devis",
  },
  {
    value: "EN_ATTENTE_INSPECTION",
    label: "🔍 Inspection",
    tooltip: "Artisan sélectionné — remettez votre objet à son point de dépôt pour inspection",
  },
  {
    value: "EN_ATTENTE_PAIEMENT",
    label: "💳 Paiement",
    tooltip: "Inspection validée — en attente de votre paiement",
  },
  {
    value: "EN_COURS",
    label: "⚡ En cours",
    tooltip: "Prestation en cours de réalisation",
  },
  {
    value: "A_VALIDER",
    label: "⏳ À valider",
    tooltip: "Prestation terminée — en attente de votre validation",
  },
  {
    value: "TERMINEE",
    label: "✅ Terminées",
    tooltip: "Prestations terminées et validées",
  },
  {
    value: "ANNULEE",
    label: "❌ Annulées",
    tooltip: "Demandes annulées (inspection refusée ou autre)",
  },
];

export default function ClientRequestsPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: demandes, isLoading } = useMyDemandes();
  const { data: prestations } = useMesPrestationsClient();
  const deleteDemande = useDeleteDemande();
  const [filter, setFilter] = useState<FilterValue>("TOUTES");

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
        />
      </div>
    );

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

        {/* Filtres avec infobulles */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <span key={f.value} className="relative group">
              <button
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  filter === f.value
                    ? `${colors.primary.gradient} text-white border-transparent`
                    : `bg-white ${colors.text.secondary} ${colors.border.light} hover:border-gray-300`
                }`}
              >
                {f.label}
              </button>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 w-48 bg-gray-800 text-white text-xs p-2 rounded-xl shadow-xl text-center pointer-events-none whitespace-normal">
                {f.tooltip}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
              </span>
            </span>
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
              Créez votre première demande et recevez des propositions
              d'artisans
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
                prestation={prestations?.find((p) => p.demandeId === demande.id)}
                onDelete={(id) => deleteDemande.mutate(id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

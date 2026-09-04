"use client";

import React, { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMesDevis, useDismisserDevis } from "@/hooks/useDevis";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { Pagination } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import type { DevisHistorique } from "@/services/devis.service";

const PAGE_SIZE = 8;

// ─── Statuts ──────────────────────────────────────────────────────────────────

type FilterValue = "TOUTES" | "ENVOYE" | "ACCEPTE" | "REFUSE" | "EXPIRE";

const statusConfig: Record<
  DevisHistorique["status"],
  { label: string; color: string; icon: string }
> = {
  ENVOYE:  { label: "En attente",  color: "bg-blue-50 text-blue-700",     icon: "⏳" },
  ACCEPTE: { label: "Accepté",     color: "bg-emerald-50 text-emerald-700", icon: "✅" },
  REFUSE:  { label: "Refusé",      color: "bg-red-50 text-red-600",       icon: "❌" },
  EXPIRE:  { label: "Expiré",      color: "bg-gray-100 text-gray-500",    icon: "⌛" },
};

const filters: { value: FilterValue; label: string }[] = [
  { value: "TOUTES", label: "Tous" },
  { value: "ENVOYE", label: "⏳ En attente" },
  { value: "ACCEPTE", label: "✅ Acceptés" },
  { value: "REFUSE", label: "❌ Refusés" },
  { value: "EXPIRE", label: "⌛ Expirés" },
];

// ─── Carte devis ──────────────────────────────────────────────────────────────

function CardDevis({
  devis,
  onDelete,
  deleting,
}: {
  devis: DevisHistorique;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const s = statusConfig[devis.status];
  const suppressible = devis.status === "REFUSE" || devis.status === "EXPIRE";
  const ref = devis.demande.reference
    ? `TSK-${String(devis.demande.reference).padStart(6, "0")}`
    : "";

  return (
    <div
      className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-5 flex items-center gap-4`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${s.color}`}>
            {s.icon} {s.label}
          </span>
          {ref && (
            <span className="text-[11px] font-mono font-semibold text-gray-400">{ref}</span>
          )}
        </div>
        <h3 className={`font-bold ${colors.text.primary} text-base leading-tight truncate`}>
          {devis.demande.titre}
        </h3>
        <div className="flex flex-wrap gap-4 mt-2">
          <span className={`text-sm font-bold ${colors.secondary.text}`}>💶 {devis.montant} €</span>
          <span className={`text-xs ${colors.text.secondary}`}>
            👤 {devis.demande.client.user.firstName} {devis.demande.client.user.lastName}
          </span>
          <span className={`text-xs ${colors.text.muted}`}>
            📅 {new Date(devis.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>
      </div>

      {suppressible && (
        <button
          onClick={() => onDelete(devis.id)}
          disabled={deleting}
          className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Supprimer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PrestataireDevisPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("TOUTES");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: devis, isLoading } = useMesDevis();
  const dismisser = useDismisserDevis();

  useEffect(() => setIsHydrated(true), []);
  useEffect(() => setPage(1), [filter]);

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  const filtered = devis?.filter((d) => (filter === "TOUTES" ? true : d.status === filter));
  const totalPages = Math.max(1, Math.ceil((filtered?.length ?? 0) / PAGE_SIZE));
  const paginated = filtered?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts: Record<FilterValue, number> = {
    TOUTES: devis?.length ?? 0,
    ENVOYE: 0,
    ACCEPTE: 0,
    REFUSE: 0,
    EXPIRE: 0,
  };
  devis?.forEach((d) => {
    counts[d.status]++;
  });

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8`}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Mes devis</h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            {devis?.length ?? 0} devis
          </p>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border inline-flex items-center gap-1.5 ${
                filter === f.value
                  ? `${colors.secondary.gradient} text-white border-transparent`
                  : `bg-white ${colors.text.secondary} ${colors.border.light} hover:border-gray-300`
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] font-bold min-w-[18px] px-1.5 py-0.5 rounded-full text-center ${
                  filter === f.value ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                }`}
              >
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
          </div>
        ) : !filtered || filtered.length === 0 ? (
          <div className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}>
            <div className="text-5xl mb-4">📋</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              {filter === "TOUTES" ? "Aucun devis pour le moment" : "Aucun devis dans cette catégorie"}
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Envoyez des devis depuis les demandes disponibles pour les retrouver ici.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginated?.map((d) => (
                <CardDevis
                  key={d.id}
                  devis={d}
                  onDelete={(id) => setDeleteId(id)}
                  deleting={dismisser.isPending && deleteId === d.id}
                />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              activeClassName={`${colors.secondary.gradient} text-white`}
            />
          </>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Supprimer ce devis ?"
        message="Cette action est irréversible. Le devis sera définitivement supprimé de votre historique."
        isLoading={dismisser.isPending}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) return;
          dismisser.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
      />
    </div>
  );
}

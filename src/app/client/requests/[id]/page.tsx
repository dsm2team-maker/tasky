"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  useDevisDemande,
  useAccepterDevis,
  useRefuserDevis,
} from "@/hooks/useDevis";
import HeaderClient from "@/components/headers/HeaderClient";
import { Button } from "@/components/ui/Button";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { Devis } from "@/services/devis.service";

// ─── Carte devis ──────────────────────────────────────────────────────────────

function CardDevis({
  devis,
  onAccept,
  onRefuse,
  isAccepting,
  isRefusing,
  demandeStatus,
}: {
  devis: Devis;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  isAccepting: boolean;
  isRefusing: boolean;
  demandeStatus: string;
}) {
  const [confirmAccept, setConfirmAccept] = useState(false);

  const statusConfig: Record<string, { label: string; color: string }> = {
    ENVOYE: { label: "En attente", color: "bg-blue-100 text-blue-700" },
    ACCEPTE: { label: "✅ Accepté", color: "bg-green-100 text-green-700" },
    REFUSE: { label: "Refusé", color: "bg-gray-100 text-gray-500" },
    EXPIRE: { label: "Expiré", color: "bg-red-100 text-red-600" },
  };

  const status = statusConfig[devis.status] || statusConfig.ENVOYE;
  const canAct = devis.status === "ENVOYE" && demandeStatus === "PUBLIEE";

  return (
    <div
      className={`bg-white rounded-2xl border ${
        devis.status === "ACCEPTE"
          ? "border-green-300"
          : devis.status === "REFUSE"
            ? `${colors.border.light} opacity-60`
            : colors.border.light
      } shadow-sm p-6`}
    >
      {/* Header prestataire */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {devis.prestataire.user.avatar ? (
              <img
                src={devis.prestataire.user.avatar}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                👤
              </div>
            )}
          </div>
          <div>
            <div className={`font-bold ${colors.text.primary}`}>
              {devis.prestataire.user.firstName}{" "}
              {devis.prestataire.user.lastName}
            </div>
            <div className="flex items-center gap-2">
              {devis.prestataire.rating > 0 && (
                <span className={`text-xs ${colors.text.secondary}`}>
                  ⭐ {devis.prestataire.rating.toFixed(1)} (
                  {devis.prestataire.reviewCount} avis)
                </span>
              )}
              {devis.prestataire.user.city && (
                <span className={`text-xs ${colors.text.muted}`}>
                  📍 {devis.prestataire.user.city}
                </span>
              )}
            </div>
          </div>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      {/* Offre */}
      <div
        className={`grid grid-cols-2 gap-4 p-4 rounded-xl ${colors.background.gray} mb-4`}
      >
        <div>
          <div className={`text-xs ${colors.text.muted} mb-0.5`}>
            Montant proposé
          </div>
          <div className={`text-xl font-bold ${colors.text.primary}`}>
            {devis.montant} €
          </div>
        </div>
        <div>
          <div className={`text-xs ${colors.text.muted} mb-0.5`}>
            Délai estimé
          </div>
          <div className={`text-xl font-bold ${colors.text.primary}`}>
            {devis.delai} jour{devis.delai > 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className={`text-sm ${colors.text.secondary} mb-4 leading-relaxed`}>
        {devis.description}
      </p>

      {/* Expiration */}
      <p className={`text-xs ${colors.text.muted} mb-4`}>
        Valable jusqu'au {new Date(devis.expiresAt).toLocaleDateString("fr-FR")}
      </p>

      {/* Actions */}
      {canAct && (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => onRefuse(devis.id)}
            isLoading={isRefusing}
            className={colors.error.text}
          >
            Refuser
          </Button>
          {confirmAccept ? (
            <div className="flex gap-2 flex-1">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => setConfirmAccept(false)}
              >
                Annuler
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                isLoading={isAccepting}
                onClick={() => onAccept(devis.id)}
              >
                Confirmer ✅
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setConfirmAccept(true)}
            >
              Accepter ce devis
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ClientRequestDetailPage() {
  useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isHydrated, setIsHydrated] = useState(false);
  const { data, isLoading } = useDevisDemande(id);
  const accepterDevis = useAccepterDevis();
  const refuserDevis = useRefuserDevis();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
        />
      </div>
    );

  if (!data) return null;

  const { demande, devis } = data;

  const statusLabel: Record<string, string> = {
    PUBLIEE: "Publiée — en attente de devis",
    EN_ATTENTE: "En attente",
    EN_COURS: "En cours",
    A_VALIDER: "À valider",
    TERMINEE: "Terminée",
    ANNULEE: "Annulée",
  };

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8 max-w-3xl`}>
        {/* Retour */}
        <button
          onClick={() => router.push(routes.client.requests.list)}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Mes demandes
        </button>

        {/* Header demande */}
        <div
          className={`${colors.primary.gradient} rounded-2xl p-6 mb-6 text-white`}
        >
          <div className={`text-sm text-pink-100 mb-1`}>
            {statusLabel[demande.status] || demande.status}
          </div>
          <h1 className="text-xl font-bold mb-2">{demande.titre}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-pink-100">
            {demande.ville && <span>📍 {demande.ville}</span>}
            {demande.budget && <span>💶 {demande.budget} €</span>}
            {demande.dateEcheance && (
              <span>
                📅 {new Date(demande.dateEcheance).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div
          className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}
        >
          <h2 className={`${typography.h5.base} ${colors.text.primary} mb-3`}>
            Description
          </h2>
          <p className={`text-sm ${colors.text.secondary} leading-relaxed`}>
            {demande.description}
          </p>
        </div>

        {/* Devis */}
        <div>
          <h2 className={`text-lg font-bold ${colors.text.primary} mb-4`}>
            Devis reçus ({devis.length})
          </h2>

          {devis.length === 0 ? (
            <div
              className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}
            >
              <div className="text-5xl mb-4">⏳</div>
              <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
                En attente de devis
              </h3>
              <p className={`text-sm ${colors.text.secondary}`}>
                Les prestataires qualifiés vont bientôt vous envoyer leurs
                propositions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {devis.map((d) => (
                <CardDevis
                  key={d.id}
                  devis={d}
                  demandeStatus={demande.status}
                  isAccepting={accepterDevis.isPending}
                  isRefusing={refuserDevis.isPending}
                  onAccept={(devisId) =>
                    accepterDevis.mutate(devisId, {
                      onSuccess: () => router.push(routes.client.requests.list),
                    })
                  }
                  onRefuse={(devisId) => refuserDevis.mutate(devisId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import {
  usePrestationDetail,
  useCreerEtatDesLieux,
  useConfirmerConformite,
  useMarquerTermine,
} from "@/hooks/usePrestation";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import SectionChat from "@/components/chat/SectionChat";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";

const statusConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  EN_ATTENTE_INSPECTION: {
    label: "En attente d'inspection",
    color: "bg-orange-100 text-orange-700",
    icon: "🔍",
  },
  EN_ATTENTE_PAIEMENT: {
    label: "En attente de paiement",
    color: "bg-yellow-100 text-yellow-700",
    icon: "💳",
  },
  EN_COURS: {
    label: "En cours",
    color: "bg-blue-100 text-blue-700",
    icon: "⚡",
  },
  A_VALIDER: {
    label: "À valider par le client",
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

export default function PrestatairePrestationDetailPage() {
  useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isHydrated, setIsHydrated] = useState(false);
  const [showEtatForm, setShowEtatForm] = useState(false);
  const [etatDescription, setEtatDescription] = useState("");
  const [montantRevise, setMontantRevise] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmTermine, setConfirmTermine] = useState(false);
  const [modal, setModal] = useState<"etat" | "conforme" | "termine" | null>(null);

  const { data: prestation, isLoading } = usePrestationDetail(id);
  const creerEtatDesLieux = useCreerEtatDesLieux();
  const confirmerConformite = useConfirmerConformite();
  const marquerTermine = useMarquerTermine();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  if (!prestation) return null;

  const isModification = prestation.demande.typePrestation === "MODIFICATION";
  const montant = prestation.montantFinal || prestation.montant;

  // Pour EN_ATTENTE_INSPECTION : distinguer "pas encore inspecté" vs "état soumis, attente client"
  const getDisplayStatus = () => {
    if (
      prestation.status === "EN_ATTENTE_INSPECTION" &&
      prestation.etatDesLieux
    ) {
      return {
        label: "État des lieux soumis — attente client",
        color: "bg-yellow-100 text-yellow-700",
        icon: "⏳",
      };
    }
    return statusConfig[prestation.status] || statusConfig.EN_COURS;
  };

  const status = getDisplayStatus();

  const handleCreerEtat = () => {
    setError(null);
    if (etatDescription.trim().length < 10) {
      setError("Description trop courte (min 10 caractères)");
      return;
    }

    creerEtatDesLieux.mutate(
      {
        id,
        data: {
          description: etatDescription.trim(),
          montantRevise: montantRevise ? parseFloat(montantRevise) : undefined,
        },
      },
      {
        onSuccess: () => {
          setModal("etat");
          setShowEtatForm(false);
        },
        onError: (err: any) =>
          setError(err.response?.data?.message || "Erreur"),
      },
    );
  };

  const handleConfirmerConformite = () => {
    setError(null);
    confirmerConformite.mutate(id, {
      onSuccess: () => setModal("conforme"),
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  const handleMarquerTermine = () => {
    setError(null);
    marquerTermine.mutate(id, {
      onSuccess: () => setModal("termine"),
      onError: (err: any) => setError(err.response?.data?.message || "Erreur"),
    });
  };

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8 max-w-3xl`}>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Mes prestations
        </button>

        {/* Status + titre */}
        <div
          className={`${colors.secondary.gradient} rounded-2xl p-6 mb-6 text-white`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.color}`}
            >
              {status.icon} {status.label}
            </span>
            {prestation.demande.reference && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-white/60 uppercase tracking-wide leading-none mb-0.5">Référence</span>
                <span className="text-sm font-mono font-bold bg-white/20 px-2.5 py-1 rounded-lg text-white select-all">
                  TSK-{String(prestation.demande.reference).padStart(6, "0")}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold mb-1">{prestation.demande.titre}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-emerald-100">
            <span>💶 {montant} €</span>
            {prestation.demande.ville && (
              <span>📍 {prestation.demande.ville}</span>
            )}
          </div>
        </div>

        {/* Infos client */}
        <div
          className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}
        >
          <h2 className={`${typography.h5.base} ${colors.text.primary} mb-4`}>
            Client
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {prestation.demande.client?.user.avatar ? (
                <img
                  src={prestation.demande.client.user.avatar}
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
              <div className={`font-medium ${colors.text.primary}`}>
                {prestation.demande.client?.user.firstName}{" "}
                {prestation.demande.client?.user.lastName}
              </div>
              {prestation.demande.client?.user.city && (
                <div className={`text-xs ${colors.text.muted}`}>
                  📍 {prestation.demande.client.user.city}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description demande */}
        <div
          className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}
        >
          <h2 className={`${typography.h5.base} ${colors.text.primary} mb-3`}>
            Détail de la demande
          </h2>
          <p className={`text-sm ${colors.text.secondary} leading-relaxed mb-4`}>
            {prestation.demande.description}
          </p>
          {prestation.demande.photos && prestation.demande.photos.length > 0 && (
            <div className="flex gap-2">
              {prestation.demande.photos.map((url, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* État des lieux — MODIFICATION en EN_ATTENTE_INSPECTION */}
        {isModification && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}
          >
            <h2 className={`${typography.h5.base} ${colors.text.primary} mb-4`}>
              État des lieux
            </h2>

            {!prestation.etatDesLieux ? (
              prestation.status === "EN_ATTENTE_INSPECTION" ? (
                <>
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 mb-4 space-y-1">
                    <p className="text-sm text-orange-700">
                      🔍 Inspectez l'objet remis par le client.
                    </p>
                    <p className="text-sm text-orange-700">
                      S'il est conforme à la description, cliquez sur{" "}
                      <strong>"Objet conforme"</strong>.
                    </p>
                    <p className="text-sm text-orange-700">
                      S'il y a un écart (état, complexité…), créez un état des lieux détaillé.
                    </p>
                  </div>
                  {!showEtatForm ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="secondary"
                        fullWidth
                        isLoading={confirmerConformite.isPending}
                        onClick={handleConfirmerConformite}
                      >
                        ✅ Objet conforme — démarrer sans révision
                      </Button>
                      <Button
                        variant="outline"
                        fullWidth
                        onClick={() => setShowEtatForm(true)}
                      >
                        ⚠️ Créer un état des lieux détaillé
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium ${colors.text.primary} mb-1.5`}
                        >
                          Description de l'état de l'objet *
                        </label>
                        <textarea
                          value={etatDescription}
                          onChange={(e) => setEtatDescription(e.target.value)}
                          placeholder="Décrivez l'état de l'objet, les travaux à effectuer, les éventuels problèmes constatés..."
                          rows={4}
                          className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none`}
                        />
                      </div>
                      <Input
                        label="Nouveau montant (€) — optionnel si objet plus abîmé que prévu"
                        type="number"
                        min="0"
                        step="any"
                        placeholder={`Montant initial : ${prestation.montant} €`}
                        value={montantRevise}
                        onChange={(e) => setMontantRevise(e.target.value)}
                      />
                      {error && (
                        <p className={`text-sm ${colors.error.text}`}>{error}</p>
                      )}
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          fullWidth
                          onClick={() => setShowEtatForm(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="secondary"
                          fullWidth
                          isLoading={creerEtatDesLieux.isPending}
                          onClick={handleCreerEtat}
                        >
                          Soumettre l'état des lieux
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : null
            ) : (
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl ${
                    prestation.etatDesLieux.status === "EN_ATTENTE"
                      ? "bg-yellow-50 border border-yellow-200"
                      : prestation.etatDesLieux.status === "VALIDE"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                  }`}
                >
                  <p className="text-sm font-semibold mb-2">
                    {prestation.etatDesLieux.status === "EN_ATTENTE"
                      ? "⏳ En attente de validation client"
                      : prestation.etatDesLieux.status === "VALIDE"
                        ? "✅ Validé par le client"
                        : "❌ Refusé — demande republiée"}
                  </p>
                  <p className={`text-sm ${colors.text.secondary}`}>
                    {prestation.etatDesLieux.description}
                  </p>
                  {prestation.etatDesLieux.montantRevise && (
                    <p className="text-sm font-medium mt-2">
                      Montant révisé :{" "}
                      <strong>{prestation.etatDesLieux.montantRevise} €</strong>{" "}
                      <span className="text-gray-400 line-through">
                        (initial : {prestation.montant} €)
                      </span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EN_ATTENTE_PAIEMENT */}
        {prestation.status === "EN_ATTENTE_PAIEMENT" && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border border-yellow-200 shadow-sm mb-6`}
          >
            <div className="text-center py-4">
              <div className="text-4xl mb-3">💳</div>
              <h2 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
                En attente du paiement client
              </h2>
              <p className={`text-sm ${colors.text.secondary}`}>
                Le client doit confirmer le paiement avant que la prestation
                puisse démarrer.
              </p>
            </div>
          </div>
        )}

        {/* Action — Marquer terminé (EN_COURS uniquement) */}
        {prestation.status === "EN_COURS" && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
          >
            <h2 className={`${typography.h5.base} ${colors.text.primary} mb-3`}>
              Marquer comme terminé
            </h2>
            <p className={`text-sm ${colors.text.secondary} mb-4`}>
              Une fois marquée comme terminée, le client aura 3 jours pour
              valider. Sans réponse, la validation sera automatique.
            </p>
            {error && (
              <p className={`text-sm ${colors.error.text} mb-3`}>{error}</p>
            )}
            {confirmTermine ? (
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  disabled={marquerTermine.isPending || marquerTermine.isSuccess}
                  onClick={() => setConfirmTermine(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  isLoading={marquerTermine.isPending}
                  disabled={marquerTermine.isSuccess}
                  onClick={handleMarquerTermine}
                >
                  {marquerTermine.isSuccess ? "Terminé ✅" : "Confirmer ✅"}
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setConfirmTermine(true)}
              >
                Marquer comme terminé
              </Button>
            )}
          </div>
        )}

        {/* A_VALIDER */}
        {prestation.status === "A_VALIDER" && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border border-purple-200 shadow-sm`}
          >
            <div className="text-center py-4">
              <div className="text-4xl mb-3">⏳</div>
              <h2 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
                En attente de validation
              </h2>
              <p className={`text-sm ${colors.text.secondary}`}>
                Le client a jusqu'au{" "}
                <strong>
                  {prestation.autoValidateAt
                    ? new Date(prestation.autoValidateAt).toLocaleDateString(
                        "fr-FR",
                      )
                    : "—"}
                </strong>{" "}
                pour valider. Sans réponse, la validation sera automatique.
              </p>
            </div>
          </div>
        )}

        {/* Messagerie */}
        <SectionChat prestationId={id} />

        {/* Modals */}
        <Modal
          isOpen={modal === "etat"}
          onClose={() => setModal(null)}
          title="État des lieux soumis"
          icon="📋"
          headerVariant="secondary"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Votre état des lieux a été envoyé au client. Il doit maintenant l'examiner et l'accepter avant que la prestation puisse continuer.
            </p>
            <p className="text-sm text-gray-600">
              Vous serez notifié dès qu'il aura répondu.
            </p>
            <Button variant="secondary" fullWidth onClick={() => setModal(null)}>
              Compris
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={modal === "conforme"}
          onClose={() => setModal(null)}
          title="Objet confirmé conforme !"
          icon="✅"
          headerVariant="success"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Vous avez confirmé que l'objet est conforme à la description. La prestation peut démarrer dès que le client aura effectué le paiement.
            </p>
            <p className="text-sm text-gray-600">
              Le client va maintenant procéder au paiement pour débloquer la prestation.
            </p>
            <Button variant="secondary" fullWidth onClick={() => setModal(null)}>
              Compris
            </Button>
          </div>
        </Modal>

        <Modal
          isOpen={modal === "termine"}
          onClose={() => setModal(null)}
          title="Prestation marquée comme terminée"
          icon="🎉"
          headerVariant="success"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Le client a <strong>3 jours</strong> pour valider la prestation après lui avoir remis sa commande. Sans réponse de sa part, la validation sera automatique.
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm font-medium text-emerald-700">
                💬 N'oubliez pas d'envoyer un message au client pour convenir d'un RDV de remise de l'objet !
              </p>
            </div>
            <Button variant="secondary" fullWidth onClick={() => setModal(null)}>
              Envoyer un message
            </Button>
          </div>
        </Modal>

        {/* TERMINEE */}
        {prestation.status === "TERMINEE" && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border border-green-200 shadow-sm text-center`}
          >
            <div className="text-4xl mb-3">🎉</div>
            <h2 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Prestation terminée !
            </h2>
            <p className={`text-sm ${colors.text.secondary} mb-2`}>
              Montant : <strong>{montant} €</strong> → Vous recevrez{" "}
              <strong>{(montant * 0.85).toFixed(2)} €</strong> (après 15%
              commission Tasky)
            </p>
            {prestation.review && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <p className="text-sm font-semibold text-green-700 mb-1">
                  Avis client : {"⭐".repeat(prestation.review.rating)}
                </p>
                {prestation.review.comment && (
                  <p className={`text-sm ${colors.text.secondary}`}>
                    {prestation.review.comment}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

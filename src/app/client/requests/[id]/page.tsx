"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProfile } from "@/hooks/useProfile";
import {
  useDevisDemande,
  useAccepterDevis,
  useRefuserDevis,
} from "@/hooks/useDevis";
import {
  useMesPrestationsClient,
  useValiderEtatDesLieux,
  useValiderPrestation,
  useContesterPrestation,
  useCreerReview,
} from "@/hooks/usePrestation";
import HeaderClient from "@/components/headers/HeaderClient";
import { Modal } from "@/components/ui/Modal";
import SectionChat from "@/components/chat/SectionChat";
import { StripeCheckout } from "@/components/payment/StripeCheckout";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { Devis } from "@/services/devis.service";
import type { Prestation } from "@/services/prestation.service";

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
  const canAct =
    devis.status === "ENVOYE" &&
    demandeStatus === "PUBLIEE" &&
    devis.estSelectionnable;

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
      {devis.aVerifier && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-sm text-orange-700 font-medium">
          ⚠️ L'inspection a échoué — ce devis a été annulé. Vous pouvez choisir un autre prestataire.
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <a
            href={`/prestataires/${devis.prestataire.id}`}
            className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-pink-300 transition-all"
          >
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
          </a>
          <div>
            <a
              href={`/prestataires/${devis.prestataire.id}`}
              className={`font-bold ${colors.text.primary} hover:underline`}
            >
              {devis.prestataire.user.firstName}{" "}
              {devis.prestataire.user.lastName}
            </a>
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

      <p className={`text-sm ${colors.text.secondary} mb-4 leading-relaxed`}>
        {devis.description}
      </p>
      <p className={`text-xs ${colors.text.muted} mb-4`}>
        Valable jusqu'au {new Date(devis.expiresAt).toLocaleDateString("fr-FR")}
      </p>

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
                variant="primary"
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
              variant="primary"
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

// ─── Section État des lieux ───────────────────────────────────────────────────

function SectionEtatDesLieux({
  prestation,
  onValider,
}: {
  prestation: Prestation;
  onValider: (accepte: boolean) => void;
}) {
  const [confirmRefus, setConfirmRefus] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const validerEtat = useValiderEtatDesLieux();

  if (!prestation.etatDesLieux) return null;
  const etat = prestation.etatDesLieux;

  return (
    <div
      className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}
    >
      <h2 className={`${typography.h5.base} ${colors.text.primary} mb-4`}>
        📋 État des lieux
      </h2>

      <div
        className={`p-4 rounded-xl mb-4 ${
          etat.status === "EN_ATTENTE"
            ? "bg-yellow-50 border border-yellow-200"
            : etat.status === "VALIDE"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
        }`}
      >
        <p
          className={`text-sm font-semibold mb-2 ${
            etat.status === "EN_ATTENTE"
              ? "text-yellow-700"
              : etat.status === "VALIDE"
                ? "text-green-700"
                : "text-red-700"
          }`}
        >
          {etat.status === "EN_ATTENTE"
            ? "⏳ En attente de votre validation"
            : etat.status === "VALIDE"
              ? "✅ Accepté"
              : "❌ Refusé"}
        </p>
        <p className={`text-sm ${colors.text.secondary} leading-relaxed`}>
          {etat.description}
        </p>

        {etat.montantRevise && (
          <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-semibold text-orange-700">
              ⚠️ Le prestataire a révisé le montant
            </p>
            <p className="text-sm text-orange-600 mt-1">
              Nouveau montant : <strong>{etat.montantRevise} €</strong>
              <span className="text-gray-400 line-through ml-2">
                (initial : {prestation.montant} €)
              </span>
            </p>
          </div>
        )}

        {etat.photos && etat.photos.length > 0 && (
          <div className="flex gap-2 mt-3">
            {etat.photos.map((url, i) => (
              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      {etat.status === "EN_ATTENTE" && (
        <div>
          <p className={`text-sm ${colors.text.secondary} mb-4`}>
            {etat.montantRevise
              ? "Le prestataire a révisé le montant après inspection. Acceptez-vous le nouveau tarif ?"
              : "Le prestataire a inspecté votre objet. Confirmez-vous que tout est conforme ?"}
          </p>
          <div className="flex gap-3">
            {confirmRefus ? (
              <div className="flex gap-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => setConfirmRefus(false)}
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  className="bg-red-500 hover:bg-red-600 text-white"
                  isLoading={validerEtat.isPending}
                  onClick={() =>
                    validerEtat.mutate(
                      { id: prestation.id, accepte: false },
                      { onSuccess: () => onValider(false) },
                    )
                  }
                >
                  Confirmer le refus
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => setConfirmRefus(true)}
                className={colors.error.text}
              >
                ❌ Refuser — annuler la prestation
              </Button>
            )}
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
                  variant="primary"
                  size="sm"
                  fullWidth
                  isLoading={validerEtat.isPending}
                  onClick={() =>
                    validerEtat.mutate(
                      { id: prestation.id, accepte: true },
                      { onSuccess: () => onValider(true) },
                    )
                  }
                >
                  Confirmer ✅
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setConfirmAccept(true)}
              >
                ✅ Accepter
                {etat.montantRevise ? ` — ${etat.montantRevise} €` : ""}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Section Review ───────────────────────────────────────────────────────────

const ratingLabels = ["", "Très mauvais", "Mauvais", "Correct", "Bien", "Excellent"];

function SectionReview({ prestation }: { prestation: Prestation }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const creerReview = useCreerReview();

  if (prestation.status !== "TERMINEE") return null;

  if (prestation.review) {
    return (
      <div className={`bg-white rounded-2xl ${spacing.card} border border-green-200 shadow-sm mb-6`}>
        <h2 className={`${typography.h5.base} ${colors.text.primary} mb-3`}>⭐ Votre avis</h2>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={`text-xl ${s <= prestation.review!.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
          ))}
          <span className={`text-sm ${colors.text.secondary} ml-2`}>{prestation.review.rating}/5</span>
        </div>
        {prestation.review.comment && (
          <p className={`text-sm ${colors.text.secondary}`}>{prestation.review.comment}</p>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`bg-white rounded-2xl ${spacing.card} border border-green-200 shadow-sm mb-6 text-center`}>
        <div className="text-3xl mb-2">🙏</div>
        <p className={`font-semibold ${colors.text.primary}`}>Merci pour votre avis !</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}>
      <h2 className={`${typography.h5.base} ${colors.text.primary} mb-1`}>⭐ Laisser un avis</h2>
      <p className={`text-sm ${colors.text.secondary} mb-4`}>Comment s'est passée votre expérience ?</p>

      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`text-3xl transition-transform hover:scale-110 ${
              s <= (hover || rating) ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
        {(hover || rating) > 0 && (
          <span className={`text-sm ${colors.text.secondary} ml-2`}>
            {ratingLabels[hover || rating]}
          </span>
        )}
      </div>

      <textarea
        rows={3}
        placeholder="Décrivez votre expérience (optionnel)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none mb-4`}
      />

      <Button
        variant="primary"
        fullWidth
        disabled={rating === 0}
        isLoading={creerReview.isPending}
        onClick={() =>
          creerReview.mutate(
            { id: prestation.id, data: { rating, comment: comment || undefined } },
            { onSuccess: () => setSubmitted(true) },
          )
        }
      >
        Envoyer mon avis
      </Button>
    </div>
  );
}

// ─── Section Paiement ────────────────────────────────────────────────────────

function SectionPaiement({
  prestation,
  clientInfo,
  onSuccess,
}: {
  prestation: Prestation;
  clientInfo: { name: string; email: string; phone: string };
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const montant = prestation.montantFinal ?? prestation.montant;

  useEffect(() => {
    if (prestation.status !== "EN_ATTENTE_PAIEMENT") return;
    setLoadingIntent(true);
    apiClient
      .post<{ clientSecret: string }>("/api/payment/create-intent", {
        prestationId: prestation.id,
      })
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch(() => setErrorMsg("Impossible de préparer le paiement. Réessayez."))
      .finally(() => setLoadingIntent(false));
  }, [prestation.id, prestation.status]);

  if (prestation.status !== "EN_ATTENTE_PAIEMENT") return null;

  return (
    <div
      className={`bg-white rounded-2xl ${spacing.card} border border-yellow-200 shadow-sm mb-6`}
    >
      <h2 className={`${typography.h5.base} ${colors.text.primary} mb-4`}>
        💳 Paiement requis
      </h2>

      <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 mb-5">
        <p className="text-sm text-yellow-700 mb-3">
          L'inspection a été validée. Procédez au paiement pour démarrer la
          prestation.
        </p>
        <div className={`text-3xl font-bold ${colors.text.primary}`}>
          {montant} €
        </div>
        {prestation.montantFinal && prestation.montantFinal !== prestation.montant && (
          <p className={`text-xs ${colors.text.muted} mt-1`}>
            <span className="line-through">{prestation.montant} € (montant initial)</span>
            {" "}→ révisé après inspection
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {loadingIntent ? (
        <div className={`flex items-center justify-center py-6 ${colors.text.muted}`}>
          <div className={`animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 ${colors.primary.border} mr-2`} />
          Préparation du formulaire de paiement…
        </div>
      ) : clientSecret ? (
        <StripeCheckout
          clientSecret={clientSecret}
          montant={montant}
          prestationId={prestation.id}
          clientInfo={clientInfo}
          onSuccess={() => setShowSuccessModal(true)}
          onError={(msg) => setErrorMsg(msg)}
        />
      ) : null}

      <Modal
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); onSuccess(); }}
        title="Paiement confirmé !"
        icon="🔒"
        headerVariant="success"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Votre argent est sécurisé et{" "}
            <strong>bloqué jusqu'à la récupération de votre objet</strong>.
            Le prestataire va maintenant commencer la prestation.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-xs text-emerald-700 font-medium">
              💡 Vous serez notifié lorsque la prestation sera terminée. Il
              vous faudra alors valider la remise de l'objet pour libérer le
              paiement.
            </p>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => { setShowSuccessModal(false); onSuccess(); }}
          >
            Compris !
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section Validation prestation ───────────────────────────────────────────

function SectionValidation({ prestation }: { prestation: Prestation }) {
  const [confirmValider, setConfirmValider] = useState(false);
  const [showContestForm, setShowContestForm] = useState(false);
  const [motif, setMotif] = useState("");
  const [motifError, setMotifError] = useState<string | null>(null);
  const [showValideModal, setShowValideModal] = useState(false);
  const valider = useValiderPrestation();
  const contester = useContesterPrestation();

  if (prestation.status !== "A_VALIDER" && !showValideModal) return null;

  const handleContester = () => {
    if (motif.trim().length < 10) {
      setMotifError("Veuillez décrire le problème (minimum 10 caractères)");
      return;
    }
    contester.mutate({ id: prestation.id, motif });
  };

  return (
    <div
      className={`bg-white rounded-2xl ${spacing.card} border border-purple-200 shadow-sm mb-6`}
    >
      <h2 className={`${typography.h5.base} ${colors.text.primary} mb-3`}>
        ⏳ Validation requise
      </h2>
      <p className={`text-sm ${colors.text.secondary} mb-2`}>
        Le prestataire a terminé votre prestation. Veuillez valider ou
        contester.
      </p>
      {prestation.autoValidateAt && (
        <p className={`text-xs ${colors.text.muted} mb-4`}>
          ⚠️ Sans action de votre part, la validation sera automatique le{" "}
          <strong>
            {new Date(prestation.autoValidateAt).toLocaleDateString("fr-FR")}
          </strong>
        </p>
      )}

      {/* Formulaire de contestation */}
      {showContestForm && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-700 mb-2">⚠️ Motif de contestation</p>
          <p className="text-xs text-red-600 mb-3">
            Décrivez précisément le problème constaté. Tasky utilisera ce motif pour traiter votre litige.
          </p>
          <textarea
            value={motif}
            onChange={(e) => { setMotif(e.target.value); setMotifError(null); }}
            placeholder="Ex : L'écran est toujours fissuré après la réparation, le problème n'est pas résolu..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2.5 rounded-xl border border-red-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
          />
          {motifError && <p className="text-xs text-red-600 mt-1">{motifError}</p>}
          <p className="text-xs text-red-400 mt-1 text-right">{motif.length}/500</p>
          <div className="flex gap-2 mt-3">
            <Button variant="ghost" size="sm" fullWidth onClick={() => { setShowContestForm(false); setMotif(""); setMotifError(null); }}>
              Annuler
            </Button>
            <Button
              size="sm"
              fullWidth
              className="!bg-red-500 hover:!bg-red-600 text-white"
              isLoading={contester.isPending}
              onClick={handleContester}
            >
              Confirmer la contestation
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!showContestForm && (
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => setShowContestForm(true)}
            className={colors.error.text}
          >
            ⚠️ Contester
          </Button>
        )}
        {confirmValider ? (
          <div className="flex gap-2 flex-1">
            <Button
              variant="ghost"
              size="sm"
              fullWidth
              onClick={() => setConfirmValider(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              fullWidth
              isLoading={valider.isPending}
              onClick={() => valider.mutate(prestation.id, { onSuccess: () => setShowValideModal(true) })}
            >
              Confirmer ✅
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => setConfirmValider(true)}
          >
            ✅ Valider la prestation
          </Button>
        )}
      </div>

      <Modal
        isOpen={showValideModal}
        onClose={() => setShowValideModal(false)}
        title="Prestation validée !"
        icon="🎉"
        headerVariant="success"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Merci pour votre confiance ! Le prestataire va recevoir son paiement sous <strong>1 à 2 jours ouvrés</strong>.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-xs text-emerald-700 font-medium">
              ⭐ N'oubliez pas de laisser un avis — cela aide les autres clients à choisir les meilleurs prestataires !
            </p>
          </div>
          <Button variant="secondary" fullWidth onClick={() => setShowValideModal(false)}>
            Fermer
          </Button>
        </div>
      </Modal>
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
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const { data, isLoading } = useDevisDemande(id);
  const { data: prestations } = useMesPrestationsClient();
  const { data: profile } = useProfile();
  const accepterDevis = useAccepterDevis();
  const refuserDevis = useRefuserDevis();
  const isModification = data?.demande?.typePrestation === "MODIFICATION";

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

  // Trouver la prestation liée à cette demande
  const prestation = prestations?.find((p) => p.demandeId === id);

  const statusLabel: Record<string, string> = {
    PUBLIEE:
      devis.length > 0
        ? `${devis.length} devis reçu${devis.length > 1 ? "s" : ""} — en attente de votre choix`
        : "Publiée — en attente de devis",
    EN_ATTENTE_INSPECTION: "Prestataire sélectionné — contactez-le pour un RDV de remise en main propre et inspection",
    EN_ATTENTE_PAIEMENT: "En attente de paiement",
    EN_COURS: "En cours",
    A_VALIDER: "À valider",
    TERMINEE: "Terminée",
    ANNULEE: "Annulée",
  };

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8 max-w-3xl`}>
        <button
          onClick={() => router.push(routes.client.requests.list)}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Mes demandes
        </button>

        {/* Badge contestation — EN_COURS après avoir été A_VALIDER = contestation */}
        {prestation?.status === "EN_COURS" && prestation?.autoValidateAt && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
            <span className="text-red-500 text-lg">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Commande contestée</p>
              <p className="text-xs text-red-600">Tasky a bien reçu votre contestation et va traiter votre litige. Consultez l'onglet Tasky-Infos pour le détail.</p>
            </div>
          </div>
        )}

        {/* Header demande */}
        <div
          className={`${colors.primary.gradient} rounded-2xl p-6 mb-6 text-white`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className={`text-sm text-pink-100`}>
              {statusLabel[demande.status] || demande.status}
            </div>
            {demande.reference && (
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-pink-200 uppercase tracking-wide leading-none mb-0.5">Référence</span>
                <span className="text-sm font-mono font-bold bg-white/20 px-2.5 py-1 rounded-lg text-white select-all">
                  TSK-{String(demande.reference).padStart(6, "0")}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold mb-2">{demande.titre}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-pink-100">
            {demande.ville && <span>📍 {demande.ville}</span>}
            {demande.budget && <span>💶 {demande.budget} €</span>}
            {demande.delaiJours && (
              <span>⏱️ {demande.delaiJours} jour{demande.delaiJours > 1 ? "s" : ""} après paiement</span>
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

        {/* État des lieux (si prestation existe) */}
        {prestation && prestation.etatDesLieux && (
          <SectionEtatDesLieux
            prestation={prestation}
            onValider={(accepte) => {
              if (!accepte) router.push(routes.client.requests.list);
            }}
          />
        )}

        {/* Paiement */}
        {prestation && (
          <SectionPaiement
            prestation={prestation}
            clientInfo={{
              name: `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim(),
              email: profile?.email ?? "",
              phone: profile?.phoneMasked ?? "",
            }}
            onSuccess={() => router.push(routes.client.requests.list)}
          />
        )}

        {/* Validation prestation */}
        {prestation && <SectionValidation prestation={prestation} />}

        {/* Prestation terminée */}
        {prestation && prestation.status === "TERMINEE" && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border border-green-200 shadow-sm mb-6 text-center`}
          >
            <div className="text-4xl mb-3">🎉</div>
            <h2 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Prestation terminée !
            </h2>
            <p className={`text-sm ${colors.text.secondary}`}>
              Montant payé :{" "}
              <strong>{prestation.montantFinal || prestation.montant} €</strong>
            </p>
          </div>
        )}

        {/* Avis */}
        {prestation && <SectionReview prestation={prestation} />}

        {/* Messagerie */}
        {prestation && <SectionChat prestationId={prestation.id} />}

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
                      onSuccess: () => setShowAcceptModal(true),
                    })
                  }
                  onRefuse={(devisId) => refuserDevis.mutate(devisId)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={showAcceptModal}
        onClose={() => {}}
        preventClose
        title="Devis accepté !"
        icon="✅"
        headerVariant="primary"
      >
        <div className="text-center space-y-4">
          {isModification ? (
            <>
              <p className="text-sm text-gray-600 leading-relaxed">
                Votre prestataire est sélectionné. La prochaine étape est l'<strong>inspection de votre objet</strong>.
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                <p className="text-xs text-pink-700 font-medium">
                  💬 N'oubliez pas de contacter le prestataire via la messagerie pour convenir d'un <strong>rendez-vous d'inspection</strong> !
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 leading-relaxed">
                Votre prestataire est sélectionné. La prochaine étape est le <strong>paiement</strong> pour démarrer la création.
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-xl p-3">
                <p className="text-xs text-pink-700 font-medium">
                  💳 Rendez-vous dans l'onglet "Mes demandes" pour procéder au paiement et lancer la prestation.
                </p>
              </div>
            </>
          )}
          <Button variant="primary" fullWidth onClick={() => { setShowAcceptModal(false); router.push(routes.client.requests.list); }}>
            Voir mes demandes →
          </Button>
        </div>
      </Modal>
    </div>
  );
}

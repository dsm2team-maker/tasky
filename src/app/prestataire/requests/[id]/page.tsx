"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useDemandeDetail, useEnvoyerDevis } from "@/hooks/useDevis";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

const urgenceConfig: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  NORMAL: { icon: "🟢", label: "Normal", color: "text-green-600" },
  URGENT: { icon: "🟡", label: "Urgent", color: "text-yellow-600" },
  TRES_URGENT: { icon: "🔴", label: "Très urgent", color: "text-red-600" },
};

const typeConfig: Record<string, string> = {
  MODIFICATION: "🔧 Modification",
  CREATION: "✨ Création",
  FORMATION: "🎓 Formation",
};

export default function PrestataireRequestDetailPage() {
  useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isHydrated, setIsHydrated] = useState(false);
  const [montant, setMontant] = useState("");
  const [delai, setDelai] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { data: demande, isLoading } = useDemandeDetail(id);
  const envoyerDevis = useEnvoyerDevis();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  if (!demande) return null;

  const urgence = urgenceConfig[demande.urgence] || urgenceConfig.NORMAL;

  const handleSubmit = () => {
    setError(null);
    if (!montant || parseFloat(montant) <= 0) {
      setError("Montant invalide");
      return;
    }
    if (!delai || parseInt(delai) <= 0) {
      setError("Délai invalide");
      return;
    }
    if (!description || description.trim().length < 20) {
      setError("Description trop courte (min 20 caractères)");
      return;
    }

    envoyerDevis.mutate(
      {
        demandeId: id,
        data: {
          montant: parseFloat(montant),
          delai: parseInt(delai),
          description: description.trim(),
        },
      },
      {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => router.push(routes.prestataire.requests.list), 2000);
        },
        onError: (err: any) =>
          setError(err.response?.data?.message || "Erreur lors de l'envoi"),
      },
    );
  };

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8 max-w-3xl`}>
        {/* Retour */}
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Retour aux demandes
        </button>

        {/* Détail demande */}
        <div
          className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm mb-6`}
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`text-sm font-semibold ${urgence.color}`}>
                  {urgence.icon} {urgence.label}
                </span>
                <span className={`text-sm ${colors.text.muted}`}>
                  {typeConfig[demande.typePrestation]}
                </span>
              </div>
              <h1 className={`text-xl font-bold ${colors.text.primary}`}>
                {demande.titre}
              </h1>
            </div>
            {demande.photos && demande.photos.length > 0 && (
              <div className="flex gap-2">
                {demande.photos.map((url, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden">
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {demande.description && demande.description !== demande.titre && (
            <p
              className={`text-sm ${colors.text.secondary} mb-4 leading-relaxed`}
            >
              {demande.description}
            </p>
          )}

          {/* Catégorie */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`text-xs px-3 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
            >
              {demande.category.icon} {demande.category.nom}
            </span>
            {demande.subCategory && (
              <span
                className={`text-xs px-3 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}
              >
                › {demande.subCategory.nom}
              </span>
            )}
          </div>

          {/* Infos */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl ${colors.background.gray}`}
          >
            {demande.ville && (
              <div>
                <div className={`text-xs ${colors.text.muted} mb-0.5`}>
                  Ville
                </div>
                <div className={`text-sm font-medium ${colors.text.primary}`}>
                  📍 {demande.ville}
                </div>
              </div>
            )}
            {demande.budget && (
              <div>
                <div className={`text-xs ${colors.text.muted} mb-0.5`}>
                  Budget client
                </div>
                <div className={`text-sm font-medium ${colors.text.primary}`}>
                  💶 {demande.budget} €
                </div>
              </div>
            )}
            {demande.dateEcheance && (
              <div>
                <div className={`text-xs ${colors.text.muted} mb-0.5`}>
                  Date souhaitée
                </div>
                <div className={`text-sm font-medium ${colors.text.primary}`}>
                  📅{" "}
                  {new Date(demande.dateEcheance).toLocaleDateString("fr-FR")}
                </div>
              </div>
            )}
            <div>
              <div className={`text-xs ${colors.text.muted} mb-0.5`}>
                Devis reçus
              </div>
              <div className={`text-sm font-medium ${colors.text.primary}`}>
                💬 {demande._count.devis}
              </div>
            </div>
          </div>

          {/* Client */}
          <div
            className={`flex items-center gap-3 mt-4 pt-4 border-t ${colors.border.light}`}
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden">
              {demande.client.user.avatar ? (
                <img
                  src={demande.client.user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  👤
                </div>
              )}
            </div>
            <div>
              <div className={`text-sm font-medium ${colors.text.primary}`}>
                {demande.client.user.firstName}
              </div>
              {demande.client.user.city && (
                <div className={`text-xs ${colors.text.muted}`}>
                  📍 {demande.client.user.city}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire devis */}
        {success ? (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm text-center`}
          >
            <div className="text-5xl mb-4">🎉</div>
            <h2 className={`text-xl font-bold ${colors.text.primary} mb-2`}>
              Devis envoyé !
            </h2>
            <p className={`text-sm ${colors.text.secondary}`}>
              Le client recevra votre proposition. Redirection en cours...
            </p>
          </div>
        ) : demande.devisExistant ? (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm text-center`}
          >
            <div className="text-4xl mb-3">✅</div>
            <h2 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Devis déjà envoyé
            </h2>
            <p className={`text-sm ${colors.text.secondary}`}>
              Vous avez déjà envoyé un devis pour cette demande.
            </p>
          </div>
        ) : (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
          >
            <h2 className={`${typography.h5.base} ${colors.text.primary} mb-6`}>
              Envoyer votre devis
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Montant (€) *"
                  type="number"
                  min="1"
                  placeholder="Ex: 45"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                />
                <Input
                  label="Délai (jours) *"
                  type="number"
                  min="1"
                  placeholder="Ex: 5"
                  value={delai}
                  onChange={(e) => setDelai(e.target.value)}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${colors.text.primary} mb-1.5`}
                >
                  Description de votre offre *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre approche, votre expérience sur ce type de prestation, ce qui est inclus dans le prix..."
                  rows={5}
                  maxLength={800}
                  className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none`}
                />
                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs ${description.length < 20 ? colors.error.text : colors.text.muted}`}
                  >
                    {description.length < 20 ? `Minimum 20 caractères` : ""}
                  </span>
                  <span className={`text-xs ${colors.text.muted}`}>
                    {description.length}/800
                  </span>
                </div>
              </div>

              {error && (
                <div
                  className={`p-3 rounded-xl ${colors.error.bg} border ${colors.error.borderLight}`}
                >
                  <p className={`text-sm ${colors.error.text}`}>{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" fullWidth onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  isLoading={envoyerDevis.isPending}
                  onClick={handleSubmit}
                >
                  Envoyer le devis
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

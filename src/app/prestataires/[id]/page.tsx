"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePublicPrestataire } from "@/hooks/usePrestataire";
import HeaderClient from "@/components/headers/HeaderClient";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import type { PublicReview } from "@/services/prestataire.service";

// ─── Étoiles ──────────────────────────────────────────────────────────────────

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : "text-sm";
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`${cls} ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

// ─── Carte avis ───────────────────────────────────────────────────────────────

function CardReview({ review }: { review: PublicReview }) {
  return (
    <div className={`bg-white rounded-2xl border ${colors.border.light} p-5`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {review.clientAvatar ? (
            <img src={review.clientAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
          )}
        </div>
        <div>
          <div className={`text-sm font-semibold ${colors.text.primary}`}>{review.clientFirstName}</div>
          <div className={`text-xs ${colors.text.muted}`}>
            {new Date(review.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </div>
        </div>
        <div className="ml-auto">
          <Stars rating={review.rating} />
        </div>
      </div>
      {review.comment && (
        <p className={`text-sm ${colors.text.secondary} leading-relaxed`}>{review.comment}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrestataireProfil() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: prestataire, isLoading } = usePublicPrestataire(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`} />
      </div>
    );
  }

  if (!prestataire) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className={colors.text.secondary}>Prestataire introuvable.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8 max-w-3xl`}>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Retour
        </button>

        {/* Header profil */}
        <div className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-6 mb-6`}>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden flex-shrink-0">
              {prestataire.avatar ? (
                <img src={prestataire.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className={`text-xl font-bold ${colors.text.primary}`}>{prestataire.firstName}</h1>
              {prestataire.city && (
                <p className={`text-sm ${colors.text.secondary} mt-0.5`}>📍 {prestataire.city}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Stars rating={prestataire.rating} size="lg" />
                <span className={`text-sm font-bold ${colors.text.primary}`}>
                  {prestataire.rating > 0 ? prestataire.rating.toFixed(1) : "—"}
                </span>
                <span className={`text-sm ${colors.text.muted}`}>
                  ({prestataire.reviewCount} avis)
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                prestataire.disponibilite === "ACTIF"
                  ? "bg-green-100 text-green-700"
                  : prestataire.disponibilite === "OCCUPE"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {prestataire.disponibilite === "ACTIF"
                ? "✅ Disponible"
                : prestataire.disponibilite === "OCCUPE"
                  ? "⏳ Occupé"
                  : "Inactif"}
            </span>
          </div>

          {prestataire.bio && (
            <p className={`text-sm ${colors.text.secondary} leading-relaxed mt-4 pt-4 border-t ${colors.border.light}`}>
              {prestataire.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`bg-white rounded-2xl border ${colors.border.light} p-4 text-center`}>
            <div className={`text-2xl font-bold ${colors.text.primary}`}>{prestataire.nbPrestations}</div>
            <div className={`text-xs ${colors.text.muted} mt-1`}>Prestations terminées</div>
          </div>
          {prestataire.tauxReussite != null && (
            <div className={`bg-white rounded-2xl border ${colors.border.light} p-4 text-center`}>
              <div className={`text-2xl font-bold ${colors.text.primary}`}>{prestataire.tauxReussite}%</div>
              <div className={`text-xs ${colors.text.muted} mt-1`}>Taux de réussite</div>
            </div>
          )}
          {prestataire.delaiMoyen != null && (
            <div className={`bg-white rounded-2xl border ${colors.border.light} p-4 text-center`}>
              <div className={`text-2xl font-bold ${colors.text.primary}`}>{prestataire.delaiMoyen}j</div>
              <div className={`text-xs ${colors.text.muted} mt-1`}>Délai moyen</div>
            </div>
          )}
        </div>

        {/* Compétences */}
        {prestataire.competences.length > 0 && (
          <div className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-5 mb-6`}>
            <h2 className={`font-bold ${colors.text.primary} mb-3`}>🛠️ Compétences</h2>
            <div className="flex flex-wrap gap-2">
              {prestataire.competences
                .map((c) => c.category)
                .filter(Boolean)
                .filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
                .map((c) => (
                <span
                  key={c.id}
                  className={`text-sm px-3 py-1.5 rounded-xl ${colors.background.gray} ${colors.text.secondary}`}
                >
                  {c.icon} {c.nom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Point de dépôt */}
        {prestataire.pointDepotAdresse && (
          <div className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm p-5 mb-6`}>
            <h2 className={`font-bold ${colors.text.primary} mb-3`}>📦 Point de dépôt</h2>
            <p className={`text-sm ${colors.text.secondary}`}>
              {prestataire.pointDepotAdresse}, {prestataire.pointDepotCodePostal} {prestataire.pointDepotVille}
            </p>
            {prestataire.pointDepotInstructions && (
              <p className={`text-sm ${colors.text.muted} mt-2`}>{prestataire.pointDepotInstructions}</p>
            )}
          </div>
        )}

        {/* Avis */}
        <div>
          <h2 className={`font-bold ${colors.text.primary} mb-4`}>
            ⭐ Avis clients ({prestataire.reviewCount})
          </h2>
          {prestataire.reviews.length === 0 ? (
            <div className={`bg-white rounded-2xl border ${colors.border.light} p-10 text-center`}>
              <div className="text-4xl mb-3">💬</div>
              <p className={`text-sm ${colors.text.secondary}`}>Aucun avis pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prestataire.reviews.map((r) => (
                <CardReview key={r.id} review={r} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import HeaderClient from "@/components/headers/HeaderClient";
import { Button } from "@/components/Button";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PublicPrestataire {
  id: string;
  firstName: string;
  city: string | null;
  avatar: string | null;
  bio: string | null;
  verified: boolean;
  rating: number;
  reviewCount: number;
  nbPrestations: number;
  memberSince: string;
  competences: {
    id: string;
    categoryId: string;
    category: { id: string; nom: string; icon: string; slug: string };
  }[];
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    clientFirstName: string;
    clientAvatar: string | null;
  }[];
}

// ─── Étoiles ──────────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; size?: "sm" | "md" }> = ({
  rating,
  size = "md",
}) => {
  const starSize = size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${starSize} ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function PrestatairePublicPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["prestataire-public", id],
    queryFn: () =>
      apiClient
        .get<{
          success: boolean;
          data: PublicPrestataire;
        }>(`/api/prestataires/${id}`)
        .then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${colors.background.gray}`}>
        <HeaderClient />
        <div className="flex items-center justify-center py-20">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
          />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={`min-h-screen ${colors.background.gray}`}>
        <HeaderClient />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-6xl">😕</div>
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>
            Prestataire introuvable
          </h1>
          <p className={colors.text.secondary}>
            Ce profil n'existe pas ou a été supprimé.
          </p>
          <Button variant="primary" onClick={() => router.back()}>
            ← Retour
          </Button>
        </div>
      </div>
    );
  }

  const memberSince = new Date(data.memberSince).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />

      <main className={`${spacing.container} py-8`}>
        {/* ── Bannière profil ── */}
        <div
          className={`${colors.secondary.gradient} rounded-2xl p-8 mb-8 text-white`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/30 flex-shrink-0 bg-white/20">
              {data.avatar ? (
                <img
                  src={data.avatar}
                  alt={data.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  🛠️
                </div>
              )}
            </div>

            {/* Infos */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{data.firstName}</h1>
                {data.verified && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/20 font-semibold">
                    ✓ Vérifié Tasky
                  </span>
                )}
              </div>
              <p className="text-emerald-100 mt-1">
                {data.city && `📍 ${data.city} · `}
                Membre depuis {memberSince}
              </p>

              {/* Note */}
              {data.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Stars rating={data.rating} />
                  <span className="text-white font-semibold">
                    {data.rating.toFixed(1)}
                  </span>
                  <span className="text-emerald-100 text-sm">
                    ({data.reviewCount} avis)
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
              <div>
                <div className="text-2xl font-bold">{data.nbPrestations}</div>
                <div className="text-xs text-emerald-100">Prestations</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl font-bold">{data.reviewCount}</div>
                <div className="text-xs text-emerald-100">Avis</div>
              </div>
            </div>
          </div>

          {/* Stats mobiles */}
          <div className="md:hidden flex items-center justify-around mt-4 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-xl font-bold">{data.nbPrestations}</div>
              <div className="text-xs text-emerald-100">Prestations</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{data.reviewCount}</div>
              <div className="text-xs text-emerald-100">Avis</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Colonne gauche ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Compétences */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`text-lg font-semibold ${colors.text.primary} mb-4`}
              >
                🛠️ Compétences
              </h2>
              {data.competences.length > 0 ? (
                <div className="space-y-2">
                  {data.competences.map((comp) => (
                    <div
                      key={comp.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.secondary.bg} border ${colors.secondary.borderLight}`}
                    >
                      <span>{comp.category.icon}</span>
                      <span
                        className={`text-sm font-medium ${colors.secondary.textDark}`}
                      >
                        {comp.category.nom}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${colors.text.tertiary} italic`}>
                  Aucune compétence renseignée
                </p>
              )}
            </div>

            {/* Point de dépôt */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`text-lg font-semibold ${colors.text.primary} mb-4`}
              >
                📍 Point de dépôt / retrait
              </h2>
              <div
                className={`p-4 rounded-xl ${colors.warning.bg} border ${colors.warning.borderLight}`}
              >
                <p className={`text-sm ${colors.warning.textDark} text-center`}>
                  ⏳ Information à venir
                </p>
                <p
                  className={`text-xs ${colors.warning.text} text-center mt-1`}
                >
                  Le prestataire n'a pas encore renseigné son point de dépôt
                </p>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Link href={routes.client.messages.list}>
                    <Button variant="outline" fullWidth size="lg">
                      💬 Contacter
                    </Button>
                  </Link>
                  <Link href={routes.client.requests.new}>
                    <Button variant="primary" fullWidth size="lg">
                      📋 Faire une demande
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="space-y-3">
                  <p className={`text-sm ${colors.text.tertiary} text-center`}>
                    Connectez-vous pour contacter ce prestataire
                  </p>
                  <Link href={routes.auth.login}>
                    <Button variant="primary" fullWidth size="lg">
                      Se connecter
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <h2
                className={`text-lg font-semibold ${colors.text.primary} mb-4`}
              >
                👤 Présentation
              </h2>
              {data.bio ? (
                <p
                  className={`text-sm ${colors.text.secondary} leading-relaxed`}
                >
                  {data.bio}
                </p>
              ) : (
                <p className={`text-sm ${colors.text.tertiary} italic`}>
                  Ce prestataire n'a pas encore renseigné sa présentation.
                </p>
              )}
            </div>

            {/* Avis */}
            <div
              className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-semibold ${colors.text.primary}`}>
                  ⭐ Avis clients
                </h2>
                {data.reviewCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Stars rating={data.rating} size="sm" />
                    <span
                      className={`text-sm font-bold ${colors.text.primary}`}
                    >
                      {data.rating.toFixed(1)}
                    </span>
                    <span className={`text-sm ${colors.text.tertiary}`}>
                      / 5 · {data.reviewCount} avis
                    </span>
                  </div>
                )}
              </div>

              {data.reviews.length > 0 ? (
                <div className="space-y-4">
                  {data.reviews.map((review) => (
                    <div
                      key={review.id}
                      className={`p-4 rounded-xl border ${colors.border.light} ${colors.background.gray}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar client */}
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                          {review.clientAvatar ? (
                            <img
                              src={review.clientAvatar}
                              alt={review.clientFirstName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm">
                              👤
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span
                              className={`text-sm font-semibold ${colors.text.primary}`}
                            >
                              {review.clientFirstName}
                            </span>
                            <div className="flex items-center gap-2">
                              <Stars rating={review.rating} size="sm" />
                              <span
                                className={`text-xs ${colors.text.tertiary}`}
                              >
                                {new Date(review.createdAt).toLocaleDateString(
                                  "fr-FR",
                                  { month: "short", year: "numeric" },
                                )}
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p
                              className={`text-sm ${colors.text.secondary} mt-1 leading-relaxed`}
                            >
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💬</div>
                  <p className={`text-sm ${colors.text.tertiary}`}>
                    Aucun avis pour l'instant
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

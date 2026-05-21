"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useProfile, usePrestataireCompetences } from "@/hooks/useProfile";
import { useMesPrestations } from "@/hooks/usePrestation";
import { useDemandesDisponibles, useMesStatsDevis, useMesDevisRefuses, useDismisserDevis } from "@/hooks/useDevis";
import { useUnreadMessageCount } from "@/hooks/useMessages";
import { Button } from "@/components/ui/Button";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing, transitions } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { Prestation } from "@/services/prestation.service";

const BIO_MIN = 100;
const OBJECTIF_MENSUEL = 1000;

// ─── Courbe revenus 6 mois ────────────────────────────────────────────────────

function CourbeRevenus({ terminees }: { terminees: Prestation[] }) {
  const now = new Date();
  const mois = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const next = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    const isCurrent = i === 5;
    const total = terminees
      .filter((p) => {
        const date = new Date(p.validatedAt ?? p.completedAt ?? p.createdAt);
        return date >= d && date < next;
      })
      .reduce((s, p) => s + (p.montantFinal ?? p.montant) * 0.85, 0);
    return { label, total, isCurrent };
  });

  const maxVal = Math.max(...mois.map((m) => m.total), 1);

  return (
    <div className="flex items-end gap-2 h-28">
      {mois.map((m, i) => {
        const pct = Math.max((m.total / maxVal) * 100, m.total > 0 ? 4 : 2);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-emerald-700 font-semibold h-4 flex items-end">
              {m.total > 0 ? `${Math.round(m.total)}€` : ""}
            </span>
            <div className="w-full rounded-t-md overflow-hidden bg-gray-100" style={{ height: "72px" }}>
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${m.isCurrent ? "bg-emerald-500" : "bg-emerald-200"}`}
                style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
              />
            </div>
            <span className={`text-[10px] font-medium ${m.isCurrent ? "text-emerald-700" : "text-gray-400"}`}>
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Anneau SVG taux ──────────────────────────────────────────────────────────

function AnnéauTaux({ taux }: { taux: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (taux / 100) * circ;
  const color = taux >= 50 ? "#10b981" : taux >= 25 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="flex-shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
      <circle
        cx="36" cy="36" r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 36 36)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
        {taux}%
      </text>
    </svg>
  );
}

// ─── Page dashboard ───────────────────────────────────────────────────────────

export default function PrestataireDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  const { data: profile } = useProfile();
  const { data: competences } = usePrestataireCompetences();
  const { data: prestations } = useMesPrestations();
  const { data: demandesDisponibles } = useDemandesDisponibles();
  const { data: unreadCount } = useUnreadMessageCount();
  const { data: statsDevis } = useMesStatsDevis();
  const { data: devisRefuses } = useMesDevisRefuses();
  const dismisser = useDismisserDevis();

  // ── Calculs activité ────────────────────────────────────────────────────────
  const COMMISSION = 0.15;
  const terminees = prestations?.filter((p) => p.status === "TERMINEE") ?? [];
  const enCours = prestations?.filter((p) => p.status === "EN_COURS") ?? [];
  const enAttente = prestations?.filter((p) =>
    ["EN_ATTENTE_INSPECTION", "EN_ATTENTE_PAIEMENT"].includes(p.status)
  ) ?? [];
  const enAttenteInspection = prestations?.filter((p) => p.status === "EN_ATTENTE_INSPECTION") ?? [];
  const enAttentePaiement = prestations?.filter((p) => p.status === "EN_ATTENTE_PAIEMENT") ?? [];
  const aValider = prestations?.filter((p) => p.status === "A_VALIDER") ?? [];

  const totalBrut = terminees.reduce((s, p) => s + (p.montantFinal ?? p.montant), 0);
  const totalCommission = totalBrut * COMMISSION;
  const totalNet = totalBrut * (1 - COMMISSION);

  // ── Objectif mensuel ────────────────────────────────────────────────────────
  const now = new Date();
  const revenusCurrentMonth = terminees
    .filter((p) => {
      const d = new Date(p.validatedAt ?? p.completedAt ?? p.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + (p.montantFinal ?? p.montant) * (1 - COMMISSION), 0);
  const progressObjectif = Math.min((revenusCurrentMonth / OBJECTIF_MENSUEL) * 100, 100);

  // ── Prestations en retard ────────────────────────────────────────────────────
  const prestationsEnRetard = (prestations ?? []).filter((p) => {
    if (p.status !== "EN_COURS") return false;
    if (!p.dateEcheanceFinal) return false;
    return new Date(p.dateEcheanceFinal) < new Date();
  });

  // ── Autres ──────────────────────────────────────────────────────────────────
  const topDemandes = (demandesDisponibles ?? []).slice(0, 3);
  const nbMessages = unreadCount ?? 0;
  const hasActions = nbMessages > 0 || aValider.length > 0 || prestationsEnRetard.length > 0;

  // ── Profil complet ──────────────────────────────────────────────────────────
  const hasBio = (profile?.prestataire?.bio?.length ?? 0) >= BIO_MIN;
  const hasCompetences = (competences?.length ?? 0) > 0;
  const hasPointDepot = !!profile?.prestataire?.pointDepotAdresse;
  const hasIban = !!profile?.prestataire?.iban;
  const emailVerified = !!profile?.emailVerified;
  const profileComplete = emailVerified && hasBio && hasCompetences && hasPointDepot && hasIban;

  useEffect(() => setIsHydrated(true), []);
  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.push(routes.auth.login);
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />

      <main className={`${spacing.container} py-8`}>
        {/* ── Bandeau profil incomplet ── */}
        {!profileComplete && (
          <div className="mb-6 p-5 rounded-2xl border-2 border-amber-300 bg-amber-50 flex flex-col sm:flex-row items-center gap-4">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div className="flex-1">
              <h3 className="font-bold text-amber-800 mb-1">Votre compte n'est pas encore actif</h3>
              <p className="text-sm text-amber-700">
                Complétez votre profil pour commencer à recevoir des demandes de clients.
              </p>
            </div>
            <Link href={routes.prestataire.profile.view} className="flex-shrink-0">
              <Button variant="secondary" size="sm">Compléter mon profil →</Button>
            </Link>
          </div>
        )}

        {/* ── Welcome Banner ── */}
        <div className={`${colors.secondary.gradient} rounded-2xl p-8 mb-8 text-white`}>
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.firstName || user?.email?.split("@")[0] || "Prestataire"} ! 🛠️
          </h1>
          <p className="text-emerald-100 mb-6">
            {profileComplete
              ? "Votre profil est actif. Consultez les demandes disponibles."
              : "Complétez votre profil pour être visible par les clients."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={routes.prestataire.profile.view}>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                Mon profil
              </Button>
            </Link>
            {profileComplete && (
              <Link href={routes.prestataire.requests.list}>
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Voir les demandes
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Stats activité (4 cartes) ── */}
        <h2 className={`text-lg font-bold ${colors.text.primary} mb-3`}>📊 Activité</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
            <div className="text-xl mb-1">✅</div>
            <div className={`text-2xl font-bold ${colors.text.primary}`}>{terminees.length}</div>
            <div className={`text-xs ${colors.text.muted} mt-0.5`}>Terminées</div>
          </div>
          <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
            <div className="text-xl mb-1">⚡</div>
            <div className={`text-2xl font-bold ${colors.text.primary}`}>{enCours.length}</div>
            <div className={`text-xs ${colors.text.muted} mt-0.5`}>En cours</div>
          </div>
          <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
            <div className="text-xl mb-1">📦</div>
            <div className={`text-2xl font-bold ${colors.text.primary}`}>{enAttente.length}</div>
            <div className={`text-xs ${colors.text.muted} mt-0.5`}>En attente</div>
            {enAttente.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {enAttenteInspection.length > 0 && (
                  <div className="text-[10px] text-orange-500 font-medium">· {enAttenteInspection.length} inspection</div>
                )}
                {enAttentePaiement.length > 0 && (
                  <div className="text-[10px] text-blue-500 font-medium">· {enAttentePaiement.length} paiement</div>
                )}
              </div>
            )}
          </div>
          <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
            <div className="text-xl mb-1">⏳</div>
            <div className={`text-2xl font-bold ${colors.text.primary}`}>{aValider.length}</div>
            <div className={`text-xs ${colors.text.muted} mt-0.5`}>À valider</div>
          </div>
        </div>

        {/* ── Actions importantes ── */}
        {profileComplete && hasActions && (
          <div className="mb-8">
            <h2 className={`text-lg font-bold ${colors.text.primary} mb-3`}>🔔 Actions importantes</h2>
            <div className="flex flex-col gap-2">
              {nbMessages > 0 && (
                <Link href={routes.prestataire.messages.list}>
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition-colors cursor-pointer">
                    <span className="text-xl">💬</span>
                    <span className="text-sm font-medium text-red-700">
                      {nbMessages} message{nbMessages > 1 ? "s" : ""} non lu{nbMessages > 1 ? "s" : ""}
                    </span>
                    <span className="ml-auto text-xs text-red-400">Voir →</span>
                  </div>
                </Link>
              )}
              {aValider.map((p) => (
                <Link key={p.id} href={`/prestataire/services/${p.id}`}>
                  <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 hover:bg-purple-100 transition-colors cursor-pointer">
                    <span className="text-xl">⏳</span>
                    <span className="text-sm font-medium text-purple-700">
                      En attente de validation client — <strong>{p.demande.titre}</strong>
                    </span>
                    <span className="ml-auto text-xs text-purple-400">Voir →</span>
                  </div>
                </Link>
              ))}

              {prestationsEnRetard.map((p) => {
                const echeance = new Date(p.dateEcheanceFinal!);
                const joursRetard = Math.floor((Date.now() - echeance.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <Link key={p.id} href={`/prestataire/services/${p.id}`}>
                    <div className="flex items-start gap-3 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 hover:bg-orange-100 transition-colors cursor-pointer">
                      <span className="text-xl flex-shrink-0 mt-0.5">⏰</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-orange-800">
                          Cette prestation semble être en retard
                        </p>
                        <p className="text-xs text-orange-600 mt-0.5">
                          <strong>{p.demande.titre}</strong> — échéance dépassée de {joursRetard} jour{joursRetard > 1 ? "s" : ""} ({echeance.toLocaleDateString("fr-FR")}).
                          Un retard répété peut faire baisser votre note.
                        </p>
                      </div>
                      <span className="ml-auto text-xs text-orange-400 flex-shrink-0 mt-0.5">Voir →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Demandes compatibles ── */}
        {profileComplete && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className={`text-lg font-bold ${colors.text.primary}`}>🔥 Demandes compatibles avec votre profil</h2>
              <Link href={routes.prestataire.requests.list}>
                <span className={`text-sm ${colors.secondary.text} font-medium hover:underline`}>Voir tout →</span>
              </Link>
            </div>

            {topDemandes.length === 0 ? (
              <div className={`bg-white rounded-xl p-8 text-center border ${colors.border.light}`}>
                <div className="text-4xl mb-3">🔍</div>
                <p className={`text-sm ${colors.text.secondary}`}>Aucune demande compatible pour le moment — revenez bientôt !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topDemandes.map((d) => (
                  <Link key={d.id} href={`/prestataire/requests/${d.id}`}>
                    <div className={`bg-white rounded-xl border ${colors.border.light} shadow-sm p-4 hover:shadow-md transition-all flex items-center gap-4`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            d.matching.label === "PARFAIT" ? "bg-green-100 text-green-700"
                            : d.matching.label === "BON" ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                          }`}>
                            {d.matching.label === "PARFAIT" ? "🌟" : d.matching.label === "BON" ? "✅" : "⚠️"} {Math.round(d.matching.score)}/100
                          </span>
                          {d.urgence === "URGENT" && <span className="text-xs text-yellow-600">🟡 Cette semaine</span>}
                          {d.urgence === "TRES_URGENT" && <span className="text-xs text-red-600 font-bold">🔴 Urgent</span>}
                          {d.reference && (
                            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-1.5 py-0.5 rounded ml-auto">
                              TSK-{String(d.reference).padStart(6, "0")}
                            </span>
                          )}
                        </div>
                        <div className={`font-semibold ${colors.text.primary} truncate`}>{d.titre}</div>
                        <div className={`text-xs ${colors.text.muted} flex gap-3 mt-0.5`}>
                          {d.ville && <span>📍 {d.ville}</span>}
                          {d.budget && <span>💶 {d.budget} €</span>}
                          <span>💬 {d._count.devis} devis</span>
                        </div>
                      </div>
                      <span className={`text-xs ${colors.text.muted} flex-shrink-0`}>Voir →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Finance + Courbe ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Colonne gauche : revenus, commission, objectif */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="text-xl mb-1">💶</div>
                <div className="text-2xl font-bold text-emerald-700">{totalNet.toFixed(0)} €</div>
                <div className="text-xs text-emerald-600 mt-0.5">Revenus nets (total)</div>
              </div>
              <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
                <div className="text-xl mb-1">🏷️</div>
                <div className={`text-2xl font-bold ${colors.text.muted}`}>{totalCommission.toFixed(0)} €</div>
                <div className={`text-xs ${colors.text.muted} mt-0.5`}>Commission Tasky (15%)</div>
              </div>
            </div>

            {/* Objectif mensuel */}
            <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${colors.text.primary}`}>🎯 Objectif mensuel</span>
                <span className="text-xs font-bold text-emerald-600">
                  {revenusCurrentMonth.toFixed(0)} € / {OBJECTIF_MENSUEL} €
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressObjectif}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className={`text-xs ${colors.text.muted}`}>
                  {progressObjectif >= 100
                    ? "🎉 Objectif atteint !"
                    : `${Math.round(progressObjectif)}% ce mois-ci`}
                </span>
                <span className={`text-xs ${colors.text.muted}`}>
                  Reste {Math.max(0, OBJECTIF_MENSUEL - revenusCurrentMonth).toFixed(0)} €
                </span>
              </div>
            </div>
          </div>

          {/* Colonne droite : courbe 6 mois */}
          <div className={`bg-white rounded-xl p-4 shadow-sm border ${colors.border.light}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-semibold ${colors.text.primary}`}>📈 Revenus 6 derniers mois</span>
              <span className={`text-xs ${colors.text.muted}`}>nets</span>
            </div>
            <CourbeRevenus terminees={terminees} />
          </div>
        </div>

        {/* ── Taux d'acceptation devis ── */}
        {statsDevis && (
          <div className={`bg-white rounded-xl p-5 shadow-sm border ${colors.border.light} mb-6`}>
            <h2 className={`text-sm font-semibold ${colors.text.primary} mb-4`}>📋 Taux d'acceptation des devis</h2>
            <div className="flex items-center gap-6">
              <AnnéauTaux taux={statsDevis.taux} />
              <div className="flex gap-6">
                <div>
                  <div className={`text-2xl font-bold ${colors.text.primary}`}>{statsDevis.envoyes}</div>
                  <div className={`text-xs ${colors.text.muted} mt-0.5`}>Devis envoyés</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">{statsDevis.acceptes}</div>
                  <div className={`text-xs ${colors.text.muted} mt-0.5`}>Acceptés</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${statsDevis.envoyes - statsDevis.acceptes > 0 ? "text-gray-400" : colors.text.primary}`}>
                    {statsDevis.envoyes - statsDevis.acceptes}
                  </div>
                  <div className={`text-xs ${colors.text.muted} mt-0.5`}>Non retenus</div>
                </div>
              </div>
              <div className="ml-auto hidden sm:block">
                <p className={`text-xs ${colors.text.muted} max-w-[160px] text-right leading-relaxed`}>
                  {statsDevis.taux >= 50
                    ? "Excellent ! Les clients apprécient vos offres."
                    : statsDevis.taux >= 25
                      ? "Bon taux. Soignez vos descriptions pour progresser."
                      : statsDevis.envoyes === 0
                        ? "Envoyez vos premiers devis pour débuter."
                        : "Affinez vos offres pour améliorer ce taux."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions rapides ── */}
        <h2 className={`text-lg font-bold ${colors.text.primary} mb-4`}>⚡ Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {profileComplete ? (
            <Link href={routes.prestataire.requests.list}>
              <div className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border.light} hover:shadow-md ${transitions.base} cursor-pointer group`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 ${transitions.base}`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${colors.text.primary} mb-1`}>Demandes disponibles</h3>
                    <p className={`text-sm ${colors.text.secondary}`}>
                      Consultez les nouvelles demandes de clients près de chez vous
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div onClick={() => router.push(routes.prestataire.profile.view)} className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border.light} cursor-pointer opacity-60`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${colors.text.primary} mb-1`}>Demandes disponibles</h3>
                  <p className={`text-sm ${colors.warning.text} font-medium`}>⚠️ Complétez votre profil pour accéder aux demandes</p>
                </div>
              </div>
            </div>
          )}

          {profileComplete ? (
            <Link href={routes.prestataire.services.list}>
              <div className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border.light} hover:shadow-md ${transitions.base} cursor-pointer group`}>
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${colors.secondary.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 ${transitions.base}`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${colors.text.primary} mb-1`}>Mes prestations</h3>
                    <p className={`text-sm ${colors.text.secondary}`}>Gérez vos prestations en cours et votre historique</p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div onClick={() => router.push(routes.prestataire.profile.view)} className={`bg-white rounded-xl p-6 shadow-sm border ${colors.border.light} cursor-pointer opacity-60`}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${colors.text.primary} mb-1`}>Mes prestations</h3>
                  <p className={`text-sm ${colors.warning.text} font-medium`}>⚠️ Complétez votre profil pour accéder aux prestations</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Devis non retenus ── */}
        {profileComplete && devisRefuses && devisRefuses.length > 0 && (
          <div className="mt-8 space-y-2">
            {devisRefuses.map((d) => {
              const ref = d.demande.reference
                ? `TSK-${String(d.demande.reference).padStart(6, "0")}`
                : "";
              return (
                <div key={d.id} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <span className="text-xl">❌</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-500">
                      Devis non retenu — <span className="font-medium text-gray-700">{d.demande.titre}</span>
                    </span>
                    {ref && (
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">{ref}</div>
                    )}
                  </div>
                  <button
                    onClick={() => dismisser.mutate(d.id)}
                    disabled={dismisser.isPending}
                    className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!profileComplete && (
          <div className={`bg-white rounded-xl p-12 text-center shadow-sm border ${colors.border.light}`}>
            <div className={`w-20 h-20 ${colors.background.light} rounded-full flex items-center justify-center mx-auto mb-4 text-4xl`}>🛠️</div>
            <h3 className={`text-xl font-bold ${colors.text.primary} mb-2`}>Profil incomplet</h3>
            <p className={`${colors.text.secondary} mb-6`}>Complétez votre profil pour apparaître dans les recherches des clients</p>
            <Link href={routes.prestataire.profile.view}>
              <Button size="lg" variant="secondary" className="text-white">Compléter mon profil →</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

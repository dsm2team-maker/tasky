"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMesPrestations } from "@/hooks/usePrestation";
import { useUnreadByPrestation } from "@/hooks/useMessages";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import type { Prestation } from "@/services/prestation.service";

const statusLabel: Record<string, string> = {
  EN_ATTENTE_INSPECTION: "📦 Remise & Inspection",
  EN_ATTENTE_PAIEMENT: "💳 En attente de paiement",
  EN_COURS: "⚡ En cours",
  A_VALIDER: "⏳ À valider",
  TERMINEE: "✅ Terminée",
  ANNULEE: "❌ Annulée",
};

function ConversationCard({ prestation, unread }: { prestation: Prestation; unread: number }) {
  const client = prestation.demande.client?.user;

  return (
    <Link href={`/prestataire/services/${prestation.id}`}>
      <div
        className={`bg-white rounded-2xl border ${unread > 0 ? "border-emerald-300" : colors.border.light} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer flex items-center gap-4`}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {client?.avatar ? (
              <img src={client.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
            )}
          </div>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`font-semibold ${colors.text.primary} truncate`}>
            {client?.firstName} {client?.lastName}
          </div>
          <div className={`text-sm ${colors.text.secondary} truncate`}>
            {prestation.demande.titre}
          </div>
          <div className={`text-xs ${colors.text.muted} mt-0.5`}>
            {statusLabel[prestation.status] ?? prestation.status}
          </div>
        </div>

        <span className={`text-xs ${colors.text.muted} flex-shrink-0`}>
          💬 Voir →
        </span>
      </div>
    </Link>
  );
}

export default function PrestataireMessagesPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const { data: prestations, isLoading } = useMesPrestations();
  const { data: unreadMap } = useUnreadByPrestation();

  useEffect(() => setIsHydrated(true), []);

  if (!isHydrated || isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );

  const actives = prestations?.filter((p) => p.status !== "ANNULEE") ?? [];

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8 max-w-2xl`}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Messages</h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            {actives.length} conversation{actives.length > 1 ? "s" : ""} active{actives.length > 1 ? "s" : ""}
          </p>
        </div>

        {actives.length === 0 ? (
          <div className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}>
            <div className="text-5xl mb-4">💬</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Aucune conversation
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Les conversations apparaîtront ici une fois qu'un client aura accepté votre devis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actives.map((p) => (
              <ConversationCard key={p.id} prestation={p} unread={unreadMap?.[p.id] ?? 0} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useMesPrestationsClient } from "@/hooks/usePrestation";
import { useUnreadByPrestation, useTaskyInfoUnreadCount } from "@/hooks/useMessages";
import { useConversations, useUnreadByConversation } from "@/hooks/useConversations";
import { Pagination } from "@/components/shared/Pagination";
import HeaderClient from "@/components/headers/HeaderClient";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { Prestation } from "@/services/prestation.service";
import type { ConversationSummary } from "@/services/conversation.service";

const PAGE_SIZE = 8;

const statusLabel: Record<string, string> = {
  EN_ATTENTE_INSPECTION: "📦 Remise & Inspection",
  EN_ATTENTE_PAIEMENT: "💳 En attente de paiement",
  EN_COURS: "⚡ En cours",
  A_VALIDER: "⏳ À valider",
  TERMINEE: "✅ Terminée",
  ANNULEE: "❌ Annulée",
};

function ConversationCard({ prestation, unread }: { prestation: Prestation; unread: number }) {
  const other = prestation.prestataire?.user;
  const avatar = other?.avatar;

  return (
    <Link href={`/client/requests/${prestation.demandeId}`}>
      <div
        className={`bg-white rounded-2xl border ${unread > 0 ? "border-pink-300" : colors.border.light} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer flex items-center gap-4`}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className={`font-semibold ${colors.text.primary} truncate`}>
              {other?.firstName} {other?.lastName}
            </div>
            {prestation.demande.reference && (
              <span className="text-[10px] font-mono font-bold bg-pink-50 text-pink-600 border border-pink-200 px-1.5 py-0.5 rounded flex-shrink-0">
                TSK-{String(prestation.demande.reference).padStart(6, "0")}
              </span>
            )}
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

function TaskyInfoCard({ unread }: { unread: number }) {
  return (
    <Link href={routes.client.messages.taskyInfo}>
      <div
        className={`bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border ${unread > 0 ? "border-purple-300" : "border-purple-100"} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer flex items-center gap-4`}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm ring-2 ring-purple-100">
            <Image src="/images/logo-tasky.png" alt="Tasky" width={28} height={28} className="object-contain" />
          </div>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-purple-700 truncate">Tasky-Info</div>
          <div className="text-sm text-purple-500 truncate">
            Notifications sur vos demandes et prestations
          </div>
        </div>

        <span className="text-xs text-purple-400 flex-shrink-0">🔔 Voir →</span>
      </div>
    </Link>
  );
}

function DirectConversationCard({ conversation, unread }: { conversation: ConversationSummary; unread: number }) {
  const other = conversation.other;

  return (
    <Link href={routes.client.messages.conversation(conversation.id)}>
      <div
        className={`bg-white rounded-2xl border ${unread > 0 ? "border-pink-300" : colors.border.light} shadow-sm p-5 hover:shadow-md transition-all cursor-pointer flex items-center gap-4`}
      >
        <div className="relative w-12 h-12 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {other.avatar ? (
              <img src={other.avatar} alt="" className="w-full h-full object-cover" />
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
            {other.firstName} {other.lastName}
          </div>
          <div className={`text-sm ${colors.text.secondary} truncate`}>
            {conversation.lastMessage?.contenu ?? "Démarrer la discussion"}
          </div>
        </div>

        <span className={`text-xs ${colors.text.muted} flex-shrink-0`}>💬 Voir →</span>
      </div>
    </Link>
  );
}

export default function ClientMessagesPage() {
  useAuthGuard();
  const [isHydrated, setIsHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const { data: prestations, isLoading } = useMesPrestationsClient();
  const { data: unreadMap } = useUnreadByPrestation();
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();
  const { data: unreadConversationMap } = useUnreadByConversation();
  const { data: taskyInfoUnread } = useTaskyInfoUnreadCount();

  useEffect(() => setIsHydrated(true), []);

  const actives =
    prestations?.filter(
      (p) => (p.status !== "ANNULEE" && p.status !== "TERMINEE") || (unreadMap?.[p.id] ?? 0) > 0,
    ) ?? [];
  const totalPages = Math.max(1, Math.ceil(actives.length / PAGE_SIZE));
  const paginated = actives.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [actives.length]);

  if (!isHydrated || isLoading || isLoadingConversations)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`} />
      </div>
    );

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8 max-w-2xl`}>
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Messages</h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            {actives.length} conversation{actives.length > 1 ? "s" : ""} active{actives.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="mb-8">
          <TaskyInfoCard unread={taskyInfoUnread ?? 0} />
        </div>

        {conversations && conversations.length > 0 && (
          <div className="mb-8">
            <h2 className={`text-sm font-bold ${colors.text.secondary} uppercase tracking-wide mb-3`}>
              Discussions directes
            </h2>
            <div className="space-y-3">
              {conversations.map((c) => (
                <DirectConversationCard key={c.id} conversation={c} unread={unreadConversationMap?.[c.id] ?? 0} />
              ))}
            </div>
          </div>
        )}

        <h2 className={`text-sm font-bold ${colors.text.secondary} uppercase tracking-wide mb-3`}>
          Prestations en cours
        </h2>

        {actives.length === 0 ? (
          <div className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}>
            <div className="text-5xl mb-4">💬</div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Aucune conversation
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Les conversations apparaîtront ici une fois qu'un prestataire aura été sélectionné pour une demande.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginated.map((p) => (
                <ConversationCard key={p.id} prestation={p} unread={unreadMap?.[p.id] ?? 0} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  );
}

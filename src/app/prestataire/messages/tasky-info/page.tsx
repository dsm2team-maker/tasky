"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useTaskyInfoMessages } from "@/hooks/useMessages";
import HeaderPrestataire from "@/components/headers/HeaderPrestataire";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";

function parseSystemMessage(contenu: string): { emoji: string; text: string } {
  const parts = contenu.split("Tasky-Infos — ");
  if (parts.length >= 2) {
    return { emoji: parts[0].trim(), text: parts.slice(1).join("Tasky-Infos — ") };
  }
  return { emoji: "ℹ️", text: contenu };
}

function TaskyAvatar() {
  return (
    <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-purple-100">
      <Image src="/images/logo-tasky.png" alt="Tasky" width={28} height={28} className="object-contain" />
    </div>
  );
}

export default function PrestataireTaskyInfoPage() {
  useAuthGuard();
  const router = useRouter();
  const { data: messages, isLoading } = useTaskyInfoMessages();

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderPrestataire />
      <main className={`${spacing.container} py-8 max-w-2xl`}>
        <button
          onClick={() => router.back()}
          className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-6`}
        >
          ← Retour
        </button>

        <div className="flex items-center gap-3 mb-6">
          <TaskyAvatar />
          <div>
            <h1 className={`text-2xl font-bold ${colors.text.primary}`}>Tasky-Info</h1>
            <p className={`text-sm ${colors.text.secondary}`}>
              Notifications sur l'état de vos devis et prestations
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400" />
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className={`bg-white rounded-2xl p-12 text-center border ${colors.border.light}`}>
            <div className="opacity-30 flex justify-center mb-4">
              <TaskyAvatar />
            </div>
            <h3 className={`text-lg font-bold ${colors.text.primary} mb-2`}>
              Aucune notification
            </h3>
            <p className={`text-sm ${colors.text.secondary}`}>
              Vous serez informé ici lorsqu'un devis est retenu ou non retenu.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const { emoji, text } = parseSystemMessage(msg.contenu);
              return (
                <div key={msg.id} className="flex items-start gap-3">
                  <TaskyAvatar />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {emoji && <span className="mr-1.5">{emoji}</span>}
                        {text}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 px-1 mt-1 block">
                      {new Date(msg.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

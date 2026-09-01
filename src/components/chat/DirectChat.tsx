"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useConversationMessages, useSendConversationMessage } from "@/hooks/useConversations";
import { colors } from "@/config/colors";
import MessageThread from "./MessageThread";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\s.\-\/()]{0,2}){7,}\d/;

const containsContactInfo = (text: string) => EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);

interface Props {
  conversationId: string;
}

export default function DirectChat({ conversationId }: Props) {
  const { user } = useAuthStore();
  const { data, isLoading } = useConversationMessages(conversationId);
  const sendMessage = useSendConversationMessage(conversationId);
  const [contenu, setContenu] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = () => {
    const text = contenu.trim();
    if (!text || sendMessage.isPending) return;
    setError(null);
    if (containsContactInfo(text)) {
      setError("Les coordonnées personnelles (email, téléphone) ne sont pas autorisées.");
      return;
    }
    sendMessage.mutate(text, {
      onSuccess: () => setContenu(""),
      onError: (err: any) =>
        setError(err?.response?.data?.message ?? "Erreur lors de l'envoi du message."),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const other =
    data && user
      ? data.participants.client.id === user.id
        ? data.participants.prestataire
        : data.participants.client
      : null;

  return (
    <div className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm overflow-hidden`}>
      <div className={`px-4 py-3.5 border-b ${colors.border.light} flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {other?.avatar ? (
            <img src={other.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
          )}
        </div>
        <div>
          <p className={`text-sm font-semibold ${colors.text.primary}`}>{other?.firstName ?? "…"}</p>
          <p className={`text-xs ${colors.text.muted}`}>Discussion directe</p>
        </div>
      </div>

      <div className="h-96 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${colors.primary.border}`} />
          </div>
        ) : (
          <MessageThread
            messages={messages}
            isRight={(msg) => msg.auteurId === user?.id}
            sender={(msg) =>
              msg.auteurId === data?.participants.client.id
                ? { avatar: data?.participants.client.avatar }
                : { avatar: data?.participants.prestataire.avatar }
            }
            emptyLabel={
              <>
                Aucun message pour l'instant.
                <br />
                <span className="text-xs">Dites bonjour !</span>
              </>
            }
          />
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">⚠️ {error}</p>
        </div>
      )}

      <div className={`px-4 py-3 border-t ${colors.border.light} flex gap-2 items-end`}>
        <textarea
          value={contenu}
          onChange={(e) => {
            setContenu(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message… (Entrée pour envoyer)"
          rows={1}
          maxLength={1000}
          className={`flex-1 resize-none px-3.5 py-2.5 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300`}
          style={{ minHeight: "42px", maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!contenu.trim() || sendMessage.isPending}
          className="px-4 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          {sendMessage.isPending ? "…" : "Envoyer"}
        </button>
      </div>
    </div>
  );
}

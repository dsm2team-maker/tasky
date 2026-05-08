"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { colors } from "@/config/colors";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\s.\-\/()]{0,2}){7,}\d/;

const containsContactInfo = (text: string) =>
  EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);

interface Props {
  prestationId: string;
}

export default function SectionChat({ prestationId }: Props) {
  const { user } = useAuthStore();
  const { data, isLoading } = useMessages(prestationId);
  const sendMessage = useSendMessage(prestationId);
  const [contenu, setContenu] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

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
    <div className={`bg-white rounded-2xl border ${colors.border.light} shadow-sm mb-6 overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 py-4 border-b ${colors.border.light} flex items-center gap-3`}>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {other?.avatar ? (
            <img src={other.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
          )}
        </div>
        <div>
          <div className={`text-sm font-semibold ${colors.text.primary}`}>
            💬 Messagerie — {other?.firstName ?? "…"}
          </div>
          <div className={`text-xs ${colors.text.muted}`}>
            Mise à jour automatique · coordonnées personnelles non autorisées
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${colors.primary.border}`} />
          </div>
        ) : !data || data.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="text-3xl mb-2">💬</div>
            <p className={`text-sm ${colors.text.muted}`}>
              Aucun message pour l'instant. Dites bonjour !
            </p>
          </div>
        ) : (
          data.messages.map((msg) => {
            const isMe = msg.auteurId === user?.id;
            const sender = isMe
              ? null
              : msg.auteurId === data.participants.client.id
                ? data.participants.client
                : data.participants.prestataire;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mb-0.5">
                    {sender?.avatar ? (
                      <img src={sender.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">👤</div>
                    )}
                  </div>
                )}
                <div className={`max-w-[70%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-pink-500 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.contenu}
                  </div>
                  <span className={`text-xs ${colors.text.muted} px-1`}>
                    {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Erreur */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-xs text-red-600">⚠️ {error}</p>
        </div>
      )}

      {/* Input */}
      <div className={`px-4 py-3 border-t ${colors.border.light} flex gap-2 items-end`}>
        <textarea
          value={contenu}
          onChange={(e) => { setContenu(e.target.value); setError(null); }}
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

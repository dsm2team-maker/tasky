"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { colors } from "@/config/colors";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\s.\-\/()]{0,2}){7,}\d/;

const containsContactInfo = (text: string) =>
  EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dateKey(iso) === dateKey(today.toISOString())) return "Aujourd'hui";
  if (dateKey(iso) === dateKey(yesterday.toISOString())) return "Hier";
  return `Le ${d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
}

function groupByDate<T extends { createdAt: string }>(messages: T[]) {
  const groups: { key: string; label: string; messages: T[] }[] = [];
  for (const msg of messages) {
    const key = dateKey(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.messages.push(msg);
    } else {
      groups.push({ key, label: dateLabel(msg.createdAt), messages: [msg] });
    }
  }
  return groups;
}

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

  const chatMessages = data?.messages.filter((m) => !m.isSystem) ?? [];
  const messageGroups = groupByDate(chatMessages);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const toggleDate = (key: string) => {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

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
      <div className="flex items-center gap-2 px-4 py-3.5 text-sm font-semibold bg-pink-50 text-pink-600 border-b border-pink-100">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Messages</span>
        {other && (
          <span className="text-xs font-normal text-pink-400">— {other.firstName}</span>
        )}
      </div>

      <div className="h-72 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className={`animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 ${colors.primary.border}`} />
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8">
            <div className="text-3xl mb-2">💬</div>
            <p className={`text-sm ${colors.text.muted} text-center`}>
              Aucun message pour l'instant.
              <br />
              <span className="text-xs">Dites bonjour !</span>
            </p>
          </div>
        ) : (
          messageGroups.map((group) => {
            const isCollapsed = collapsedDates.has(group.key);
            return (
              <div key={group.key}>
                <button
                  type="button"
                  onClick={() => toggleDate(group.key)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 group"
                >
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 ${colors.text.muted} group-hover:bg-gray-200 transition-colors flex items-center gap-1`}>
                    {group.label}
                    <svg
                      className={`w-3 h-3 transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-3">
                    {group.messages.map((msg) => {
                      const isMe = msg.auteurId === user?.id;
                      const sender = isMe
                        ? null
                        : msg.auteurId === data?.participants.client.id
                          ? data?.participants.client
                          : data?.participants.prestataire;

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
                    })}
                  </div>
                )}
              </div>
            );
          })
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

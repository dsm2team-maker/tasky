"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth-store";
import { useMessages, useSendMessage } from "@/hooks/useMessages";
import { colors } from "@/config/colors";

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\s.\-\/()]{0,2}){7,}\d/;

const containsContactInfo = (text: string) =>
  EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);

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
      <Image
        src="/images/logo-tasky.png"
        alt="Tasky"
        width={28}
        height={28}
        className="object-contain"
      />
    </div>
  );
}

type Tab = "chat" | "infos";

interface Props {
  prestationId: string;
}

export default function SectionChat({ prestationId }: Props) {
  const { user } = useAuthStore();
  const { data, isLoading } = useMessages(prestationId);
  const sendMessage = useSendMessage(prestationId);
  const [contenu, setContenu] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMessages = data?.messages.filter((m) => !m.isSystem) ?? [];
  const systemMessages = data?.messages.filter((m) => m.isSystem) ?? [];

  useEffect(() => {
    if (activeTab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length, activeTab]);

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
      {/* Onglets */}
      <div className="flex">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b-3 ${
            activeTab === "chat"
              ? "bg-pink-50 text-pink-600 border-b-[3px] border-pink-400"
              : "bg-pink-50/30 text-pink-300 border-b-[3px] border-pink-100 hover:bg-pink-50 hover:text-pink-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>Messages</span>
          {other && (
            <span className={`text-xs font-normal hidden sm:inline ${activeTab === "chat" ? "text-pink-400" : "text-pink-200"}`}>
              — {other.firstName}
            </span>
          )}
        </button>

        {/* Séparateur vertical */}
        <div className="w-px bg-gray-200 self-stretch" />


        <button
          onClick={() => setActiveTab("infos")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-all ${
            activeTab === "infos"
              ? "bg-purple-50 text-purple-600 border-b-[3px] border-purple-400"
              : "bg-purple-50/30 text-purple-300 border-b-[3px] border-purple-100 hover:bg-purple-50 hover:text-purple-400"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Tasky-Infos</span>
          {systemMessages.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
              activeTab === "infos" ? "bg-purple-200 text-purple-700" : "bg-purple-100 text-purple-400"
            }`}>
              {systemMessages.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Onglet Chat ─────────────────────────────────────────────── */}
      {activeTab === "chat" && (
        <>
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
              chatMessages.map((msg) => {
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
        </>
      )}

      {/* ── Onglet Tasky-Infos ───────────────────────────────────────── */}
      {activeTab === "infos" && (
        <>
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex items-center gap-2">
          <TaskyAvatar />
          <div>
            <p className="text-xs font-semibold text-purple-700">Tasky-Infos</p>
            <p className="text-[11px] text-purple-500">Vous informe en temps réel de l'état de votre demande</p>
          </div>
        </div>
        <div className="h-64 overflow-y-auto px-4 py-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-400" />
            </div>
          ) : systemMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
              <div className="opacity-30">
                <TaskyAvatar />
              </div>
              <p className={`text-sm ${colors.text.muted} text-center`}>
                Aucune notification Tasky-Infos pour l'instant.
              </p>
            </div>
          ) : (
            [...systemMessages].reverse().map((msg) => {
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
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </>
      )}
    </div>
  );
}

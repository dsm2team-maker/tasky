"use client";

import React from "react";

export interface ThreadMessage {
  id: string;
  contenu: string;
  createdAt: string;
  auteurId: string | null;
}

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

export function groupByDate<T extends { createdAt: string }>(messages: T[]) {
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

interface SenderInfo {
  avatar?: string | null;
  fallback?: React.ReactNode;
}

interface Props<T extends ThreadMessage> {
  messages: T[];
  isRight: (msg: T) => boolean;
  sender: (msg: T) => SenderInfo | null;
  rightBubbleClass?: string;
  hideAvatarOnRight?: boolean;
  emptyIcon?: string;
  emptyLabel?: React.ReactNode;
}

export default function MessageThread<T extends ThreadMessage>({
  messages,
  isRight,
  sender,
  rightBubbleClass = "bg-pink-500 text-white rounded-br-sm",
  hideAvatarOnRight = true,
  emptyIcon = "💬",
  emptyLabel = "Aucun message.",
}: Props<T>) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="text-3xl mb-2">{emptyIcon}</div>
        <p className="text-sm text-gray-400 text-center">{emptyLabel}</p>
      </div>
    );
  }

  const groups = groupByDate(messages);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="flex items-center justify-center py-1.5">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
              {group.label}
            </span>
          </div>
          <div className="space-y-3">
            {group.messages.map((msg) => {
              const right = isRight(msg);
              const s = sender(msg);
              const showAvatar = !right || !hideAvatarOnRight;

              return (
                <div key={msg.id} className={`flex items-end gap-2 ${right ? "flex-row-reverse" : "flex-row"}`}>
                  {showAvatar && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mb-0.5">
                      {s?.avatar ? (
                        <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          {s?.fallback ?? "👤"}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${right ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        right ? rightBubbleClass : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {msg.contenu}
                    </div>
                    <span className="text-xs text-gray-400 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

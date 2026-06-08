"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Style par type ───────────────────────────────────────────────────────────

const STYLES: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: "bg-emerald-900/90",  border: "border-emerald-700", text: "text-emerald-100", icon: "✅" },
  error:   { bg: "bg-red-900/90",     border: "border-red-700",     text: "text-red-100",     icon: "❌" },
  warning: { bg: "bg-yellow-900/90",  border: "border-yellow-700",  text: "text-yellow-100",  icon: "⚠️" },
  info:    { bg: "bg-blue-900/90",    border: "border-blue-700",    text: "text-blue-100",    icon: "ℹ️" },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, "success"),
    error:   (m) => toast(m, "error"),
    info:    (m) => toast(m, "info"),
    warning: (m) => toast(m, "warning"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const s = STYLES[t.type];
          return (
            <div
              key={t.id}
              className={`
                ${s.bg} ${s.border} ${s.text}
                border rounded-xl px-4 py-3 shadow-xl
                flex items-center gap-3 min-w-[280px] max-w-sm
                animate-in slide-in-from-right-4 duration-300
                pointer-events-auto
              `}
            >
              <span className="text-base flex-shrink-0">{s.icon}</span>
              <span className="text-sm font-medium flex-1">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

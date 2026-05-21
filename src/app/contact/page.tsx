"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api-client";
import { colors } from "@/config/colors";
import { spacing } from "@/config/design-tokens";
import Logo from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { routes } from "@/config/routes";

const SUJETS = [
  "Question générale",
  "Litige en cours",
  "Problème technique",
  "Signalement",
  "Autre",
];

export default function ContactPage() {
  const { user, isAuthenticated } = useAuthStore();

  const [sujet, setSujet] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dashboardHref =
    user?.role === "PRESTATAIRE"
      ? routes.prestataire.dashboard
      : routes.client.dashboard;

  const handleSubmit = async () => {
    setError(null);
    if (!sujet) return setError("Veuillez choisir un sujet");
    if (message.trim().length < 20) return setError("Message trop court (minimum 20 caractères)");

    setIsLoading(true);
    try {
      await apiClient.post("/api/contact", {
        sujet,
        message: message.trim(),
        reference: reference.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      {/* Header minimal */}
      <header className={`bg-white shadow-sm border-b ${colors.border.light}`}>
        <div className={`${spacing.container} h-16 flex items-center justify-between`}>
          <Link href={isAuthenticated ? dashboardHref : "/"}>
            <Logo />
          </Link>
          {isAuthenticated && (
            <Link href={dashboardHref} className={`text-sm font-medium ${colors.text.secondary} hover:${colors.text.primary}`}>
              ← Retour
            </Link>
          )}
        </div>
      </header>

      <main className={`${spacing.container} py-12 max-w-2xl`}>

        {success ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">✅</div>
            <h2 className={`text-xl font-bold ${colors.text.primary} mb-2`}>Message envoyé !</h2>
            <p className={`text-sm ${colors.text.secondary} mb-6`}>
              Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
            </p>
            {isAuthenticated && (
              <Link href={dashboardHref}>
                <Button variant="secondary">Retour au tableau de bord</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className={`text-2xl font-bold ${colors.text.primary} mb-1`}>Nous contacter</h1>
              <p className={`text-sm ${colors.text.secondary}`}>
                Une question, un litige, un problème technique ? On vous répond rapidement.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">

              {/* Infos utilisateur */}
              {isAuthenticated && (
                <div className={`p-4 rounded-xl ${colors.background.gray} flex items-center gap-3`}>
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className={`text-sm font-semibold ${colors.text.primary}`}>
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className={`text-xs ${colors.text.muted}`}>{user?.email}</div>
                  </div>
                  <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${
                    user?.role === "PRESTATAIRE"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-pink-100 text-pink-700"
                  }`}>
                    {user?.role === "PRESTATAIRE" ? "Prestataire" : "Client"}
                  </span>
                </div>
              )}

              {/* Sujet */}
              <div>
                <label className={`block text-sm font-medium ${colors.text.primary} mb-2`}>
                  Sujet *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SUJETS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSujet(s)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium text-left border transition-all ${
                        sujet === s
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : `bg-white border-gray-200 ${colors.text.secondary} hover:border-gray-300`
                      }`}
                    >
                      {s === "Question générale" && "💬 "}
                      {s === "Litige en cours" && "⚖️ "}
                      {s === "Problème technique" && "🔧 "}
                      {s === "Signalement" && "🚨 "}
                      {s === "Autre" && "📝 "}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Référence TSK (optionnel) */}
              <div>
                <label className={`block text-sm font-medium ${colors.text.primary} mb-1.5`}>
                  Référence de la demande <span className={`text-xs font-normal ${colors.text.muted}`}>(optionnel)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  placeholder="TSK-000001"
                  maxLength={12}
                  className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-sm font-medium ${colors.text.primary} mb-1.5`}>
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez votre situation en détail..."
                  rows={6}
                  maxLength={2000}
                  className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none`}
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${message.length < 20 && message.length > 0 ? colors.error.text : colors.text.muted}`}>
                    {message.length > 0 && message.length < 20 ? `Minimum 20 caractères` : ""}
                  </span>
                  <span className={`text-xs ${colors.text.muted}`}>{message.length}/2000</span>
                </div>
              </div>

              {error && (
                <div className={`p-3 rounded-xl ${colors.error.bg} border ${colors.error.borderLight}`}>
                  <p className={`text-sm ${colors.error.text}`}>{error}</p>
                </div>
              )}

              <Button
                variant="secondary"
                fullWidth
                isLoading={isLoading}
                onClick={handleSubmit}
              >
                Envoyer le message
              </Button>

            </div>

            {/* Info délai */}
            <p className={`text-center text-xs ${colors.text.muted} mt-4`}>
              Nous répondons généralement sous 24h ouvrées.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useAuthStore } from "@/stores/auth-store";

const EMAIL_TYPES: { value: string; label: string; description: string }[] = [
  { value: "verify-email", label: "Vérification d'email", description: "Envoyé à l'inscription pour confirmer l'adresse email." },
  { value: "reset-password", label: "Réinitialisation mot de passe", description: "Envoyé lors d'une demande de mot de passe oublié." },
  { value: "new-message", label: "Nouveau message", description: "Envoyé quand un utilisateur reçoit un ou plusieurs nouveaux messages." },
  { value: "quote-received", label: "Devis reçu", description: "Envoyé au client quand un prestataire soumet un devis." },
  { value: "order-confirmed", label: "Prestation confirmée", description: "Envoyé après paiement, quand la prestation démarre." },
  { value: "order-completed", label: "Prestation terminée", description: "Envoyé quand la prestation est validée (manuellement ou auto)." },
  { value: "phone-change-otp", label: "OTP changement téléphone", description: "Code de vérification envoyé par email pour changer le numéro." },
  { value: "email-change-otp", label: "OTP changement email", description: "Code de vérification envoyé sur la nouvelle adresse email." },
  { value: "email-change-alert", label: "Alerte changement email", description: "Alerte de sécurité envoyée sur l'ancienne adresse." },
  { value: "devis-refuse", label: "Devis refusé", description: "Envoyé au prestataire quand son devis n'est pas retenu." },
  { value: "delete-account-otp", label: "OTP suppression de compte", description: "Code de vérification envoyé pour confirmer la suppression du compte." },
  { value: "demande-created", label: "Demande publiée", description: "Envoyé au client quand sa demande est publiée." },
  { value: "signalement-created", label: "Nouveau signalement", description: "Envoyé aux admins quand un signalement est déposé." },
  { value: "signalement-resolved", label: "Signalement traité", description: "Envoyé au client quand son signalement est résolu." },
  { value: "prestation-contested", label: "Prestation contestée", description: "Envoyé au prestataire quand le client conteste la validation." },
  { value: "account-status", label: "Statut du compte", description: "Envoyé lors d'une suspension ou réactivation de compte." },
  { value: "connect-onboarding-complete", label: "Paiements activés (Connect)", description: "Envoyé au prestataire quand son compte Stripe Connect est prêt." },
  { value: "transfer-completed", label: "Virement envoyé", description: "Envoyé au prestataire quand le virement de sa prestation est effectué." },
];

export default function AdminEmailsPage() {
  const user = useAuthStore((s) => s.user);
  const [type, setType] = useState(EMAIL_TYPES[0].value);
  const [to, setTo] = useState(user?.email ?? "");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const sendTest = useMutation({
    mutationFn: () => adminService.sendTestEmail(type, to),
    onSuccess: (res) => {
      setResult({ ok: true, message: res.data.message });
    },
    onError: (err: any) => {
      setResult({ ok: false, message: err?.response?.data?.message ?? "Erreur lors de l'envoi" });
    },
  });

  const selected = EMAIL_TYPES.find((t) => t.value === type);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">📧 Emails</h1>
        <p className="text-gray-400 text-sm mt-1">
          Envoyer un email de test pour vérifier le rendu d'un template. Désactivé en production.
        </p>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-xl">
        <label className="block text-sm text-gray-400 mb-2">Template</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm mb-1"
        >
          {EMAIL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        {selected && <p className="text-xs text-gray-500 mb-5">{selected.description}</p>}

        <label className="block text-sm text-gray-400 mb-2">Adresse email de destination</label>
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="test@exemple.com"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm mb-5"
        />

        <button
          onClick={() => {
            setResult(null);
            sendTest.mutate();
          }}
          disabled={sendTest.isPending || !to}
          className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors"
        >
          {sendTest.isPending ? "Envoi…" : "Envoyer l'email de test"}
        </button>

        {result && (
          <p className={`mt-4 text-sm ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
            {result.ok ? "✓ " : "✗ "}{result.message}
          </p>
        )}
      </div>
    </div>
  );
}

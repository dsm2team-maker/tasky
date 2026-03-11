"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";

const BIO_MAX = 500;
const BIO_MIN = 50;

export default function RegisterPrestataireStep3() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photo, setPhoto] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("prestataire_step1")) {
      router.push(routes.auth.register.prestataire.step1);
      return;
    }
    // Restaurer les données si on revient en arrière
    const saved = sessionStorage.getItem("prestataire_step3");
    if (saved) {
      try {
        const { bio: savedBio, photoData } = JSON.parse(saved);
        if (savedBio) setBio(savedBio);
        if (photoData) setPhoto(photoData);
      } catch {}
    }
  }, [router]);

  const handleStepClick = (step: number) => {
    if (step === 1) router.push(routes.auth.register.prestataire.step1);
    if (step === 2) router.push(routes.auth.register.prestataire.step2);
  };

  // ── Gestion photo ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La photo ne doit pas dépasser 5 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
    setError(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!photo) {
      setError("Veuillez ajouter une photo de profil");
      return;
    }
    if (bio.trim().length < BIO_MIN) {
      setError(`Votre présentation doit faire au moins ${BIO_MIN} caractères`);
      return;
    }
    setError(null);
    sessionStorage.setItem(
      "prestataire_step3",
      JSON.stringify({ bio: bio.trim(), hasPhoto: true, photoData: photo }),
    );
    router.push(routes.auth.register.prestataire.step4);
  };

  const bioLength = bio.length;
  const bioOk = bioLength >= BIO_MIN;

  return (
    <AuthLayout variant="prestataire">
      <ProgressSteps
        currentStep={3}
        totalSteps={4}
        completedSteps={[1, 2]}
        onStepClick={handleStepClick}
      />

      {/* ── Titre ── */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👤</div>
        <h1 className={`text-2xl font-bold ${colors.premium.text} mb-1`}>
          Présentez-vous aux clients
        </h1>
        <p className={`text-sm ${colors.premium.text}`}>
          Votre profil inspire confiance — soignez-le !
        </p>
      </div>

      {/* ── Erreur globale ── */}
      {error && (
        <div
          className={`mb-4 p-3 ${colors.error.bg} border ${colors.error.borderLight} rounded-xl`}
        >
          <p className={`${colors.error.text} text-sm text-center`}>
            ⚠️ {error}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* ══════════════════════════════════════════
            SECTION 1 — PHOTO DE PROFIL
        ══════════════════════════════════════════ */}
        <div
          className={`p-4 rounded-2xl border-2 ${photo ? colors.secondary.borderLight : colors.border.light} ${colors.background.white}`}
        >
          <p className={`text-sm font-semibold ${colors.text.primary} mb-3`}>
            📸 Ajoutez une photo de profil
          </p>

          <div className="flex items-center gap-4">
            {/* Avatar preview */}
            <div
              className={`relative w-20 h-20 rounded-full flex-shrink-0 overflow-hidden border-2 ${photo ? colors.secondary.border : "border-dashed border-gray-300"} bg-gray-50`}
            >
              {photo ? (
                <img
                  src={photo}
                  alt="Photo de profil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-3xl text-gray-300">👤</span>
                </div>
              )}
              {/* Overlay bouton retirer */}
              {photo && (
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium"
                >
                  ✕ Retirer
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 cursor-pointer transition-all text-sm font-medium ${
                  photo
                    ? `${colors.border.light} ${colors.text.secondary} hover:${colors.secondary.borderLight} hover:${colors.secondary.text}`
                    : `${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bg} hover:opacity-80`
                }`}
              >
                <span>🖼️</span>
                {photo ? "Changer la photo" : "Choisir une photo"}
              </label>
              <p className={`text-xs ${colors.text.tertiary} text-center`}>
                Utilisez une photo claire de votre visage · Max 5 Mo
              </p>
            </div>
          </div>

          {/* Indicateur de succès */}
          {photo && (
            <div
              className={`mt-3 flex items-center gap-2 text-xs ${colors.secondary.text} ${colors.secondary.bg} px-3 py-1.5 rounded-lg`}
            >
              <span>✓</span> Photo ajoutée avec succès
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            SECTION 2 — DESCRIPTION / BIO
        ══════════════════════════════════════════ */}
        <div
          className={`p-4 rounded-2xl border-2 ${bioOk ? colors.secondary.borderLight : colors.border.light} ${colors.background.white}`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold ${colors.text.primary}`}>
              ✍️ Parlez-nous de vous
            </p>
            <span
              className={`text-xs font-medium ${
                bioLength > BIO_MAX
                  ? colors.error.text
                  : bioOk
                    ? colors.secondary.text
                    : colors.text.tertiary
              }`}
            >
              {bioLength}/{BIO_MAX}
            </span>
          </div>

          <textarea
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setError(null);
            }}
            placeholder={`Parlez-nous de vous et de votre expérience\n\nEx : Couturière avec 10 ans d'expérience.\nJe réalise retouches, créations et personnalisations textiles.`}
            rows={5}
            maxLength={BIO_MAX}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 transition-all ${
              bioOk
                ? `${colors.secondary.borderLight} focus:ring-emerald-300 focus:border-emerald-400`
                : `${colors.border.default} focus:ring-gray-300`
            } text-gray-800 placeholder-gray-400`}
          />

          {/* Barre de progression */}
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                bioLength > BIO_MAX
                  ? "bg-red-400"
                  : bioOk
                    ? "bg-emerald-400"
                    : "bg-gray-300"
              }`}
              style={{
                width: `${Math.min((bioLength / BIO_MAX) * 100, 100)}%`,
              }}
            />
          </div>
          {!bioOk && bioLength > 0 && (
            <p className={`text-xs ${colors.text.tertiary} mt-1`}>
              Encore {BIO_MIN - bioLength} caractères minimum
            </p>
          )}

          {/* Guide */}
          <div
            className={`mt-3 p-3 ${colors.background.light} rounded-xl border ${colors.border.light}`}
          >
            <p
              className={`text-xs font-semibold ${colors.text.secondary} mb-1.5`}
            >
              💡 Conseils :
            </p>
            <ul className={`text-xs ${colors.text.secondary} space-y-1`}>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5">✦</span> Présentez
                votre expérience
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-400 mt-0.5">◆</span> Indiquez vos
                spécialités
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 mt-0.5">●</span> Mentionnez vos
                années de pratique
              </li>
            </ul>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push(routes.auth.register.prestataire.step2)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Retour
          </Button>
          <Button
            variant="secondary"
            type="button"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={!photo || !bioOk}
            className="text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuer →
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

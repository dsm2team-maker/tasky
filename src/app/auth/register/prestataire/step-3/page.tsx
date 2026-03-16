"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { ProfilePhotoUpload } from "@/components/shared/ProfilePhotoUpload";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";

const BIO_MAX = 500;
const BIO_MIN = 100;

export default function RegisterPrestataireStep3() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("prestataire_step1")) {
      router.push(routes.auth.register.prestataire.step1);
      return;
    }
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

      <div className="text-center mb-6">
        <div className="text-4xl mb-2">👤</div>
        <h1 className={`text-2xl font-bold ${colors.premium.text} mb-1`}>
          Présentez-vous aux clients
        </h1>
        <p className={`text-sm ${colors.premium.text}`}>
          Votre profil inspire confiance — soignez-le !
        </p>
      </div>

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
        {/* Photo — composant réutilisable */}
        <ProfilePhotoUpload
          photo={photo}
          onPhotoChange={setPhoto}
          onError={setError}
        />

        {/* Bio */}
        <div
          className={`p-4 rounded-2xl border-2 ${bioOk ? colors.secondary.borderLight : colors.border.light} ${colors.background.white}`}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-sm font-semibold ${colors.text.primary}`}>
              ✍️ Parlez-nous de vous
            </p>
            <span
              className={`text-xs font-medium ${bioLength > BIO_MAX ? colors.error.text : bioOk ? colors.secondary.text : colors.text.tertiary}`}
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

          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${bioLength > BIO_MAX ? "bg-red-400" : bioOk ? "bg-emerald-400" : "bg-gray-300"}`}
              style={{
                width: `${Math.min((bioLength / BIO_MAX) * 100, 100)}%`,
              }}
            />
          </div>
          {!bioOk && (
            <p className={`text-xs font-bold ${colors.premium.text} mt-1`}>
              Encore {BIO_MIN - bioLength} caractères minimum
            </p>
          )}

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

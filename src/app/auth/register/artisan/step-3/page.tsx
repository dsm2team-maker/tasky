"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Webcam from "react-webcam";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function RegisterArtisanStep3() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<"CNI" | "PASSPORT">("CNI");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Vérifier que step2 a été complété
  useEffect(() => {
    const step1Data = sessionStorage.getItem("artisan_step1");
    if (!step1Data) {
      router.push(routes.auth.register.artisan.step1);
    }
  }, [router]);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowWebcam(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!capturedImage) {
      setErrorMessage("Veuillez fournir une photo de votre document");
      return;
    }
    setErrorMessage(null);

    // ✅ Sauvegarder les infos identité dans sessionStorage
    sessionStorage.setItem(
      "artisan_step3",
      JSON.stringify({
        documentType,
        // On ne stocke pas l'image en sessionStorage (trop lourd)
        // Elle sera uploadée sur Cloudinary/S3 plus tard
        hasDocument: true,
      }),
    );

    router.push(routes.auth.register.artisan.step4);
  };

  return (
    <AuthLayout variant="artisan">
      <ProgressSteps currentStep={3} totalSteps={4} completedSteps={[1, 2]} />

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🛠️</div>
        <h1 className={`${typography.h2.base} ${colors.secondary.text} mb-2`}>
          Vérification d'identité
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Étape 3 : Confirmez votre identité
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Type de document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de document *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDocumentType("CNI")}
              className={`p-4 rounded-lg border-2 transition-all ${documentType === "CNI" ? `${colors.secondary.border} ${colors.secondary.bg}` : "border-gray-200 hover:border-gray-300"}`}
            >
              <div className="text-3xl mb-2">🪪</div>
              <div className="font-semibold">Carte d'identité</div>
            </button>
            <button
              type="button"
              onClick={() => setDocumentType("PASSPORT")}
              className={`p-4 rounded-lg border-2 transition-all ${documentType === "PASSPORT" ? `${colors.secondary.border} ${colors.secondary.bg}` : "border-gray-200 hover:border-gray-300"}`}
            >
              <div className="text-3xl mb-2">📘</div>
              <div className="font-semibold">Passeport</div>
            </button>
          </div>
        </div>

        {/* Webcam ou Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photo du document (RECTO) *
          </label>

          {!capturedImage && !showWebcam && (
            <div className="space-y-3">
              <Button
                type="button"
                fullWidth
                variant="outline"
                onClick={() => setShowWebcam(true)}
                className={`${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bgHover}`}
              >
                📷 Prendre une photo
              </Button>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${colors.secondary.bg} ${colors.secondary.text}`}
              />
            </div>
          )}

          {showWebcam && (
            <div className="space-y-3">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  fullWidth
                  variant="outline"
                  onClick={() => setShowWebcam(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  fullWidth
                  onClick={capture}
                  className={colors.secondary.base}
                >
                  📸 Capturer
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-3">
              <img
                src={capturedImage}
                alt="Document"
                className={`w-full rounded-lg border-2 ${colors.secondary.border}`}
              />
              <Button
                type="button"
                fullWidth
                variant="outline"
                onClick={() => setCapturedImage(null)}
                className="border-gray-300 text-gray-700"
              >
                🔄 Reprendre la photo
              </Button>
            </div>
          )}
        </div>

        {/* Info sécurité */}
        <div
          className={`${colors.info.bg} border ${colors.info.border} rounded-lg p-4`}
        >
          <div className="flex gap-3">
            <svg
              className={`w-5 h-5 ${colors.info.text} flex-shrink-0 mt-0.5`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className={`text-sm ${colors.info.textDark}`}>
              <strong>Vos données sont sécurisées.</strong> Nous vérifions votre
              identité pour garantir la confiance sur la plateforme.
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push(routes.auth.register.artisan.step2)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Retour
          </Button>
          <Button
            type="button"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
          >
            Continuer →
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}

"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Webcam from "react-webcam";
import {
  identityVerificationSchema,
  IdentityVerificationInput,
} from "@/lib/schemas";
import { apiClientUpload, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
export default function RegisterArtisanStep3() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const webcamRef = useRef<Webcam>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<"CNI" | "PASSPORT">("CNI");

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IdentityVerificationInput>({
    resolver: zodResolver(identityVerificationSchema),
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.auth.register.artisan.step1);
    }
  }, [isAuthenticated, router]);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setShowWebcam(false);

      // Convertir base64 en File
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], "identity-photo.jpg", {
            type: "image/jpeg",
          });
          setValue("identityDocument", file);
        });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValue("identityDocument", file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async (data: IdentityVerificationInput) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      router.push(routes.auth.register.artisan.step4);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: IdentityVerificationInput) => {
    setValue("documentType", documentType);
    verifyMutation.mutate({ ...data, documentType });
  };

  if (!isAuthenticated) {
    return null;
  }

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Type de document */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type de document *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDocumentType("CNI")}
              className={`p-4 rounded-lg border-2 transition-all ${
                documentType === "CNI"
                  ? `${colors.secondary.border} ${colors.secondary.bg}`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">🪪</div>
              <div className="font-semibold">Carte d'identité</div>
            </button>
            <button
              type="button"
              onClick={() => setDocumentType("PASSPORT")}
              className={`p-4 rounded-lg border-2 transition-all ${
                documentType === "PASSPORT"
                  ? `${colors.secondary.border} ${colors.secondary.bg}`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-3xl mb-2">📘</div>
              <div className="font-semibold">Passeport</div>
            </button>
          </div>
        </div>

        {/* Webcam ou Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photo du document (RECTO uniquement) *
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

              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${colors.secondary.bg} ${colors.secondary.text} hover:file:bg-emerald-100`}
                />
              </div>
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
                onClick={() => {
                  setCapturedImage(null);
                  setUploadedFile(null);
                }}
                className="border-gray-300 text-gray-700"
              >
                🔄 Reprendre la photo
              </Button>
            </div>
          )}

          {errors.identityDocument && (
            <p className={`mt-2 text-sm ${colors.error.text}`}>
              {errors.identityDocument.message}
            </p>
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
            type="submit"
            fullWidth
            size="lg"
            isLoading={verifyMutation.isPending}
            className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
          >
            Continuer →
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

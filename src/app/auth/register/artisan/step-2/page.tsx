"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { artisanProfileSchema, ArtisanProfileInput } from "@/lib/schemas";
import { apiClientUpload, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function RegisterArtisanStep2() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ArtisanProfileInput>({
    resolver: zodResolver(artisanProfileSchema),
    mode: "onBlur",
  });

  // Rediriger si pas authentifié
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push(routes.auth.register.artisan.step1);
    }
  }, [isAuthenticated, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("profilePicture", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const profileMutation = useMutation({
    mutationFn: async (data: ArtisanProfileInput) => {
      // MODE DÉMO - Simulation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      router.push(routes.auth.register.artisan.step3);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: ArtisanProfileInput) => {
    profileMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout variant="artisan">
      {/* Indicateur de progression */}
      <ProgressSteps currentStep={2} totalSteps={4} completedSteps={[1]} />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🛠️</div>
        <h1 className={`${typography.h2.base} ${colors.secondary.text} mb-2`}>
          Votre profil public
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Étape 2 : Présentez-vous à vos futurs clients
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Photo de profil */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo de profil *
          </label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold ${colors.secondary.bg} ${colors.secondary.text} hover:file:bg-emerald-100`}
              />
              {errors.profilePicture && (
                <p className={`mt-1 text-sm ${colors.error.text}`}>
                  {errors.profilePicture.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prénom */}
        <Input
          label="Prénom"
          type="text"
          placeholder="Jean"
          error={errors.firstName?.message}
          {...register("firstName")}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        {/* Nom */}
        <Input
          label="Nom"
          type="text"
          placeholder="Dupont"
          error={errors.lastName?.message}
          {...register("lastName")}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Bio / Présentation *
          </label>
          <textarea
            placeholder="Présentez vos compétences, votre expérience..."
            rows={4}
            className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${colors.secondary.focus} focus:border-transparent resize-none`}
            {...register("bio")}
          />
          {errors.bio && (
            <p className={`mt-1.5 text-sm ${colors.error.text}`}>
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* Code Postal */}
        <Input
          label="Code Postal"
          type="text"
          placeholder="75001"
          error={errors.postalCode?.message}
          {...register("postalCode")}
          icon={
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
        />

        {/* Boutons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push(routes.auth.register.artisan.step1)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Retour
          </Button>
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={profileMutation.isPending}
            className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
          >
            Continuer →
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

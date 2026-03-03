"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import {
  registerArtisanStep1Schema,
  RegisterArtisanStep1Input,
} from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function RegisterArtisanStep1() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterArtisanStep1Input>({
    resolver: zodResolver(registerArtisanStep1Schema),
    mode: "onBlur",
  });

  const emailValue = watch("email");
  const { isChecking, isAvailable } = useEmailValidation(emailValue);

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterArtisanStep1Input) => {
      // MODE DÉMO - Simulation sans backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        user: {
          id: "demo-artisan-" + Date.now(),
          email: data.email,
          role: "ARTISAN" as const,
          isVerified: false,
        },
        token: "demo-token-" + Math.random().toString(36).substring(7),
      };
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      router.push(routes.auth.register.artisan.step2);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: RegisterArtisanStep1Input) => {
    if (isAvailable === false) {
      alert("Cet email est déjà utilisé");
      return;
    }
    registerMutation.mutate(data);
  };

  return (
    <AuthLayout variant="artisan">
      {/* Indicateur de progression */}
      <ProgressSteps currentStep={1} totalSteps={4} completedSteps={[]} />

      {/* Header avec icône */}
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 ${colors.secondary.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className={`${typography.h2.base} ${colors.secondary.text} mb-2`}>
          Devenir prestataire
        </h1>
        <p className={`${colors.premium.text} font-medium`}>
          Étape 1 : Créez votre compte
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="relative">
          <Input
            label="Adresse email"
            type="email"
            placeholder="vous@exemple.com"
            error={errors.email?.message}
            {...register("email")}
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
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            }
          />
          {isChecking && (
            <p className={`mt-1.5 text-sm ${colors.text.tertiary}`}>
              Vérification...
            </p>
          )}
          {isAvailable === false && (
            <p className={`mt-1.5 text-sm ${colors.error.text}`}>
              Email déjà utilisé
            </p>
          )}
          {isAvailable === true && (
            <p className={`mt-1.5 text-sm ${colors.success.text}`}>
              Email disponible ✓
            </p>
          )}
        </div>

        {/* Mot de passe */}
        <div className="relative">
          <Input
            label="Mot de passe"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
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
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
          {/* ✅ AJOUT : Indicateur de force */}
          <PasswordStrengthIndicator password={watch("password") || ""} />
        </div>

        {/* Confirmation mot de passe */}
        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        {/* CGU */}
        <Checkbox
          label={
            <>
              J'accepte les{" "}
              <Link
                href="/legal/cgu"
                className="text-emerald-600 hover:underline"
              >
                conditions générales d'utilisation
              </Link>
            </>
          }
          error={errors.acceptTerms?.message}
          {...register("acceptTerms")}
        />

        {/* Bouton submit - EMERALD */}

        <Button
          variant="secondary"
          type="submit"
          fullWidth
          size="lg"
          isLoading={registerMutation.isPending}
          className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
        >
          Continuer →
        </Button>
      </form>

      {/* Lien retour */}
      <div className="mt-6 text-center">
        <p className={`text-sm ${colors.text.secondary}`}>
          Vous êtes client ?{" "}
          <Link
            href={routes.auth.register.client}
            className={`font-medium ${colors.premium.text} hover:underline`}
          >
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

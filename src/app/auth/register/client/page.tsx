"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { registerClientSchema, RegisterClientInput } from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { useEmailValidation } from "@/hooks/useEmailValidation";
import { Input } from "@/components/Input";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function RegisterClient() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterClientInput>({
    resolver: zodResolver(registerClientSchema),
    mode: "onBlur",
  });

  const emailValue = watch("email");
  const { isChecking, isAvailable } = useEmailValidation(emailValue);

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterClientInput) => {
      const response = await apiClient.post("/api/auth/register/client", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      router.push(routes.auth.verifyEmail + "?type=client");
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: RegisterClientInput) => {
    if (isAvailable === false) {
      alert("Cet email est déjà utilisé");
      return;
    }
    registerMutation.mutate(data);
  };

  return (
    <AuthLayout variant="client">
      {/* Header avec icône */}
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 ${colors.primary.gradient} rounded-full flex items-center justify-center mx-auto mb-4`}
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className={`${typography.h2.base} ${colors.primary.text} mb-2`}>
          Créer un compte client
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Rejoignez Tasky et trouvez des prestataires locaux
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
                href={routes.public.legal.cgu}
                className={`${colors.primary.text} hover:underline`}
              >
                conditions générales d'utilisation
              </Link>
            </>
          }
          error={errors.acceptTerms?.message}
          {...register("acceptTerms")}
        />

        {/* Bouton submit - PINK */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={registerMutation.isPending}
          className={`${colors.primary.gradient} ${colors.primary.gradientHover}`}
        >
          Créer mon compte
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span
            className={`px-3 py-1 ${colors.secondary.bg} ${colors.secondary.text} font-semibold rounded-full`}
          >
            Déjà inscrit ?
          </span>
        </div>
      </div>

      {/* Liens */}
      <div className="space-y-3">
        <Link href={routes.auth.login}>
          <Button
            variant="outline"
            fullWidth
            className={`${colors.primary.borderLight} ${colors.primary.text} ${colors.primary.bgHover} hover:border-pink-300`}
          >
            Se connecter
          </Button>
        </Link>

        <p className="text-center text-sm text-gray-600">
          Vous êtes prestataire ?{" "}
          <Link
            href={routes.auth.register.artisan.step1}
            className={`font-medium ${colors.secondary.text} hover:underline`}
          >
            Inscrivez-vous ici
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function ForgotPassword() {
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  const emailValue = watch("email");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordInput) => {
      // MODE DÉMO - Simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    forgotPasswordMutation.mutate(data);
  };

  if (emailSent) {
    return (
      <AuthLayout variant="neutral">
        {/* Succès - Email envoyé */}
        <div className="text-center">
          {/* Icône succès */}
          <div
            className={`w-20 h-20 ${colors.success.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <svg
              className={`w-10 h-10 ${colors.success.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>
            📧 Email envoyé !
          </h1>

          <p className="text-gray-600 mb-6">
            Si un compte existe avec l'adresse{" "}
            <strong className={colors.secondary.text}>{emailValue}</strong>,
            vous recevrez un email avec les instructions pour réinitialiser
            votre mot de passe.
          </p>

          {/* Instructions */}
          <div
            className={`${colors.info.bg} border ${colors.info.border} rounded-lg p-4 mb-6 text-left`}
          >
            <h3 className={`font-semibold ${colors.info.textDark} mb-2`}>
              📌 Que faire maintenant ?
            </h3>
            <ul className={`text-sm ${colors.info.textDark} space-y-1`}>
              <li>1. Vérifiez votre boîte email</li>
              <li>2. Cliquez sur le lien de réinitialisation</li>
              <li>3. Créez un nouveau mot de passe</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            💡 Pensez à vérifier vos spams si vous ne trouvez pas l'email
          </p>

          {/* Boutons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push(routes.auth.login)}
              fullWidth
              size="lg"
              className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
            >
              Retour à la connexion
            </Button>

            <button
              onClick={() => setEmailSent(false)}
              className={`w-full text-sm ${colors.secondary.text} hover:${colors.secondary.textDark} hover:underline font-medium`}
            >
              Renvoyer l'email
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="neutral">
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className={`${typography.h2.base} ${colors.text.primary} mb-2`}>
          Mot de passe oublié ?
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      {/* Info Box */}
      <div
        className={`${colors.warning.bg} border ${colors.warning.border} rounded-lg p-4 mb-6`}
      >
        <div className="flex gap-3">
          <svg
            className={`w-5 h-5 ${colors.warning.text} flex-shrink-0 mt-0.5`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className={`text-sm ${colors.warning.textDark}`}>
            Vous recevrez un email uniquement si cette adresse est enregistrée
            dans notre système.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.com"
          autoComplete="email"
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

        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={forgotPasswordMutation.isPending}
          className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
        >
          Envoyer le lien de réinitialisation
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span
            className={`px-3 py-1 ${colors.secondary.bg} ${colors.secondary.text} font-medium rounded-full`}
          >
            Vous vous souvenez ?
          </span>
        </div>
      </div>

      {/* Lien retour */}
      <div className="text-center">
        <Link href={routes.auth.login}>
          <Button
            variant="outline"
            fullWidth
            className={`${colors.secondary.borderLight} ${colors.secondary.text} ${colors.secondary.bgHover} hover:border-emerald-300`}
          >
            ← Retour à la connexion
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}

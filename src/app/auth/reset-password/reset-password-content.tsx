"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import AuthLayout from "@/components/layout/AuthLayout";
import { typography, gradients } from "@/config/design-tokens";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule requise")
      .regex(/[a-z]/, "Au moins une minuscule requise")
      .regex(/[0-9]/, "Au moins un chiffre requis")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial requis"),
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<"loading" | "valid" | "invalid" | "expired">("loading");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password");

  useEffect(() => {
    if (!passwordValue) { setPasswordStrength(0); return; }
    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/[a-z]/.test(passwordValue)) strength++;
    if (/[0-9]/.test(passwordValue)) strength++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;
    setPasswordStrength(strength);
  }, [passwordValue]);

  useEffect(() => {
    if (!token) { setTokenStatus("invalid"); return; }
    setTokenStatus("valid");
  }, [token]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const response = await apiClient.post(routes.api.auth.resetPassword, { token, password: data.password });
      return response.data;
    },
    onSuccess: () => {
      setResetSuccess(true);
      setTimeout(() => router.push(routes.auth.login), 3000);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];
  const strengthLabels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];

  if (tokenStatus === "loading") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center py-12">
          <div className={`w-16 h-16 border-4 ${colors.secondary.border} border-t-transparent`}></div>
          <p className="text-gray-600 font-medium">Vérification du lien...</p>
        </div>
      </AuthLayout>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>❌ Lien invalide</h1>
          <p className="text-gray-600 mb-6">Ce lien de réinitialisation est invalide ou a déjà été utilisé.</p>
          <Link href={routes.auth.forgotPassword}>
            <Button fullWidth size="lg">Demander un nouveau lien</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (tokenStatus === "expired") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>⏰ Lien expiré</h1>
          <p className="text-gray-600 mb-6">Les liens sont valables <strong>1 heure</strong> uniquement.</p>
          <Link href={routes.auth.forgotPassword}>
            <Button fullWidth size="lg">Demander un nouveau lien</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (resetSuccess) {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>🎉 Mot de passe mis à jour !</h1>
          <p className="text-gray-600 mb-6">Redirection automatique dans 3 secondes...</p>
          <Link href="/auth/login">
            <Button fullWidth size="lg">Se connecter maintenant →</Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="neutral">
      <div className="text-center mb-8">
        <h1 className={`${typography.h2.base} ${colors.text.primary} mb-2`}>Réinitialisez votre mot de passe</h1>
      </div>

      <div className={`${gradients.lightPrimary} border ${colors.primary.border} rounded-lg p-4 mb-6`}>
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={level} className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-200"}`} />
          ))}
        </div>
        {passwordStrength > 0 && (
          <p className={`text-xs font-medium ${passwordStrength >= 4 ? "text-green-600" : "text-gray-600"}`}>
            Force : {strengthLabels[passwordStrength - 1]}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit((data) => resetPasswordMutation.mutate(data))} className="space-y-5">
        <div className="relative">
          <Input
            label="Nouveau mot de passe"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirmer le mot de passe"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
            {showConfirmPassword ? "🙈" : "👁"}
          </button>
        </div>

        <Button type="submit" variant="premium" fullWidth size="lg" isLoading={resetPasswordMutation.isPending}>
          🔒 Réinitialiser mon mot de passe
        </Button>
      </form>

      <div className="mt-4">
        <Link href={routes.auth.login}>
          <Button variant="outline" fullWidth>Se connecter</Button>
        </Link>
      </div>
    </AuthLayout>
  );
}

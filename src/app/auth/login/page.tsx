"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, LoginInput } from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

// ✅ IMPORTS DU DESIGN SYSTEM
import { colors } from "@/config/colors";
import { typography, gradients } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post("/api/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);

      // ✅ Utilisation des routes du Design System
      if (data.user.role === "ARTISAN") {
        router.push(routes.artisan.dashboard);
      } else {
        router.push(routes.client.dashboard);
      }
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    // ✅ Background avec gradient du Design System
    <div
      className={`flex items-center justify-center min-h-screen ${gradients.lightSecondary}`}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="mb-8">
            <Link href={routes.public.home} className="flex items-center gap-2">
              <Image
                src="/images/logo-tasky2.png"
                alt="Tasky Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Header du formulaire */}
          <div className="text-center mb-8">
            {/* ✅ Icône avec gradient du Design System */}
            <div
              className={`w-16 h-16 ${gradients.neutral} rounded-full flex items-center justify-center mx-auto mb-4`}
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

            {/* ✅ Titre avec typography du Design System */}
            <h1 className={`${typography.h2.base} ${colors.neutral.text} mb-2`}>
              Connexion
            </h1>

            {/* ✅ Sous-titre avec couleur du Design System */}
            <p className={colors.text.secondary}>Accédez à votre compte</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
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

            {/* Mot de passe */}
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
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
            </div>

            {/* Mot de passe oublié */}
            <div className="text-right">
              {/* ✅ Route du Design System */}
              <Link
                href={routes.auth.forgotPassword}
                className={`text-sm ${colors.neutral.text} hover:underline`}
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton submit */}
            {/* ✅ Le Button utilise déjà le gradient primary par défaut */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={loginMutation.isPending}
            >
              Se connecter
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              {/* ✅ Badge avec couleurs du Design System */}
              <span
                className={`px-3 py-1 ${colors.primary.bg} ${colors.primary.text} font-bold rounded-full`}
              >
                Nouveau sur Tasky ?
              </span>
            </div>
          </div>

          {/* Liens d'inscription */}
          <div className="space-y-3">
            {/* ✅ Routes du Design System */}
            <Link href={routes.auth.register.client}>
              <Button
                variant="outline"
                fullWidth
                className={`${colors.primary.border} ${colors.primary.text} ${colors.primary.bgHover}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>👤</span>
                  <span>S'inscrire en tant que client</span>
                </div>
              </Button>
            </Link>

            <div className="h-1"></div>

            <Link href={routes.auth.register.artisan.step1}>
              <Button
                variant="outline"
                fullWidth
                className={`${colors.secondary.border} ${colors.secondary.text} ${colors.secondary.bgHover}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>🛠️</span>
                  <span>S'inscrire en tant qu'artisan</span>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

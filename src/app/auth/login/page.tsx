"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, LoginInput } from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";
import Logo from "@/components/Logo";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setAuth(data.data.user, data.data.tokens.accessToken);
      localStorage.setItem("refresh_token", data.data.tokens.refreshToken);
      if (data.data.user.role === "CLIENT") {
        router.push(routes.client.dashboard);
      } else {
        router.push(routes.prestataire.dashboard);
      }
    },
    onError: (error: any) => {
      setErrorMessage(handleApiError(error).message);
    },
  });

  const onSubmit = (data: LoginInput) => {
    setErrorMessage(null);
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout variant="neutral">
      <div className="text-center mb-8">
        <h1 className={`${typography.h2.base} ${colors.premium.text} mb-2`}>
          Connexion
        </h1>
        <p className={colors.premium.text}>Accédez à votre espace Tasky</p>
      </div>

      {errorMessage && (
        <div
          className={`mb-4 p-3 ${colors.error.bg} border ${colors.error.border} rounded-lg`}
        >
          <p className={`${colors.error.text} text-sm text-center`}>
            {errorMessage}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
        </div>

        <div className="flex justify-end">
          <Link
            href={routes.auth.forgotPassword}
            className={`text-sm ${colors.premium.text} hover:underline`}
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button
          variant="premium"
          type="submit"
          fullWidth
          size="lg"
          isLoading={loginMutation.isPending}
          className="text-white"
        >
          Se connecter
        </Button>
      </form>

      {/* Inscription */}
      <div className="mt-8">
        <p className={`text-center text-sm ${colors.text.secondary} mb-5`}>
          Pas encore de compte ?
        </p>
        <div className="flex flex-col gap-4">
          <Link href={routes.auth.register.client}>
            <div className="p-4 rounded-xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 hover:border-pink-400 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <div className="font-semibold text-pink-600">
                    S'inscrire en tant que client
                  </div>
                  <div className="text-xs text-pink-400">
                    Trouvez des prestataires pour vos projets
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link href={routes.auth.register.prestataire.step1}>
            <div
              className={`p-4 rounded-xl border-2 ${colors.secondary.borderLight} ${colors.secondary.bg} hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛠️</span>
                <div>
                  <div className={`font-semibold ${colors.secondary.text}`}>
                    S'inscrire en tant que prestataire
                  </div>
                  <div className={`text-xs ${colors.text.secondary}`}>
                    Proposez vos services et développez votre activité
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

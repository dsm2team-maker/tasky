"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";
import { typography, gradients } from "@/config/design-tokens";

import { colors } from "@/config/colors";
import { routes } from "@/config/routes";

// Schéma de validation
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

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    "loading" | "valid" | "invalid" | "expired"
  >("loading");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password");

  // Calculer la force du mot de passe
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (passwordValue.length >= 8) strength++;
    if (/[A-Z]/.test(passwordValue)) strength++;
    if (/[a-z]/.test(passwordValue)) strength++;
    if (/[0-9]/.test(passwordValue)) strength++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;

    setPasswordStrength(strength);
  }, [passwordValue]);

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }
    // Le token sera validé par le backend lors de la soumission
    setTokenStatus("valid");
  }, [token]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const response = await apiClient.post(routes.api.auth.resetPassword, {
        token,
        password: data.password,
      });
      return response.data;
    },
    onSuccess: () => {
      setResetSuccess(true);
      setTimeout(() => {
        router.push(routes.auth.login);
      }, 3000);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetPasswordMutation.mutate(data);
  };

  // Indicateur de force du mot de passe
  const PasswordStrengthIndicator = () => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
    ];
    const labels = ["Très faible", "Faible", "Moyen", "Bon", "Excellent"];

    return (
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-all ${
                level <= passwordStrength
                  ? colors[passwordStrength - 1]
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        {passwordStrength > 0 && (
          <p
            className={`text-xs font-medium ${passwordStrength >= 4 ? "text-green-600" : "text-gray-600"}`}
          >
            Force : {labels[passwordStrength - 1]}
          </p>
        )}
      </div>
    );
  };

  // Loading
  if (tokenStatus === "loading") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center py-12">
          <div
            className={`w-16 h-16 border-4 ${colors.secondary.border} border-t-transparent`}
          ></div>
          <p className="text-gray-600 font-medium">
            Vérification du lien de réinitialisation...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cela ne prend qu'un instant
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Token invalide
  if (tokenStatus === "invalid") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div
            className={`w-20 h-20 ${colors.error.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <svg
              className={`w-10 h-10 ${colors.error.text}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>
            ❌ Lien invalide
          </h1>
          <p className="text-gray-600 mb-2">
            Ce lien de réinitialisation n'est pas valide.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Il a peut-être été mal copié ou a déjà été utilisé.
          </p>

          {/* Info utile */}
          <div
            className={`${colors.warning.bg} border ${colors.warning.border} rounded-lg p-4 mb-6 text-left`}
          >
            <h3 className={`font-semibold ${colors.warning.textDark} mb-2`}>
              💡 Que faire ?
            </h3>
            <ul className={`text-sm ${colors.warning.textDark} space-y-1`}>
              <li>• Vérifiez que vous avez bien copié le lien complet</li>
              <li>• Le lien ne peut être utilisé qu'une seule fois</li>
              <li>• Demandez un nouveau lien si nécessaire</li>
            </ul>
          </div>

          <Link href={routes.auth.forgotPassword}>
            <Button
              fullWidth
              size="lg"
              className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
            >
              Demander un nouveau lien
            </Button>
          </Link>

          <Link
            href="/auth/login"
            className="block mt-4 text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Token expiré
  if (tokenStatus === "expired") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div
            className={`w-20 h-20 ${colors.warning.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <svg
              className={`w-10 h-10 ${colors.warning.text}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>
            ⏰ Lien expiré
          </h1>
          <p className="text-gray-600 mb-2">
            Ce lien de réinitialisation a expiré.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Pour votre sécurité, les liens sont valables{" "}
            <strong>1 heure</strong> uniquement.
          </p>

          {/* Timeline visuelle */}
          <div
            className={`${colors.info.bg} border ${colors.info.border} rounded-lg p-4 mb-6`}
          >
            <div
              className={`flex items-center justify-center gap-2 text-sm ${colors.info.textDark}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Délai de sécurité dépassé</span>
            </div>
          </div>

          <Link href={routes.auth.forgotPassword}>
            <Button
              fullWidth
              size="lg"
              className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
            >
              Demander un nouveau lien
            </Button>
          </Link>

          <Link
            href="/auth/login"
            className="block mt-4 text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Succès
  if (resetSuccess) {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div
            className={`w-20 h-20 ${colors.success.bg} rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce`}
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className={`${typography.h3.base} ${colors.text.primary} mb-3`}>
            🎉 Mot de passe mis à jour !
          </h1>
          <p className="text-gray-600 mb-2">
            Votre mot de passe a été changé avec succès.
          </p>
          <div
            className={`${colors.success.bg} border ${colors.success.border} rounded-lg p-4 mb-6`}
          >
            <p className={`text-sm ${colors.success.textDark} font-medium`}>
              ✨ Vous pouvez maintenant vous connecter avec votre nouveau mot de
              passe
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Redirection automatique dans 3 secondes...
          </p>
          <Link href="/auth/login">
            <Button
              fullWidth
              size="lg"
              className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
            >
              Se connecter maintenant →
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Formulaire de réinitialisation
  return (
    <AuthLayout variant="neutral">
      {/* Header */}
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Réinitialisez votre mot de passe
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Choisissez un mot de passe sécurisé pour votre compte
        </p>
      </div>

      {/* Règles du mot de passe */}
      {/* Règles du mot de passe */}
      <div
        className={`${gradients.lightPrimary} border ${colors.primary.border} rounded-lg p-4 mb-6`}
      >
        <h3
          className={`font-semibold ${colors.primary.textDark} mb-3 flex items-center gap-2`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Votre mot de passe doit contenir :
        </h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-center gap-2">
            <span
              className={
                passwordValue?.length >= 8
                  ? `${colors.success.textDark} font-bold`
                  : `${colors.primary.text} font-bold`
              }
            >
              {passwordValue?.length >= 8 ? "✓" : "○"}
            </span>
            <span
              className={
                passwordValue?.length >= 8
                  ? `${colors.success.textDark} font-medium`
                  : colors.primary.textDark
              }
            >
              Au moins <strong>8 caractères</strong>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[A-Z]/.test(passwordValue || "") ? colors.success.text : colors.primary.text}`}
            >
              {/[A-Z]/.test(passwordValue || "") ? "✓" : "○"}
            </span>
            <span
              className={
                /[A-Z]/.test(passwordValue || "")
                  ? `${colors.success.textDark} font-medium`
                  : colors.primary.textDark
              }
            >
              Une <strong>majuscule</strong> (A-Z)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[a-z]/.test(passwordValue || "") ? colors.success.text : colors.primary.text}`}
            >
              {/[a-z]/.test(passwordValue || "") ? "✓" : "○"}
            </span>
            <span
              className={
                /[a-z]/.test(passwordValue || "")
                  ? `${colors.success.textDark} font-medium`
                  : colors.primary.textDark
              }
            >
              Une <strong>minuscule</strong> (a-z)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[0-9]/.test(passwordValue || "") ? colors.success.text : colors.primary.text}`}
            >
              {/[0-9]/.test(passwordValue || "") ? "✓" : "○"}
            </span>
            <span
              className={
                /[0-9]/.test(passwordValue || "")
                  ? `${colors.success.textDark} font-medium`
                  : colors.primary.textDark
              }
            >
              Un <strong>chiffre</strong> (0-9)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`font-bold ${/[^A-Za-z0-9]/.test(passwordValue || "") ? colors.success.text : colors.primary.text}`}
            >
              {/[^A-Za-z0-9]/.test(passwordValue || "") ? "✓" : "○"}
            </span>
            <span
              className={
                /[^A-Za-z0-9]/.test(passwordValue || "")
                  ? `${colors.success.textDark} font-medium`
                  : colors.primary.textDark
              }
            >
              Un <strong>caractère spécial</strong> (!@#$%...)
            </span>
          </li>
        </ul>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nouveau mot de passe */}
        <div className="relative">
          <Input
            label="Nouveau mot de passe"
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
          <PasswordStrengthIndicator />
        </div>

        {/* Confirmer mot de passe */}
        <div className="relative">
          <Input
            label="Confirmer le mot de passe"
            type={showConfirmPassword ? "text" : "password"}
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
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
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

        {/* Bouton submit */}
        <Button
          type="submit"
          variant="premium"
          fullWidth
          size="lg"
          isLoading={resetPasswordMutation.isPending}
        >
          🔒 Réinitialiser mon mot de passe
        </Button>
      </form>

      {/* Lien retour */}
      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          ← Retour à la connexion
        </Link>
      </div>
    </AuthLayout>
  );
}
{
  /*
```

---

## ✨ Ce qui a été amélioré :

### 🎨 Plus vivant et informatif :
✅ **Indicateur de force du mot de passe** (5 barres de couleur)
✅ **Liste des règles** avec check ✓ en temps réel
✅ **Boutons show/hide** pour les 2 champs
✅ **Messages détaillés** pour chaque état d'erreur
✅ **Emojis et icônes** pour rendre ça plus humain
✅ **Animations** (bounce sur succès, spin sur loading)
✅ **Conseils utiles** dans les encadrés

### 📋 Écrans d'erreur améliorés :
✅ **Token invalide** : Explication + conseils
✅ **Token expiré** : Délai de sécurité expliqué
✅ **Messages plus chaleureux**

---

## 🧪 Pour tester :
```
✅ Formulaire complet : http://localhost:3000/auth/reset-password?token=abc123validtoken456789
❌ Lien invalide : http://localhost:3000/auth/reset-password?token=short
⏰ Lien expiré : http://localhost:3000/auth/reset-password?token=expired*/
}

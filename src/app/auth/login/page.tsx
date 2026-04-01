"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { loginSchema, LoginInput } from "@/lib/schemas";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Modal } from "@/components/ui/Modal";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

// ─── Schemas recover ────────────────────────────────────────────────────────
const recoverOtpSchema = z.object({
  otp: z
    .string()
    .length(6, "6 chiffres requis")
    .regex(/^\d{6}$/, "Chiffres uniquement"),
});
const recoverEmailSchema = z.object({
  newEmail: z.string().email("Format d'email invalide").toLowerCase(),
});

type RecoverOtpData = z.infer<typeof recoverOtpSchema>;
type RecoverEmailData = z.infer<typeof recoverEmailSchema>;

// ─── Timer ───────────────────────────────────────────────────────────────────
const OtpTimer: React.FC<{ seconds: number; onExpire: () => void }> = ({
  seconds,
  onExpire,
}) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return (
    <span
      className={`font-mono font-semibold ${remaining < 60 ? colors.error.text : colors.text.secondary}`}
    >
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  // États login
  const [errorType, setErrorType] = useState<
    | "USER_NOT_FOUND"
    | "WRONG_PASSWORD"
    | "EMAIL_NOT_VERIFIED"
    | "GENERIC"
    | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);

  // États récupération email
  const [recoverStep, setRecoverStep] = useState<
    null | "email" | "otp" | "new-email" | "success"
  >(null);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [recoverEmail, setRecoverEmail] = useState("");
  const [recoverPhoneMasked, setRecoverPhoneMasked] = useState("");
  const [recoverNewEmail, setRecoverNewEmail] = useState("");
  const [otpExpired, setOtpExpired] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setError = (
    type: typeof errorType,
    message: string | null,
    email?: string,
  ) => {
    setErrorType(type);
    setErrorMessage(message);
    setErrorEmail(email || null);
  };

  const clearError = () => {
    setErrorType(null);
    setErrorMessage(null);
    setErrorEmail(null);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const emailValue = watch("email");

  const loginMutation = useMutation({
    gcTime: 0,
    retry: false,
    mutationFn: async (data: LoginInput) => {
      const response = await apiClient.post("/api/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      clearError();
      setAuth(data.data.user, data.data.tokens.accessToken);
      localStorage.setItem("refresh_token", data.data.tokens.refreshToken);
      if (data.data.user.role === "CLIENT") {
        router.push(routes.client.dashboard);
      } else {
        router.push(routes.prestataire.dashboard);
      }
    },
    onError: (error: any) => {
      const code = error.response?.data?.code;
      const message = error.response?.data?.message;
      setError(
        code || "GENERIC",
        message || "Une erreur est survenue",
        emailValue,
      );
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  // ── Formulaires récupération email ────────────────────────────────────────
  const recoverEmailFormInput = useForm<{ email: string }>({
    resolver: zodResolver(
      z.object({ email: z.string().email("Format d'email invalide") }),
    ),
  });
  const recoverOtpForm = useForm<RecoverOtpData>({
    resolver: zodResolver(recoverOtpSchema),
  });
  const recoverNewEmailForm = useForm<RecoverEmailData>({
    resolver: zodResolver(recoverEmailSchema),
  });

  // Étape 1 — Envoyer OTP SMS à partir de l'email
  const sendOtpMutation = useMutation({
    mutationFn: (email: string) =>
      apiClient
        .post("/api/auth/recover-email/send-otp", { email })
        .then((r) => r.data),
    onSuccess: (data) => {
      setRecoverPhoneMasked(data.data?.phoneMasked || "");
      setRecoverStep("otp");
      setOtpExpired(false);
      setCooldown(120);
      recoverEmailFormInput.reset();
    },
    onError: (err: any) =>
      setRecoverError(err.response?.data?.message || "Erreur"),
  });

  // Étape 2 — Valider OTP + mettre à jour email
  const verifyAndUpdateMutation = useMutation({
    mutationFn: ({
      email,
      otp,
      newEmail,
    }: {
      email: string;
      otp: string;
      newEmail: string;
    }) =>
      apiClient
        .post("/api/auth/recover-email/verify-otp", { email, otp, newEmail })
        .then((r) => r.data),
    onSuccess: (data) => {
      setRecoverStep("success");
      recoverOtpForm.reset();
      recoverNewEmailForm.reset();
    },
    onError: (err: any) =>
      setRecoverError(err.response?.data?.message || "Erreur"),
  });

  const onRecoverEmailSubmit = (data: { email: string }) => {
    setRecoverError(null);
    setRecoverEmail(data.email);
    sendOtpMutation.mutate(data.email);
  };

  const onRecoverOtp = (data: RecoverOtpData) => {
    setRecoverError(null);
    setRecoverStep("new-email");
    recoverOtpForm.reset();
    sessionStorage.setItem("recover_otp", data.otp);
  };

  const onRecoverNewEmail = (data: RecoverEmailData) => {
    setRecoverError(null);
    const otp = sessionStorage.getItem("recover_otp") || "";
    setRecoverNewEmail(data.newEmail);
    verifyAndUpdateMutation.mutate({
      email: recoverEmail,
      otp,
      newEmail: data.newEmail,
    });
  };

  const onResendOtp = () => {
    if (cooldown > 0) return;
    sendOtpMutation.mutate(recoverEmail, {
      onSuccess: () => {
        setOtpExpired(false);
        setCooldown(120);
      },
    });
  };

  const closeRecover = () => {
    setRecoverStep(null);
    setRecoverError(null);
    recoverEmailFormInput.reset();
    recoverOtpForm.reset();
    recoverNewEmailForm.reset();
    sessionStorage.removeItem("recover_otp");
  };

  return (
    <AuthLayout variant="neutral">
      <div className="text-center mb-8">
        <h1 className={`${typography.h2.base} ${colors.premium.text} mb-2`}>
          Connexion
        </h1>
        <p className={colors.premium.text}>Accedez a votre espace Tasky</p>
      </div>

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

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setRecoverError(null);
              setRecoverStep("email");
            }}
            className={`text-sm ${colors.text.tertiary} hover:underline`}
          >
            Je n'ai plus accès à mon email
          </button>
          <Link
            href={routes.auth.forgotPassword}
            className={`text-sm ${colors.premium.text} hover:underline`}
          >
            Mot de passe oublie ?
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
          <Link href={routes.auth.register.prestataire}>
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
                    Proposez vos services et developpez votre activite
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Pop-up compte inexistant */}
      <Modal
        isOpen={errorType === "USER_NOT_FOUND"}
        onClose={clearError}
        title="Compte introuvable"
        icon="❓"
        headerVariant="error"
      >
        <div className="text-center">
          <p className={`text-sm ${colors.text.secondary} mb-5`}>
            Aucun compte Tasky n'est associe a cette adresse email.
            <br />
            Souhaitez-vous creer un compte ?
          </p>
          <div className="flex flex-col gap-3">
            <Link href={routes.auth.register.client}>
              <button
                type="button"
                onClick={clearError}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm border-2 border-pink-300 text-pink-600 bg-pink-50 hover:bg-pink-100 transition"
              >
                Creer un compte client
              </button>
            </Link>
            <Link href={routes.auth.register.prestataire}>
              <button
                type="button"
                onClick={clearError}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm border-2 border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition"
              >
                Creer un compte prestataire
              </button>
            </Link>
            <button
              type="button"
              onClick={clearError}
              className={`w-full py-2 text-sm ${colors.text.tertiary} transition`}
            >
              Annuler
            </button>
          </div>
        </div>
      </Modal>

      {/* Pop-up mot de passe incorrect */}
      <Modal
        isOpen={errorType === "WRONG_PASSWORD"}
        onClose={clearError}
        title="Mot de passe incorrect"
        icon="🔑"
        headerVariant="error"
      >
        <div className="text-center">
          <p className={`text-sm ${colors.text.secondary} mb-5`}>
            Le mot de passe saisi ne correspond pas a ce compte.
            <br />
            Voulez-vous le reinitialiser ?
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`${routes.auth.forgotPassword}?email=${encodeURIComponent(errorEmail || "")}`}
            >
              <button
                type="button"
                onClick={clearError}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-sm ${colors.premium.gradient} hover:opacity-90 transition`}
              >
                Reinitialiser mon mot de passe
              </button>
            </Link>
            <button
              type="button"
              onClick={clearError}
              className={`w-full py-2 text-sm ${colors.text.tertiary} transition`}
            >
              Ressayer
            </button>
          </div>
        </div>
      </Modal>

      {/* Pop-up email non verifie */}
      <Modal
        isOpen={errorType === "EMAIL_NOT_VERIFIED"}
        onClose={clearError}
        title="Email non verifie"
        icon="📧"
        headerVariant="premium"
      >
        <div className="text-center">
          <p className={`text-sm ${colors.text.secondary} mb-5`}>
            Verifiez votre email avant de vous connecter.
            <br />
            Consultez votre boite de reception.
          </p>
          <div className="flex flex-col gap-3">
            <Link href={routes.auth.verifyEmail}>
              <button
                type="button"
                onClick={clearError}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-sm ${colors.premium.gradient} hover:opacity-90 transition`}
              >
                Renvoyer l'email de verification
              </button>
            </Link>
            <button
              type="button"
              onClick={clearError}
              className={`w-full py-2 text-sm ${colors.text.tertiary} transition`}
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Pop-up erreur generique */}
      <Modal
        isOpen={errorType === "GENERIC"}
        onClose={clearError}
        title="Une erreur est survenue"
        icon="⚠️"
        headerVariant="error"
      >
        <div className="text-center">
          <p className={`text-sm ${colors.text.secondary} mb-5`}>
            {errorMessage}
          </p>
          <button
            type="button"
            onClick={clearError}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-white text-sm ${colors.premium.gradient} hover:opacity-90 transition`}
          >
            Fermer
          </button>
        </div>
      </Modal>
      {/* ════ MODAL RÉCUPÉRATION EMAIL ════ */}
      <Modal
        isOpen={recoverStep !== null}
        onClose={recoverStep === "success" ? closeRecover : () => {}}
        title={
          recoverStep === "email"
            ? "Récupérer mon accès"
            : recoverStep === "otp"
              ? "Code de vérification SMS"
              : recoverStep === "new-email"
                ? "Nouvelle adresse email"
                : "✅ Email mis à jour"
        }
        icon={recoverStep === "success" ? "✅" : "🔐"}
        headerVariant="premium"
      >
        {/* État 1 — Saisie ancienne adresse email */}
        {recoverStep === "email" && (
          <form
            onSubmit={recoverEmailFormInput.handleSubmit(onRecoverEmailSubmit)}
            className="space-y-4"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              Saisissez l'adresse email de votre compte. Un code de vérification
              sera envoyé par <strong>SMS</strong> sur le numéro associé.
            </p>
            <Input
              label="Votre adresse email actuelle"
              type="email"
              placeholder="vous@exemple.com"
              error={recoverEmailFormInput.formState.errors.email?.message}
              {...recoverEmailFormInput.register("email")}
            />
            {recoverError && (
              <p className={`text-sm ${colors.error.text}`}>{recoverError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={closeRecover}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={sendOtpMutation.isPending}
              >
                Envoyer le code
              </Button>
            </div>
          </form>
        )}

        {/* État 2 — Saisie OTP SMS */}
        {recoverStep === "otp" && (
          <form
            onSubmit={recoverOtpForm.handleSubmit(onRecoverOtp)}
            className="space-y-4"
          >
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${colors.success.bg}`}
            >
              <span>✅</span>
              <p className={`text-sm ${colors.success.textDark}`}>
                Code envoyé au{" "}
                <strong>{recoverPhoneMasked || "votre numéro"}</strong>
              </p>
            </div>
            <Input
              label="Code SMS (6 chiffres)"
              type="text"
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              error={recoverOtpForm.formState.errors.otp?.message}
              {...recoverOtpForm.register("otp")}
            />
            <div className="flex items-center justify-between text-sm">
              <span className={colors.text.secondary}>
                ⏱️ Valable :{" "}
                {!otpExpired ? (
                  <OtpTimer
                    seconds={600}
                    onExpire={() => setOtpExpired(true)}
                  />
                ) : (
                  <span className={colors.error.text}>Expiré</span>
                )}
              </span>
              <button
                type="button"
                onClick={onResendOtp}
                disabled={cooldown > 0}
                className={`font-medium ${cooldown > 0 ? colors.text.muted : colors.premium.text} disabled:cursor-not-allowed`}
              >
                🔄 {cooldown > 0 ? `Renvoyer (${cooldown}s)` : "Renvoyer"}
              </button>
            </div>
            {recoverError && (
              <p className={`text-sm ${colors.error.text}`}>{recoverError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setRecoverStep("email");
                  recoverOtpForm.reset();
                }}
              >
                Retour
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Continuer
              </Button>
            </div>
          </form>
        )}

        {/* État 3 — Saisie nouvel email */}
        {recoverStep === "new-email" && (
          <form
            onSubmit={recoverNewEmailForm.handleSubmit(onRecoverNewEmail)}
            className="space-y-4"
          >
            <p className={`text-sm ${colors.text.secondary}`}>
              Saisissez votre nouvelle adresse email. Un lien de
              réinitialisation de mot de passe vous sera envoyé.
            </p>
            <Input
              label="Nouvelle adresse email"
              type="email"
              placeholder="nouveau@email.com"
              error={recoverNewEmailForm.formState.errors.newEmail?.message}
              {...recoverNewEmailForm.register("newEmail")}
            />
            {recoverError && (
              <p className={`text-sm ${colors.error.text}`}>{recoverError}</p>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setRecoverStep("otp");
                  recoverNewEmailForm.reset();
                }}
              >
                Retour
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={verifyAndUpdateMutation.isPending}
              >
                Mettre à jour
              </Button>
            </div>
          </form>
        )}

        {/* État 4 — Succès */}
        {recoverStep === "success" && (
          <div className="space-y-4">
            <p
              className={`text-sm ${colors.text.secondary} text-center leading-relaxed`}
            >
              Votre nouvelle adresse email est maintenant enregistrée.
            </p>
            <div
              className={`p-4 rounded-xl ${colors.info.bg} border ${colors.info.borderLight} text-center`}
            >
              <p className={`text-xs ${colors.text.tertiary} mb-1`}>
                Un email de réinitialisation de mot de passe a été envoyé à :
              </p>
              <p className={`text-sm font-bold ${colors.text.primary}`}>
                {recoverNewEmail}
              </p>
              <p className={`text-xs ${colors.text.tertiary} mt-2`}>
                Veuillez consulter votre boîte mail pour définir un nouveau mot
                de passe.
              </p>
            </div>
            <p className={`text-xs ${colors.text.tertiary} text-center`}>
              📩 Vérifiez vos spams si besoin.
            </p>
            <Button variant="primary" fullWidth onClick={closeRecover}>
              Fermer
            </Button>
          </div>
        )}
      </Modal>
    </AuthLayout>
  );
}

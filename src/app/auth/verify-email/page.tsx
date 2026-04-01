"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import { Modal } from "@/components/ui/Modal";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { gradients } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const type = searchParams?.get("type");

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "pending" | "success" | "invalid" | "expired"
  >("loading");
  const [userEmail, setUserEmail] = useState("votre@email.com");
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setVerificationStatus("pending");
      const storedEmail = localStorage.getItem("pending_verification_email");
      if (storedEmail) setUserEmail(storedEmail);
      return;
    }
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      try {
        await apiClient.get(`/api/auth/verify-email?token=${token}`);
        setVerificationStatus("success");
      } catch (error: any) {
        const msg = error.response?.data?.message || "";
        if (msg.includes("expiré")) {
          setVerificationStatus("expired");
        } else {
          setVerificationStatus("invalid");
        }
      }
    };
    verifyToken();
  }, [token]);

  useEffect(() => {
    if (verificationStatus === "success") {
      const timer = setTimeout(() => handleGoToLogin(), 3000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus]);

  const resendEmailMutation = useMutation({
    mutationFn: async () => {
      const email = localStorage.getItem("pending_verification_email");
      await apiClient.post("/api/auth/resend-verification", { email });
    },
    onSuccess: () => setSuccessModal(true),
    onError: (error: any) => {
      const apiError = handleApiError(error);
      setErrorModal(apiError.message);
    },
  });

  const handleGoToLogin = () => {
    localStorage.removeItem("pending_verification_email");
    router.push(routes.auth.login);
  };

  // ── Loading ──
  if (verificationStatus === "loading") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center py-12">
          <div
            className={`w-16 h-16 border-4 ${colors.secondary.border} border-t-transparent rounded-full animate-spin mx-auto mb-4`}
          ></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vérification de votre email...
          </h2>
          <p className="text-gray-600">Patientez quelques instants</p>
        </div>
      </AuthLayout>
    );
  }

  // ── Pending ──
  if (verificationStatus === "pending") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div
            className={`w-20 h-20 ${gradients.neutral} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <svg
              className={`w-10 h-10 ${colors.neutral.text}`}
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

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            📧 Vérifiez votre email
          </h1>
          <p className="text-gray-600 mb-2">
            Un email de confirmation a été envoyé à :
          </p>
          <p className={`${colors.premium.text} font-bold text-lg mb-6`}>
            {userEmail}
          </p>

          <div
            className={`${gradients.neutral} border ${colors.info.border} rounded-lg p-5 mb-6 text-left`}
          >
            <h3
              className={`font-semibold ${colors.info.textDark} mb-3 flex items-center gap-2`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Que faire maintenant ?
            </h3>
            <ol className={`text-sm ${colors.info.textDark} space-y-2`}>
              <li className="flex items-start gap-2">
                <span
                  className={`font-bold ${colors.neutral.text} flex-shrink-0`}
                >
                  1.
                </span>
                <span>Ouvrez votre boîte email</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`font-bold ${colors.neutral.text} flex-shrink-0`}
                >
                  2.
                </span>
                <span>
                  Cherchez un email de <strong>Tasky</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`font-bold ${colors.neutral.text} flex-shrink-0`}
                >
                  3.
                </span>
                <span>Cliquez sur le lien de vérification</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  className={`font-bold ${colors.neutral.text} flex-shrink-0`}
                >
                  4.
                </span>
                <span>Votre compte sera activé instantanément</span>
              </li>
            </ol>
          </div>

          <div
            className={`${colors.warning.bg} border ${colors.warning.border} rounded-lg p-4 mb-6`}
          >
            <div className="flex items-start gap-3">
              <svg
                className={`w-5 h-5 ${colors.warning.text} flex-shrink-0 mt-0.5`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className={`text-sm ${colors.warning.textDark}`}>
                <strong>Email introuvable ?</strong> Vérifiez vos{" "}
                <strong>spams/courrier indésirable</strong> !
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="premium"
              onClick={() => resendEmailMutation.mutate()}
              fullWidth
              size="lg"
              isLoading={resendEmailMutation.isPending}
            >
              📨 Renvoyer l'email de vérification
            </Button>
            <p className="text-xs text-gray-500">
              Le lien expire dans <strong>24 heures</strong>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 py-1 bg-white text-gray-500 rounded-full"></span>
            </div>
          </div>

          <div className="text-sm">
            <Link
              href={routes.auth.login}
              className={`w-5 h-5 ${colors.premium.text} flex-shrink-0 mt-0.5`}
            >
              ← Se connecter
            </Link>
          </div>
        </div>

        {/* Modal succès renvoi email */}
        <Modal
          isOpen={successModal}
          onClose={() => setSuccessModal(false)}
          title="Email envoyé !"
          icon="📧"
          headerVariant="success"
        >
          <div className="text-center">
            <p className={`text-sm ${colors.text.secondary} mb-4`}>
              Un nouvel email de vérification a été envoyé à{" "}
              <strong>{userEmail}</strong>.
            </p>
            <p className={`text-xs ${colors.text.tertiary} mb-5`}>
              Pensez à vérifier vos spams si vous ne le trouvez pas.
            </p>
            <Button
              variant="premium"
              fullWidth
              onClick={() => setSuccessModal(false)}
            >
              OK
            </Button>
          </div>
        </Modal>

        {/* Modal erreur */}
        <Modal
          isOpen={!!errorModal}
          onClose={() => setErrorModal(null)}
          title="Une erreur est survenue"
          icon="⚠️"
          headerVariant="error"
        >
          <div className="text-center">
            <p className={`text-sm ${colors.text.secondary} mb-5`}>
              {errorModal}
            </p>
            <Button fullWidth onClick={() => setErrorModal(null)}>
              Fermer
            </Button>
          </div>
        </Modal>
      </AuthLayout>
    );
  }

  // ── Success ──
  if (verificationStatus === "success") {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            🎉 Email vérifié !
          </h1>
          <p className="text-gray-600 mb-2">
            Votre compte a été activé avec succès.
          </p>
          <div
            className={`${gradients.lightSecondary} border-2 ${colors.secondary.border} rounded-lg p-6 mb-6`}
          >
            <h3
              className={`font-bold ${colors.secondary.textDark} mb-2 text-lg`}
            >
              ✨ Bienvenue sur Tasky !
            </h3>
            <p className={`text-sm ${colors.secondary.textDark}`}>
              {type === "client"
                ? "Vous pouvez maintenant publier vos demandes et trouver des prestataires locaux."
                : "Vous pouvez maintenant proposer vos services et recevoir des demandes de clients."}
            </p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Redirection vers la connexion dans 3 secondes...
          </p>
          <Button
            onClick={handleGoToLogin}
            fullWidth
            size="lg"
            className={`${colors.premium.gradient} ${colors.premium.gradientHover}`}
          >
            Se connedddter →
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // ── Invalid ──
  if (verificationStatus === "invalid") {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ❌ Lien de vérification invalide
          </h1>
          <p className="text-gray-600 mb-2">
            Ce lien n'est pas valide ou a déjà été utilisé.
          </p>
          <div
            className={`${colors.warning.bg} border ${colors.warning.border} rounded-lg p-4 mb-6 text-left`}
          >
            <h3 className={`font-semibold ${colors.warning.textDark} mb-2`}>
              💡 Causes possibles :
            </h3>
            <ul className={`text-sm ${colors.warning.textDark} space-y-1`}>
              <li>• Le lien a été mal copié/collé</li>
              <li>• Le lien a déjà été utilisé</li>
              <li>• Vous avez déjà vérifié votre email</li>
            </ul>
          </div>
          <Button
            onClick={() => resendEmailMutation.mutate()}
            fullWidth
            size="lg"
            isLoading={resendEmailMutation.isPending}
            className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
          >
            Renvoyer un nouveau lien
          </Button>
          <Link href={routes.auth.login} className="block mt-4">
            <Button
              variant="outline"
              fullWidth
              size="lg"
              className={`${colors.primary.border} ${colors.primary.text} ${colors.primary.bgHover}`}
            >
              Essayer de se connecter
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // ── Expired ──
  if (verificationStatus === "expired") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div
            className={`w-20 h-20 ${colors.warning.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <svg
              className={`w-10 h-10 ${colors.warning.text}`}
              fill="none"
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            ⏰ Lien de vérification expiré
          </h1>
          <p className="text-gray-600 mb-2">
            Ce lien de vérification a expiré.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Les liens sont valables <strong>24 heures</strong>.
          </p>
          <div
            className={`${colors.info.bg} border ${colors.info.border} rounded-lg p-4 mb-6`}
          >
            <p className={`text-sm ${colors.info.textDark}`}>
              <strong>Pas d'inquiétude !</strong> Cliquez ci-dessous pour
              recevoir un nouveau lien.
            </p>
          </div>
          <Button
            onClick={() => resendEmailMutation.mutate()}
            fullWidth
            size="lg"
            isLoading={resendEmailMutation.isPending}
            className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
          >
            Recevoir un nouveau lien
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return null;
}

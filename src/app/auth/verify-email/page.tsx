"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { apiClient, handleApiError } from "@/lib/api-client";
import { Button } from "@/components/Button";
import AuthLayout from "@/components/AuthLayout";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const type = searchParams?.get("type"); // "client" ou "artisan"

  const [verificationStatus, setVerificationStatus] = useState<
    "loading" | "pending" | "success" | "invalid" | "expired"
  >("loading");
  const [userEmail, setUserEmail] = useState("votre@email.com");

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      // Pas de token = Page d'attente après inscription
      setVerificationStatus("pending");
      // Récupérer l'email depuis le localStorage (mode démo)
      const storedEmail = localStorage.getItem("pending_verification_email");
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
      return;
    }

    // MODE DÉMO - Vérification du token
    const verifyToken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (token === "expired") {
        setVerificationStatus("expired");
      } else if (token.length < 10) {
        setVerificationStatus("invalid");
      } else {
        setVerificationStatus("success");
      }
    };

    verifyToken();
  }, [token]);

  // ✅ CORRECTION : Auto-redirection déplacée ICI (avant les conditions)
  useEffect(() => {
    if (verificationStatus === "success") {
      const timer = setTimeout(() => {
        handleGoToDashboard();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verificationStatus]);

  // Mutation pour renvoyer l'email
  const resendEmailMutation = useMutation({
    mutationFn: async () => {
      // MODE DÉMO - Simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      alert("✅ Email de vérification renvoyé avec succès !");
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const handleResendEmail = () => {
    resendEmailMutation.mutate();
  };

  const handleGoToDashboard = () => {
    if (type === "client") {
      router.push("/client/dashboard");
    } else if (type === "artisan") {
      router.push("/artisan/dashboard");
    } else {
      router.push("/");
    }
  };

  // Loading - Vérification du token en cours
  if (verificationStatus === "loading") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Vérification de votre email...
          </h2>
          <p className="text-gray-600">Patientez quelques instants</p>
        </div>
      </AuthLayout>
    );
  }

  // Pending - En attente de vérification (après inscription)
  if (verificationStatus === "pending") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          {/* Icône email */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-blue-600"
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
          <p className="text-emerald-600 font-bold text-lg mb-6">{userEmail}</p>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Que faire maintenant ?
            </h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  1.
                </span>
                <span>Ouvrez votre boîte email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  2.
                </span>
                <span>
                  Cherchez un email de <strong>Tasky</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  3.
                </span>
                <span>Cliquez sur le lien de vérification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600 flex-shrink-0">
                  4.
                </span>
                <span>Votre compte sera activé instantanément</span>
              </li>
            </ol>
          </div>

          {/* Info spam */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-amber-800">
                <strong>Email introuvable ?</strong> Vérifiez vos{" "}
                <strong>spams/courrier indésirable</strong> ! Parfois, nos
                emails atterrissent là par erreur.
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              fullWidth
              size="lg"
              isLoading={resendEmailMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              📨 Renvoyer l'email de vérification
            </Button>

            <p className="text-xs text-gray-500">
              Le lien de vérification expire dans <strong>24 heures</strong>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 py-1 bg-white text-gray-500 rounded-full">
                Besoin d'aide ?
              </span>
            </div>
          </div>

          {/* Liens utiles */}
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              Mauvaise adresse email ?{" "}
              <Link
                href="/auth/register/client"
                className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Créer un nouveau compte
              </Link>
            </p>
            <p className="text-gray-600">
              <Link
                href="/"
                className="font-medium text-gray-700 hover:text-gray-900 hover:underline"
              >
                ← Retour à l'accueil
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success - Email vérifié avec succès
  if (verificationStatus === "success") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          {/* Icône succès avec animation */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg
              className="w-10 h-10 text-green-600"
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

          {/* Message de bienvenue */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-emerald-900 mb-2 text-lg">
              ✨ Bienvenue sur Tasky !
            </h3>
            <p className="text-sm text-emerald-800">
              {type === "client"
                ? "Vous pouvez maintenant publier vos demandes et trouver des prestataires locaux."
                : "Vous pouvez maintenant proposer vos services et recevoir des demandes de clients."}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Redirection automatique vers votre tableau de bord dans 3
            secondes...
          </p>

          {/* Bouton manuel */}
          <Button
            onClick={handleGoToDashboard}
            fullWidth
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Accéder à mon tableau de bord →
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Invalid - Token invalide

  if (verificationStatus === "invalid") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-red-600"
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
            Ce lien n'est pas valide ou a été mal copié.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-amber-900 mb-2">
              💡 Causes possibles :
            </h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Le lien a été mal copié/collé</li>
              <li>• Le lien a déjà été utilisé</li>
              <li>• Vous avez déjà vérifié votre email</li>
            </ul>
          </div>

          {/* ✅ MODIFICATION : space-y-4 + couleurs roses */}
          {/* ✅ MODIFICATION : Ajout de margin-top sur le 2ème bouton */}
          <div>
            <Button
              onClick={handleResendEmail}
              fullWidth
              size="lg"
              isLoading={resendEmailMutation.isPending}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              Renvoyer un nouveau lien
            </Button>

            <Link href="/auth/login" className="block mt-4">
              <Button
                variant="outline"
                fullWidth
                size="lg"
                className="border-pink-600 text-pink-600 hover:bg-pink-50 hover:border-pink-700"
              >
                Essayer de se connecter
              </Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Expired - Token expiré
  if (verificationStatus === "expired") {
    return (
      <AuthLayout variant="neutral">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-orange-600"
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
            Pour votre sécurité, les liens de vérification sont valables{" "}
            <strong>24 heures</strong>.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Pas d'inquiétude !</strong> Cliquez sur le bouton
              ci-dessous pour recevoir un nouveau lien.
            </p>
          </div>

          <Button
            onClick={handleResendEmail}
            fullWidth
            size="lg"
            isLoading={resendEmailMutation.isPending}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            Recevoir un nouveau lien
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return null;
}

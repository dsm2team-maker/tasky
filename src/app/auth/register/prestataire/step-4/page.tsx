"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { prestataireTermsSchema, PrestataireTermsInput } from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function RegisterPrestataireStep4() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrestataireTermsInput>({
    resolver: zodResolver(prestataireTermsSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const step1Data = sessionStorage.getItem("prestataire_step1");
    if (!step1Data) router.push(routes.auth.register.prestataire.step1);
  }, [router]);

  const handleStepClick = (step: number) => {
    if (step === 1) router.push(routes.auth.register.prestataire.step1);
    if (step === 2) router.push(routes.auth.register.prestataire.step2);
    if (step === 3) router.push(routes.auth.register.prestataire.step3);
  };

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      const step1 = JSON.parse(
        sessionStorage.getItem("prestataire_step1") || "{}",
      );
      const step2 = JSON.parse(
        sessionStorage.getItem("prestataire_step2") || "{}",
      );

      const response = await apiClient.post("/api/auth/register/prestataire", {
        email: step1.email,
        password: step1.password,
        firstName: step1.firstName,
        lastName: step1.lastName,
        city: step1.city,
        phone: step1.phone,
        competences: step2.competences || [],
        cguAccepted: true,
      });

      return response.data;
    },
    onSuccess: async (data) => {
      setAuth(data.data.user, data.data.tokens.accessToken);
      localStorage.setItem("refresh_token", data.data.tokens.refreshToken);

      // Upload avatar si photo présente à l'étape 3
      const step3 = JSON.parse(
        sessionStorage.getItem("prestataire_step3") || "{}",
      );
      if (step3.photoData && data.data.tokens.accessToken) {
        try {
          await apiClient.post(
            "/api/users/avatar",
            { imageData: step3.photoData },
            {
              headers: {
                Authorization: `Bearer ${data.data.tokens.accessToken}`,
              },
            },
          );
        } catch (err) {
          console.warn("Avatar non uploadé — compte créé quand même");
        }
      }

      sessionStorage.removeItem("prestataire_step1");
      sessionStorage.removeItem("prestataire_step2");
      sessionStorage.removeItem("prestataire_step3");

      router.push(routes.auth.verifyEmail + "?type=prestataire");
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = () => finalizeMutation.mutate();

  return (
    <AuthLayout variant="prestataire">
      <ProgressSteps
        currentStep={4}
        totalSteps={4}
        completedSteps={[1, 2, 3]}
        onStepClick={handleStepClick}
      />

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🛠️</div>
        <h1 className={`${typography.h2.base} ${colors.premium.text} mb-2`}>
          Derniere etape !
        </h1>
        <p className={`${colors.premium.text} font-medium`}>
          Acceptez les conditions prestataire
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Conditions Generales Prestataires
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. Engagement qualite
              </h4>
              <p>
                En tant que prestataire sur Tasky, vous vous engagez a fournir
                des services de qualite et a respecter les delais convenus avec
                vos clients.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Verification identite
              </h4>
              <p>
                Toute usurpation d identite entrainera la fermeture immediate de
                votre compte.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Commission
              </h4>
              <p>
                Tasky preleve une commission de 15% sur chaque prestation. Le
                paiement est verse apres validation client.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                4. Responsabilite
              </h4>
              <p>
                Vous etes responsable des objets confies par les clients. Une
                assurance RC pro est recommandee.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                5. Annulations et litiges
              </h4>
              <p>
                En cas de litige, notre equipe intervient comme mediateur. Les
                annulations abusives peuvent entrainer des penalites.
              </p>
            </section>
          </div>
        </div>

        <Checkbox
          label={
            <span className="text-gray-900">
              J ai lu et j accepte les{" "}
              <strong className={colors.premium.text}>CGU Prestataire</strong>
            </span>
          }
          error={errors.acceptPrestataireTerms?.message}
          {...register("acceptPrestataireTerms")}
        />

        <div
          className={`${colors.secondary.bg} border-2 ${colors.secondary.borderLight} rounded-lg p-6`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h4 className={`font-bold ${colors.secondary.textDark} mb-2`}>
                Bienvenue sur Tasky !
              </h4>
              <p className={`text-sm ${colors.secondary.textMuted}`}>
                Une fois votre email verifie, vous pourrez recevoir des demandes
                de clients pres de chez vous.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push(routes.auth.register.prestataire.step3)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Retour
          </Button>
          <Button
            type="submit"
            variant="secondary"
            fullWidth
            size="lg"
            isLoading={finalizeMutation.isPending}
          >
            Creer mon compte prestataire
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

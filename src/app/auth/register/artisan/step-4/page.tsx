"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { artisanTermsSchema, ArtisanTermsInput } from "@/lib/schemas";
import { apiClient, handleApiError } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import AuthLayout from "@/components/AuthLayout";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";

export default function RegisterArtisanStep4() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ArtisanTermsInput>({
    resolver: zodResolver(artisanTermsSchema),
    mode: "onBlur",
  });

  // Vérifier que les steps précédents ont été complétés
  useEffect(() => {
    const step1Data = sessionStorage.getItem("artisan_step1");
    if (!step1Data) {
      router.push(routes.auth.register.artisan.step1);
    }
  }, [router]);

  const finalizeMutation = useMutation({
    mutationFn: async (data: ArtisanTermsInput) => {
      // ✅ Récupérer toutes les données des steps précédents
      const step1 = JSON.parse(sessionStorage.getItem("artisan_step1") || "{}");
      const step2 = JSON.parse(sessionStorage.getItem("artisan_step2") || "{}");

      // ✅ Appel API avec toutes les données
      const response = await apiClient.post("/api/auth/register/artisan", {
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
    onSuccess: (data) => {
      // ✅ Connecter l'utilisateur
      setAuth(data.data.user, data.data.tokens.accessToken);
      localStorage.setItem("refresh_token", data.data.tokens.refreshToken);

      // ✅ Nettoyer le sessionStorage
      sessionStorage.removeItem("artisan_step1");
      sessionStorage.removeItem("artisan_step2");
      sessionStorage.removeItem("artisan_step3");

      router.push(routes.artisan.dashboard);
    },
    onError: (error: any) => {
      const apiError = handleApiError(error);
      alert(apiError.message);
    },
  });

  const onSubmit = (data: ArtisanTermsInput) => {
    finalizeMutation.mutate(data);
  };

  return (
    <AuthLayout variant="artisan">
      <ProgressSteps
        currentStep={4}
        totalSteps={4}
        completedSteps={[1, 2, 3]}
      />

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🛠️</div>
        <h1 className={`${typography.h2.base} ${colors.secondary.text} mb-2`}>
          Dernière étape !
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Acceptez les conditions prestataire
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* CGU Artisan */}
        <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Conditions Générales d'Utilisation - Prestataires
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                1. Engagement qualité
              </h4>
              <p>
                En tant que prestataire sur Tasky, vous vous engagez à fournir
                des services de qualité et à respecter les délais convenus avec
                vos clients.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                2. Vérification d'identité
              </h4>
              <p>
                Votre identité a été vérifiée. Toute usurpation d'identité
                entraînera la fermeture immédiate de votre compte.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                3. Paiement et commission
              </h4>
              <p>
                Tasky prélève une commission de 15% sur chaque prestation
                réalisée. Le paiement vous est versé après validation du client.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                4. Lieux neutres
              </h4>
              <p>
                Tous les échanges d'objets doivent se faire en lieux neutres
                (points relais, commerces partenaires). Aucun déplacement à
                domicile n'est autorisé.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                5. Responsabilité
              </h4>
              <p>
                Vous êtes responsable des objets confiés par les clients. Une
                assurance responsabilité civile professionnelle est recommandée.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                6. Annulation et litiges
              </h4>
              <p>
                En cas de litige, notre équipe intervient comme médiateur. Les
                annulations abusives peuvent entraîner des pénalités.
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-gray-900 mb-2">
                7. Avis clients
              </h4>
              <p>
                Les avis clients sont authentiques et vérifiés. Votre réputation
                est essentielle sur la plateforme.
              </p>
            </section>
          </div>
        </div>

        {/* Checkbox */}
        <Checkbox
          label={
            <span className="text-gray-900">
              J'ai lu et j'accepte les{" "}
              <strong className={colors.secondary.text}>
                Conditions Générales d'Utilisation Prestataire
              </strong>
            </span>
          }
          error={errors.acceptArtisanTerms?.message}
          {...register("acceptArtisanTerms")}
        />

        {/* Encadré bienvenue */}
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
                Une fois validé, vous pourrez commencer à recevoir des demandes
                de clients près de chez vous. Bonne chance ! 🚀
              </p>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push(routes.auth.register.artisan.step3)}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Retour
          </Button>
          <Button
            type="submit"
            fullWidth
            size="lg"
            isLoading={finalizeMutation.isPending}
            className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
          >
            🎉 Créer mon compte prestataire
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}

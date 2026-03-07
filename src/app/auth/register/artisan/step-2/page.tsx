"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import { CategorySelector } from "@/components/CategorySelector";
import { colors } from "@/config/colors";
import { typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import type { PrestationSelectionnee } from "@/types/categories.types";

export default function RegisterArtisanStep2() {
  const router = useRouter();
  const [selectedPrestations, setSelectedPrestations] = useState<
    PrestationSelectionnee[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const step1Data = sessionStorage.getItem("artisan_step1");
    if (!step1Data) {
      router.push(routes.auth.register.artisan.step1);
    }
  }, [router]);

  const handleSelect = (prestation: PrestationSelectionnee) => {
    setSelectedPrestations((prev) => {
      const exists = prev.find(
        (p) => p.prestationId === prestation.prestationId,
      );
      if (exists) {
        return prev.filter((p) => p.prestationId !== prestation.prestationId);
      }
      if (prev.length >= 3) {
        setErrorMessage("Maximum 3 compétences");
        return prev;
      }
      return [...prev, prestation];
    });
    setErrorMessage(null);
  };

  const handleSubmit = () => {
    if (selectedPrestations.length === 0) {
      setErrorMessage("Sélectionnez au moins une compétence");
      return;
    }
    setErrorMessage(null);

    const categorieIds = [
      ...new Set(selectedPrestations.map((p) => p.categorieId)),
    ];
    sessionStorage.setItem(
      "artisan_step2",
      JSON.stringify({
        competences: categorieIds,
        prestations: selectedPrestations,
      }),
    );

    router.push(routes.auth.register.artisan.step3);
  };

  return (
    <AuthLayout variant="artisan">
      <ProgressSteps currentStep={2} totalSteps={4} completedSteps={[1]} />

      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🛠️</div>
        <h1 className={`${typography.h2.base} ${colors.secondary.text} mb-2`}>
          Vos compétences
        </h1>
        <p className={`${colors.secondary.text} font-medium`}>
          Étape 2 : Choisissez vos spécialités (max 3)
        </p>
      </div>

      <div
        className={`text-center text-sm mb-4 font-medium ${selectedPrestations.length >= 3 ? colors.error.text : colors.secondary.text}`}
      >
        {selectedPrestations.length}/3 compétences sélectionnées
      </div>

      {selectedPrestations.length > 0 && (
        <div
          className={`mb-4 p-3 ${colors.secondary.bg} border ${colors.secondary.borderLight} rounded-lg`}
        >
          <p
            className={`text-sm font-semibold ${colors.secondary.textDark} mb-2`}
          >
            Sélectionnées :
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPrestations.map((p) => (
              <span
                key={p.prestationId}
                className={`text-xs px-2 py-1 ${colors.secondary.gradient} text-white rounded-full`}
              >
                {p.prestationNom}
              </span>
            ))}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        </div>
      )}

      <CategorySelector
        onSelect={handleSelect}
        selectedPrestation={
          selectedPrestations[selectedPrestations.length - 1] || null
        }
      />

      <div className="flex gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.push(routes.auth.register.artisan.step1)}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ← Retour
        </Button>
        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={handleSubmit}
          className={`${colors.secondary.gradient} ${colors.secondary.gradientHover}`}
        >
          Continuer →
        </Button>
      </div>
    </AuthLayout>
  );
}

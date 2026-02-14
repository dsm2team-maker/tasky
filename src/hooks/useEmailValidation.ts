// Hook pour valider l'unicité de l'email (debounced)
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { debounce } from "@/lib/utils";

interface EmailValidationResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

export const useEmailValidation = (email: string, enabled: boolean = true) => {
  const [result, setResult] = useState<EmailValidationResult>({
    isChecking: false,
    isAvailable: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !email || email.length < 3) {
      setResult({ isChecking: false, isAvailable: null, error: null });
      return;
    }

    // Validation de base du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResult({ isChecking: false, isAvailable: null, error: null });
      return;
    }

    const checkEmail = debounce(async () => {
      setResult((prev) => ({ ...prev, isChecking: true, error: null }));

      try {
        const response = await apiClient.get(
          `/api/auth/check-email?email=${encodeURIComponent(email)}`,
        );

        setResult({
          isChecking: false,
          isAvailable: response.data.available,
          error: null,
        });
      } catch (error: any) {
        setResult({
          isChecking: false,
          isAvailable: null,
          error: error.response?.data?.message || "Erreur de vérification",
        });
      }
    }, 500);

    checkEmail();
  }, [email, enabled]);

  return result;
};

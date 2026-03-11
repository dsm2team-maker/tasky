// Hook pour valider l'unicité du téléphone (debounced)
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { debounce } from "@/lib/utils";

interface PhoneValidationResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

export const usePhoneValidation = (phone: string, enabled: boolean = true) => {
  const [result, setResult] = useState<PhoneValidationResult>({
    isChecking: false,
    isAvailable: null,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !phone || phone.replace(/\s/g, "").length < 10) {
      setResult({ isChecking: false, isAvailable: null, error: null });
      return;
    }

    const checkPhone = debounce(async () => {
      setResult((prev) => ({ ...prev, isChecking: true, error: null }));
      try {
        const response = await apiClient.get(
          `/api/auth/check-phone?phone=${encodeURIComponent(phone)}`,
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

    checkPhone();
  }, [phone, enabled]);

  return result;
};

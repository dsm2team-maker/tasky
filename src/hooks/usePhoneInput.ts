import { useState, useCallback } from "react";

// Formate automatiquement le numéro pendant la saisie
// "0621490020" → "06 21 49 00 20"
export const usePhoneInput = (onChange?: (value: string) => void) => {
  const [displayValue, setDisplayValue] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Garder uniquement les chiffres
      const digits = raw.replace(/\D/g, "");

      // Limiter à 10 chiffres
      const limited = digits.slice(0, 10);

      // Formater avec espaces tous les 2 chiffres
      const formatted = limited.replace(/(\d{2})(?=\d)/g, "$1 ").trim();

      setDisplayValue(formatted);

      // Envoyer la valeur sans espaces au formulaire
      if (onChange) onChange(limited);
    },
    [onChange],
  );

  return { displayValue, handleChange };
};

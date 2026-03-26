/**
 * 🗺️ TASKY — Hook usePostalCode
 * Autocomplétion ville ↔ code postal via api-adresse.data.gouv.fr
 * Réutilisable sur inscription client, prestataire, et profil
 */
import { useState, useCallback, useRef } from "react";

export interface CityResult {
  nom: string;
  codesPostaux: string[];
  codeDepartement: string;
}

export const usePostalCode = (
  onSelect?: (city: string, postalCode: string) => void,
) => {
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Détecte si c'est un code postal (chiffres) ou une ville (lettres)
        const isPostalCode = /^\d+$/.test(query);
        const url = isPostalCode
          ? `https://geo.api.gouv.fr/communes?codePostal=${query}&fields=nom,codesPostaux,codeDepartement&limit=5`
          : `https://geo.api.gouv.fr/communes?nom=${query}&fields=nom,codesPostaux,codeDepartement&limit=5&boost=population`;

        const res = await fetch(url);
        const data: CityResult[] = await res.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const selectCity = useCallback(
    (city: CityResult) => {
      const postalCode = city.codesPostaux[0] || "";
      onSelect?.(city.nom, postalCode);
      setSuggestions([]);
      setIsOpen(false);
    },
    [onSelect],
  );

  const close = useCallback(() => {
    setSuggestions([]);
    setIsOpen(false);
  }, []);

  return { suggestions, isLoading, isOpen, search, selectCity, close };
};

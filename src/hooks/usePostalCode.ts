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
  // Code postal à retenir pour cette suggestion : celui recherché s'il est connu
  // (utile pour Paris/Lyon/Marseille, une seule "commune" avec un code postal par arrondissement),
  // sinon le premier de la liste.
  matchedPostalCode: string;
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
        const data: Omit<CityResult, "matchedPostalCode">[] = await res.json();
        const withMatch: CityResult[] = data.map((c) => ({
          ...c,
          matchedPostalCode:
            isPostalCode && c.codesPostaux.includes(query)
              ? query
              : c.codesPostaux[0] || "",
        }));
        setSuggestions(withMatch);
        setIsOpen(withMatch.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

  const selectCity = useCallback(
    (city: CityResult) => {
      onSelect?.(city.nom, city.matchedPostalCode);
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

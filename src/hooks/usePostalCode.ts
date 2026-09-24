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

// Codes INSEE des 3 "villes à arrondissements" françaises (Paris/Lyon/Marseille) :
// l'API géo renvoie pour elles une entrée "commune" agrégée (tous arrondissements confondus,
// donc un seul code postal par défaut n'a pas de sens) en plus d'une entrée par arrondissement.
// On exclut l'entrée agrégée pour forcer un choix précis (ex: "Paris 14e Arrondissement").
const VILLES_A_ARRONDISSEMENTS_CODES = ["75056", "69123", "13055"];

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
        // On inclut toujours les arrondissements municipaux (Paris/Lyon/Marseille) en plus
        // des communes classiques, pour permettre une sélection précise (ex: "Paris 14e
        // Arrondissement") plutôt que la commune agrégée qui masque l'arrondissement réel.
        // limit=25 : suffisant pour couvrir tous les arrondissements de Paris (20), Marseille
        // (16) ou Lyon (9) même quand la recherche par nom ne les classe pas en tête.
        const url = isPostalCode
          ? `https://geo.api.gouv.fr/communes?codePostal=${query}&type=commune-actuelle,arrondissement-municipal&fields=nom,codesPostaux,codeDepartement,code&limit=25`
          : `https://geo.api.gouv.fr/communes?nom=${query}&type=commune-actuelle,arrondissement-municipal&fields=nom,codesPostaux,codeDepartement,code&limit=25&boost=population`;

        const res = await fetch(url);
        const data: (Omit<CityResult, "matchedPostalCode"> & { code: string })[] = await res.json();

        // Numéro d'arrondissement tapé par l'utilisateur (ex: "paris 14" → "14"), pour
        // faire remonter "Paris 14e Arrondissement" en tête même si l'API géo (qui ignore
        // les chiffres dans la recherche par nom) le classe loin derrière par popularité.
        const arrondissementNumber = isPostalCode
          ? undefined
          : query.match(/(\d{1,2})/)?.[1];

        const withMatch: CityResult[] = data
          // Exclut l'entrée "commune" agrégée de Paris/Lyon/Marseille : elle ne permet pas
          // de distinguer l'arrondissement, on ne garde que les arrondissements eux-mêmes.
          .filter((c) => !VILLES_A_ARRONDISSEMENTS_CODES.includes(c.code))
          .map((c) => ({
            ...c,
            matchedPostalCode:
              isPostalCode && c.codesPostaux.includes(query)
                ? query
                : c.codesPostaux[0] || "",
          }))
          .sort((a, b) => {
            if (!arrondissementNumber) return 0;
            const aMatches = new RegExp(`\\b${arrondissementNumber}(er|e)\\b`, "i").test(a.nom);
            const bMatches = new RegExp(`\\b${arrondissementNumber}(er|e)\\b`, "i").test(b.nom);
            return aMatches === bMatches ? 0 : aMatches ? -1 : 1;
          });
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

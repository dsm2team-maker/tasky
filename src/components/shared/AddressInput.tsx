"use client";

/**
 * 📍 TASKY — AddressInput
 * Autocomplétion d'adresse via api-adresse.data.gouv.fr (gratuit, France)
 * Retourne : adresse, ville, codePostal, lat, lng
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import { colors } from "@/config/colors";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AddressResult {
  label: string; // Adresse complète ex: "32 Rue Guy Môquet 92240 Malakoff"
  adresse: string; // ex: "32 Rue Guy Môquet"
  ville: string; // ex: "Malakoff"
  codePostal: string; // ex: "92240"
  lat: number;
  lng: number;
}

interface AddressInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  error?: string;
  disabled?: boolean;
}

// ─── Composant ────────────────────────────────────────────────────────────────
export const AddressInput: React.FC<AddressInputProps> = ({
  label = "Adresse",
  placeholder = "32 rue Guy Môquet, Malakoff...",
  value,
  onChange,
  onSelect,
  error,
  disabled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fermer si clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Recherche avec debounce
  const search = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`;
        const res = await fetch(url);
        const data = await res.json();

        const results: AddressResult[] = data.features.map((f: any) => ({
          label: f.properties.label,
          adresse: f.properties.name,
          ville: f.properties.city,
          codePostal: f.properties.postcode,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        }));

        setSuggestions(results);
        setIsOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  }, []);

  const handleSelect = (result: AddressResult) => {
    onChange(result.label);
    onSelect(result);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icône */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            search(e.target.value);
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-emerald-400",
            disabled && "bg-gray-50 cursor-not-allowed text-gray-500",
          )}
        />

        {/* Spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div
              className={`animate-spin h-4 w-4 border-2 border-t-transparent ${colors.secondary.border} rounded-full`}
            />
          </div>
        )}
      </div>

      {/* Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className={`w-full text-left px-4 py-3 hover:${colors.secondary.bg} transition-colors border-b border-gray-50 last:border-0`}
            >
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">
                  📍
                </span>
                <div>
                  <p className={`text-sm font-medium ${colors.text.primary}`}>
                    {result.adresse}
                  </p>
                  <p className={`text-xs ${colors.text.tertiary}`}>
                    {result.codePostal} {result.ville}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Erreur */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default AddressInput;

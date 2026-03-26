"use client";

/**
 * 📍 TASKY — CityInput
 * Champ ville avec autocomplétion code postal/ville
 * Réutilisable : inscription client, prestataire, profil
 */
import React, { useRef, useEffect } from "react";
import { usePostalCode } from "@/hooks/usePostalCode";
import { colors } from "@/config/colors";
import { cn } from "@/lib/utils";

interface CityInputProps {
  value: string;
  onChange: (value: string) => void;
  onCitySelect?: (city: string, postalCode: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const CityInput: React.FC<CityInputProps> = ({
  value,
  onChange,
  onCitySelect,
  error,
  disabled,
  label = "Ville ou code postal",
  placeholder = "Ex: Paris ou 75001",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading, isOpen, search, selectCity, close } =
    usePostalCode((city, postalCode) => {
      onChange(city);
      onCitySelect?.(city, postalCode);
    });

  // Fermer si clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [close]);

  return (
    <div ref={containerRef} className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Icône localisation */}
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
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-all duration-200",
            error && "border-red-500 focus:ring-red-500",
            !error && "border-gray-300",
            disabled && "bg-gray-50 cursor-not-allowed text-gray-500",
          )}
        />

        {/* Spinner */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div
              className={`animate-spin h-4 w-4 border-2 border-t-transparent ${colors.premium.border} rounded-full`}
            />
          </div>
        )}
      </div>

      {/* Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((city, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectCity(city)}
              className={`w-full text-left px-4 py-3 hover:${colors.primary.bg} ${colors.primary.bgHover} transition-colors flex items-center justify-between`}
            >
              <span className={`text-sm font-medium ${colors.text.primary}`}>
                📍 {city.nom}
              </span>
              <span
                className={`text-xs ${colors.text.tertiary} bg-gray-100 px-2 py-0.5 rounded-full`}
              >
                {city.codesPostaux[0]}
              </span>
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

export default CityInput;

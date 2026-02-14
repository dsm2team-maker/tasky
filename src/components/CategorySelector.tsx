"use client";

import React, { useState, useMemo } from "react";
import categoriesData from "@/data/categories.json";
import type {
  Categorie,
  SousCategorie,
  Prestation,
  PrestationSelectionnee,
} from "@/types/categories.types";

interface CategorySelectorProps {
  onSelect: (prestation: PrestationSelectionnee) => void;
  selectedPrestation?: PrestationSelectionnee | null;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  onSelect,
  selectedPrestation,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(
    null,
  );
  const [selectedSousCategorie, setSelectedSousCategorie] = useState<
    string | null
  >(null);

  const categories = categoriesData.categories as Categorie[];

  // Filtrer les catégories selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    const term = searchTerm.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        sousCategories: cat.sousCategories
          .map((sousCat) => ({
            ...sousCat,
            prestations: sousCat.prestations.filter((p) =>
              p.nom.toLowerCase().includes(term),
            ),
          }))
          .filter((sousCat) => sousCat.prestations.length > 0),
      }))
      .filter((cat) => cat.sousCategories.length > 0);
  }, [searchTerm, categories]);

  const handlePrestationClick = (
    categorie: Categorie,
    sousCategorie: SousCategorie,
    prestation: Prestation,
  ) => {
    onSelect({
      categorieId: categorie.id,
      categorieNom: categorie.nom,
      sousCategorieId: sousCategorie.id,
      sousCategorieNom: sousCategorie.nom,
      prestationId: prestation.id,
      prestationNom: prestation.nom,
    });
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher une prestation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <svg
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Sélection affichée */}
      {selectedPrestation && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-800 mb-1">
            <strong>Sélection actuelle :</strong>
          </p>
          <p className="text-emerald-900 font-medium">
            {selectedPrestation.categorieNom} →{" "}
            {selectedPrestation.sousCategorieNom} →{" "}
            {selectedPrestation.prestationNom}
          </p>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune prestation trouvée pour "{searchTerm}"
          </div>
        ) : (
          filteredCategories.map((categorie) => (
            <div
              key={categorie.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header Catégorie */}
              <button
                type="button"
                onClick={() =>
                  setSelectedCategorie(
                    selectedCategorie === categorie.id ? null : categorie.id,
                  )
                }
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categorie.icon}</span>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-900">{categorie.nom}</h3>
                    <p className="text-sm text-gray-600">
                      {categorie.description}
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedCategorie === categorie.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Sous-catégories */}
              {selectedCategorie === categorie.id && (
                <div className="bg-white">
                  {categorie.sousCategories.map((sousCategorie) => (
                    <div
                      key={sousCategorie.id}
                      className="border-t border-gray-200"
                    >
                      {/* Header Sous-catégorie */}
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSousCategorie(
                            selectedSousCategorie === sousCategorie.id
                              ? null
                              : sousCategorie.id,
                          )
                        }
                        className="w-full flex items-center justify-between p-3 pl-12 hover:bg-gray-50 transition"
                      >
                        <h4 className="font-semibold text-gray-800">
                          {sousCategorie.nom}
                        </h4>
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            selectedSousCategorie === sousCategorie.id
                              ? "rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Prestations */}
                      {selectedSousCategorie === sousCategorie.id && (
                        <div className="bg-gray-50 p-3 pl-16 space-y-2">
                          {sousCategorie.prestations.map((prestation) => (
                            <button
                              type="button"
                              key={prestation.id}
                              onClick={() =>
                                handlePrestationClick(
                                  categorie,
                                  sousCategorie,
                                  prestation,
                                )
                              }
                              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                                selectedPrestation?.prestationId ===
                                prestation.id
                                  ? "bg-emerald-500 text-white font-medium"
                                  : "bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-700"
                              }`}
                            >
                              {prestation.nom}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

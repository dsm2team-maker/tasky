"use client";

import React, { useState } from "react";
import { colors } from "@/config/colors";
import { typography, spacing } from "@/config/design-tokens";

// Import des données (à adapter selon ton chemin)
import categoriesData from "@/data/categories.json";

interface Prestation {
  id: string;
  nom: string;
}

interface SousCategorie {
  id: string;
  nom: string;
  prestations: Prestation[];
}

interface Categorie {
  id: string;
  nom: string;
  icon: string;
  description: string;
  sousCategories: SousCategorie[];
}

export default function CategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<Categorie | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories: Categorie[] = categoriesData.categories;

  const handleCategoryClick = (category: Categorie) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCategory(null), 300);
  };

  return (
    <>
      {/* Section Catégories - VITRINE */}
      <section id="categories" className={`${spacing.section} bg-white`}>
        <div className={spacing.container}>
          {/* En-tête */}
          <div className="text-center mb-16">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              ✨ Découvrez nos prestations
            </h2>
            <p className={`text-lg ${colors.text.secondary} max-w-2xl mx-auto`}>
              De l'artisanat créatif à la réparation, explorez la variété des
              services disponibles sur Tasky. Cliquez sur une catégorie pour
              voir les détails !
            </p>
          </div>

          {/* Grille de catégories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 text-left overflow-hidden"
              >
                {/* Background gradient au hover */}
                <div
                  className={`absolute inset-0 ${colors.premium.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                />

                {/* Contenu */}
                <div className="relative z-10">
                  {/* Icône */}
                  <div
                    className={`w-16 h-16 ${colors.premium.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {category.icon}
                  </div>

                  {/* Titre */}
                  <h3
                    className={`text-lg font-bold ${colors.text.primary} mb-2 group-hover:${colors.premium.text} transition-colors`}
                  >
                    {category.nom}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm ${colors.text.tertiary} mb-4 line-clamp-2`}
                  >
                    {category.description}
                  </p>

                  {/* Badge nombre de prestations */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${colors.premium.text} font-semibold`}
                    >
                      {category.sousCategories.reduce(
                        (acc, sc) => acc + sc.prestations.length,
                        0,
                      )}{" "}
                      prestations
                    </span>
                    <svg
                      className={`w-5 h-5 ${colors.premium.text} group-hover:translate-x-1 transition-transform`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Effet de brillance au hover */}
                <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-full transition-all duration-700" />
              </button>
            ))}
          </div>

          {/* Note informative */}
          <div className={`mt-12 text-center ${colors.text.tertiary} text-sm`}>
            💡 <strong>Note :</strong> Cette liste n'est pas exhaustive. Vous
            pouvez publier une demande pour tout type de service artisanal !
          </div>
        </div>
      </section>

      {/* Modal informatif (lecture seule) */}
      {isModalOpen && selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden animate-slideInUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div
              className={`${colors.premium.gradient} p-6 text-white relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{selectedCategory.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold">
                        {selectedCategory.nom}
                      </h3>
                      <p className="text-purple-100 text-sm mt-1">
                        {selectedCategory.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                    aria-label="Fermer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Pattern décoratif */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto max-h-[calc(85vh-200px)] p-6">
              <div className="space-y-6">
                {selectedCategory.sousCategories.map((sousCategorie) => (
                  <div
                    key={sousCategorie.id}
                    className="border border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50"
                  >
                    {/* Titre sous-catégorie */}
                    <h4
                      className={`text-lg font-bold ${colors.premium.text} mb-4 flex items-center gap-2`}
                    >
                      <span
                        className={`w-2 h-2 ${colors.premium.bg} rounded-full`}
                      />
                      {sousCategorie.nom}
                    </h4>

                    {/* Liste des prestations (lecture seule) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sousCategorie.prestations.map((prestation) => (
                        <div
                          key={prestation.id}
                          className="flex items-center gap-2 text-sm text-gray-700"
                        >
                          {/* Checkmark */}
                          <svg
                            className={`w-4 h-4 ${colors.premium.text} flex-shrink-0`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{prestation.nom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer du modal */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                💡 <strong>Besoin d'un service ?</strong> Inscrivez-vous pour
                publier votre demande !
              </p>
              <button
                onClick={closeModal}
                className={`px-6 py-2.5 ${colors.premium.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-shadow`}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

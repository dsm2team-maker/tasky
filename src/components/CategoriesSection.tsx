"use client";

import React, { useState } from "react";
import Link from "next/link";
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
      {/* Section Catégories */}
      <section
        id="categories"
        className={`${spacing.section} bg-gradient-to-b from-white to-gray-50`}
      >
        <div className={spacing.container}>
          {/* En-tête */}
          <div className="text-center mb-16">
            <h2 className={`${typography.h2.base} ${colors.text.primary} mb-4`}>
              🎨 Nos Catégories de Services
            </h2>
            <p className={`text-lg ${colors.text.secondary} max-w-2xl mx-auto`}>
              Découvrez toutes les prestations disponibles sur Tasky. De
              l'artisanat créatif à la réparation, trouvez le prestataire qu'il
              vous faut !
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

                  {/* Badge nombre de sous-catégories */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs ${colors.premium.text} font-semibold`}
                    >
                      {category.sousCategories.length} sous-catégories
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
        </div>
      </section>

      {/* Modal des sous-catégories */}
      {isModalOpen && selectedCategory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-slideInUp"
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
                    <h3 className="text-2xl font-bold">
                      {selectedCategory.nom}
                    </h3>
                  </div>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
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
                <p className="text-purple-100">
                  {selectedCategory.description}
                </p>
              </div>

              {/* Pattern décoratif */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6">
              <div className="space-y-6">
                {selectedCategory.sousCategories.map((sousCategorie) => (
                  <div
                    key={sousCategorie.id}
                    className="border border-gray-200 rounded-xl p-5 hover:border-purple-300 hover:shadow-md transition-all"
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

                    {/* Liste des prestations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {sousCategorie.prestations.map((prestation) => (
                        <Link
                          key={prestation.id}
                          href={`/client/search?category=${selectedCategory.id}&subcategory=${sousCategorie.id}&prestation=${prestation.id}`}
                          className="group flex items-center gap-2 p-3 rounded-lg hover:bg-purple-50 transition-colors"
                        >
                          <svg
                            className={`w-4 h-4 ${colors.premium.text} flex-shrink-0 group-hover:scale-110 transition-transform`}
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
                          <span
                            className={`text-sm ${colors.text.secondary} group-hover:${colors.premium.text} group-hover:font-medium transition-colors`}
                          >
                            {prestation.nom}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer du modal */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  💡 Cliquez sur une prestation pour trouver des artisans
                </p>
                <button
                  onClick={closeModal}
                  className={`px-6 py-2 ${colors.premium.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-shadow`}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState } from "react";
import { CategorySelector } from "@/components/CategorySelector";
import type { PrestationSelectionnee } from "@/types/categories.types";
import { Button } from "@/components/Button";

export default function CategoryTestPage() {
  const [selectedPrestation, setSelectedPrestation] =
    useState<PrestationSelectionnee | null>(null);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [dateLivraison, setDateLivraison] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPrestation) {
      alert("Veuillez sélectionner une prestation");
      return;
    }

    const demande = {
      titre,
      description,
      budget: parseFloat(budget),
      prestation: selectedPrestation,
    };

    console.log("Demande créée :", demande);
    alert("Demande créée avec succès !");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Créer une nouvelle demande
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sélection de la prestation */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              1. Quelle prestation recherchez-vous ?
            </h2>
            <CategorySelector
              onSelect={setSelectedPrestation}
              selectedPrestation={selectedPrestation}
            />
          </div>

          {/* Détails de la demande */}
          {selectedPrestation && (
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  2. Décrivez votre besoin
                </h2>

                <div className="space-y-4">
                  {/* Titre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de votre demande
                    </label>
                    <input
                      type="text"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                      placeholder="Ex: Broderie d'un motif floral sur un pull"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description détaillée
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez en détail ce que vous souhaitez..."
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget estimé (€)
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="50"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {/* Date de livraison maximum */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de livraison souhaitée{" "}
                      <span className="text-gray-500 text-xs">(optionnel)</span>
                    </label>
                    <input
                      type="date"
                      value={dateLivraison}
                      onChange={(e) => setDateLivraison(e.target.value)}
                      min={new Date().toISOString().split("T")[0]} // Pas de date dans le passé
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Exemple : pour un anniversaire le 15 mars, indiquez
                      cette date
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedPrestation(null);
                    setTitre("");
                    setDescription("");
                    setBudget("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Publier ma demande
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

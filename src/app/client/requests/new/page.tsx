"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCreateDemande } from "@/hooks/useDemande";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CityInput } from "@/components/shared/CityInput";
import HeaderClient from "@/components/headers/HeaderClient";
import { colors } from "@/config/colors";
import { spacing, typography } from "@/config/design-tokens";
import { routes } from "@/config/routes";
import categoriesData from "@/data/categories.json";
import type { Categorie, SousCategorie } from "@/types/categories.types";
import { apiClient } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type TypePrestation = "MODIFICATION" | "CREATION" | "FORMATION";
type Urgence = "NORMAL" | "URGENT" | "TRES_URGENT";
type Etape = 1 | 2 | 3;

const FORMATION_CATEGORY_ID = "formation-distance";
const MAX_PHOTOS = 2;
const DESC_MIN = 20;
const DESC_MAX = 1000;
const AUTRE_INTERVENTION_ID = "autre";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewDemandePage() {
  const router = useRouter();
  useAuthGuard();

  const categories = categoriesData.categories as Categorie[];
  const createDemande = useCreateDemande();

  const [etape, setEtape] = useState<Etape>(1);
  const [isHydrated, setIsHydrated] = useState(false);

  // Étape 1
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [selectedInterventionIds, setSelectedInterventionIds] = useState<
    string[]
  >([]);

  // Étape 2
  const [typePrestation, setTypePrestation] = useState<TypePrestation | "">("");

  // Étape 3
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [ville, setVille] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [urgence, setUrgence] = useState<Urgence>("NORMAL");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setIsHydrated(true), []);

  // Données dérivées
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const isFormation = selectedCategoryId === FORMATION_CATEGORY_ID;
  const subCategories: SousCategorie[] = selectedCategory?.sousCategories || [];
  const selectedSubCategory = subCategories.find(
    (s) => s.id === selectedSubCategoryId,
  );
  const interventions = selectedSubCategory?.prestations || [];

  // Date min = aujourd'hui
  const today = new Date().toISOString().split("T")[0];

  // Auto-set type formation
  useEffect(() => {
    if (isFormation) setTypePrestation("FORMATION");
    else setTypePrestation("");
  }, [isFormation]);

  // Reset sous-catégorie si catégorie change
  useEffect(() => {
    setSelectedSubCategoryId("");
    setSelectedInterventionIds([]);
  }, [selectedCategoryId]);

  useEffect(() => {
    setSelectedInterventionIds([]);
  }, [selectedSubCategoryId]);

  // Auto-titre
  useEffect(() => {
    if (selectedCategory && selectedSubCategory) {
      setTitre(`${selectedCategory.nom} - ${selectedSubCategory.nom}`);
    }
  }, [selectedCategoryId, selectedSubCategoryId]);

  // Toggle intervention
  const toggleIntervention = (id: string) => {
    setSelectedInterventionIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Upload photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos`);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Photo trop lourde (max 5 Mo)");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const imageData = ev.target?.result as string;
        const res = await apiClient.post("/api/users/avatar", { imageData });
        if (res.data.data?.avatarUrl) {
          setPhotos((prev) => [...prev, res.data.data.avatarUrl]);
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Erreur lors de l'upload");
      setUploading(false);
    }
  };
  // Validations
  const canGoEtape2 = !!selectedCategoryId && !!selectedSubCategoryId;
  const canGoEtape3 = canGoEtape2 && !!typePrestation;
  const canSubmit =
    canGoEtape3 && description.trim().length >= DESC_MIN && !!ville;

  // Soumission
  const handleSubmit = () => {
    setError(null);
    if (!canSubmit) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (dateEcheance && dateEcheance < today) {
      setError("La date ne peut pas être dans le passé");
      return;
    }

    const realInterventionIds = selectedInterventionIds.filter(
      (id) => id !== AUTRE_INTERVENTION_ID,
    );

    createDemande.mutate(
      {
        titre,
        description: description.trim(),
        typePrestation: typePrestation as TypePrestation,
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId || undefined,
        interventionIds: realInterventionIds,
        budget: budget ? parseFloat(budget) : undefined,
        ville,
        photos,
        dateEcheance: dateEcheance || undefined,
        urgence,
      },
      {
        onSuccess: () => router.push(routes.client.requests.list),
        onError: (err: any) =>
          setError(err.response?.data?.message || "Erreur lors de la création"),
      },
    );
  };

  const etapes = [
    { num: 1, label: "Catégorie" },
    { num: 2, label: "Type" },
    { num: 3, label: "Détails" },
  ];

  if (!isHydrated)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${colors.primary.border}`}
        />
      </div>
    );

  return (
    <div className={`min-h-screen ${colors.background.gray}`}>
      <HeaderClient />
      <main className={`${spacing.container} py-8 max-w-2xl`}>
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 text-sm ${colors.text.secondary} mb-4`}
          >
            ← Retour
          </button>
          <h1 className={`text-2xl font-bold ${colors.text.primary}`}>
            Créer une demande
          </h1>
          <p className={`text-sm ${colors.text.secondary} mt-1`}>
            Décrivez votre besoin et recevez des propositions
          </p>
        </div>

        {/* Barre de progression */}
        <div className="flex items-center gap-2 mb-8">
          {etapes.map((e, idx) => (
            <React.Fragment key={e.num}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    etape > e.num
                      ? `${colors.primary.bg} text-white`
                      : etape === e.num
                        ? `${colors.primary.gradient} text-white`
                        : `bg-white border-2 ${colors.border.light} ${colors.text.muted}`
                  }`}
                >
                  {etape > e.num ? "✓" : e.num}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${etape === e.num ? colors.text.primary : colors.text.muted}`}
                >
                  {e.label}
                </span>
              </div>
              {idx < etapes.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${etape > e.num ? colors.primary.bg : "bg-gray-200"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ══ ÉTAPE 1 : Catégorie ══ */}
        {etape === 1 && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
          >
            <h2 className={`${typography.h5.base} ${colors.text.primary} mb-6`}>
              Quelle catégorie correspond à votre besoin ?
            </h2>

            {/* Catégories */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedCategoryId === cat.id
                      ? `border-pink-400 ${colors.primary.light}`
                      : `${colors.border.light} hover:border-gray-300`
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div
                    className={`text-sm font-semibold ${colors.text.primary} leading-tight`}
                  >
                    {cat.nom}
                  </div>
                </button>
              ))}
            </div>

            {/* Sous-catégories */}
            {selectedCategory && (
              <div className="mb-6">
                <h3
                  className={`text-sm font-semibold ${colors.text.secondary} uppercase tracking-wide mb-3`}
                >
                  Sous-catégorie *
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubCategoryId(sub.id)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        selectedSubCategoryId === sub.id
                          ? `border-pink-400 ${colors.primary.light} ${colors.primary.text}`
                          : `${colors.border.light} ${colors.text.secondary} hover:border-gray-300`
                      }`}
                    >
                      {sub.nom}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Interventions multiples */}
            {selectedSubCategory && interventions.length > 0 && (
              <div className="mb-6">
                <h3
                  className={`text-sm font-semibold ${colors.text.secondary} uppercase tracking-wide mb-1`}
                >
                  Interventions souhaitées{" "}
                  <span className={`text-xs font-normal ${colors.text.muted}`}>
                    (plusieurs possibles)
                  </span>
                </h3>
                <p className={`text-xs ${colors.text.muted} mb-3`}>
                  Sélectionnez tout ce qui correspond à votre besoin
                </p>
                <div className="flex flex-wrap gap-2">
                  {interventions.map((inter) => (
                    <button
                      key={inter.id}
                      onClick={() => toggleIntervention(inter.id)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                        selectedInterventionIds.includes(inter.id)
                          ? `border-pink-400 ${colors.primary.light} ${colors.primary.text} font-medium`
                          : `${colors.border.light} ${colors.text.secondary} hover:border-gray-300`
                      }`}
                    >
                      {selectedInterventionIds.includes(inter.id) ? "✓ " : ""}
                      {inter.nom}
                    </button>
                  ))}
                  {/* Option "Autre" */}
                  <button
                    onClick={() => toggleIntervention(AUTRE_INTERVENTION_ID)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                      selectedInterventionIds.includes(AUTRE_INTERVENTION_ID)
                        ? `border-pink-400 ${colors.primary.light} ${colors.primary.text} font-medium`
                        : `${colors.border.light} ${colors.text.muted} hover:border-gray-300`
                    }`}
                  >
                    {selectedInterventionIds.includes(AUTRE_INTERVENTION_ID)
                      ? "✓ "
                      : ""}
                    Autre / Je ne suis pas sûr
                  </button>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              fullWidth
              disabled={!canGoEtape2}
              onClick={() => setEtape(2)}
            >
              Continuer →
            </Button>
          </div>
        )}

        {/* ══ ÉTAPE 2 : Type de prestation ══ */}
        {etape === 2 && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
          >
            <h2 className={`${typography.h5.base} ${colors.text.primary} mb-2`}>
              Quel type de prestation souhaitez-vous ?
            </h2>
            <p className={`text-sm ${colors.text.secondary} mb-6`}>
              Catégorie :{" "}
              <strong>
                {selectedCategory?.icon} {selectedCategory?.nom}
              </strong>
              {selectedSubCategory && <span> › {selectedSubCategory.nom}</span>}
            </p>

            {isFormation ? (
              <div
                className={`p-5 rounded-xl border-2 border-pink-400 ${colors.primary.light} mb-6`}
              >
                <div className="text-3xl mb-2">🎓</div>
                <div className={`font-bold ${colors.text.primary} mb-1`}>
                  Formation à distance
                </div>
                <div className={`text-sm ${colors.text.secondary}`}>
                  Apprenez avec un expert en ligne, en live ou en replay.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 mb-6">
                {[
                  {
                    value: "MODIFICATION" as TypePrestation,
                    icon: "🔧",
                    label: "Modification / Réparation",
                    desc: "Réparer, modifier ou remettre en état un objet existant",
                  },
                  {
                    value: "CREATION" as TypePrestation,
                    icon: "✨",
                    label: "Création sur mesure",
                    desc: "Créer quelque chose de nouveau selon vos envies",
                  },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setTypePrestation(type.value)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      typePrestation === type.value
                        ? `border-pink-400 ${colors.primary.light}`
                        : `${colors.border.light} hover:border-gray-300`
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className={`font-bold ${colors.text.primary} mb-1`}>
                      {type.label}
                    </div>
                    <div className={`text-sm ${colors.text.secondary}`}>
                      {type.desc}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setEtape(1)}>
                ← Retour
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={!canGoEtape3}
                onClick={() => setEtape(3)}
              >
                Continuer →
              </Button>
            </div>
          </div>
        )}

        {/* ══ ÉTAPE 3 : Détails ══ */}
        {etape === 3 && (
          <div
            className={`bg-white rounded-2xl ${spacing.card} border ${colors.border.light} shadow-sm`}
          >
            <h2 className={`${typography.h5.base} ${colors.text.primary} mb-6`}>
              Décrivez votre demande
            </h2>

            <div className="space-y-5">
              {/* Titre */}
              <div
                className={`p-4 rounded-xl ${colors.background.gray} border ${colors.border.light}`}
              >
                <label
                  className={`block text-xs font-semibold ${colors.text.tertiary} uppercase tracking-wide mb-1`}
                >
                  Titre de la demande
                </label>
                <p className={`text-sm font-medium ${colors.text.primary}`}>
                  {titre}
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-medium ${colors.text.primary} mb-1.5`}
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez précisément votre besoin, les matériaux, vos attentes..."
                  rows={5}
                  maxLength={DESC_MAX}
                  className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none`}
                />
                <div className="flex justify-between mt-1">
                  <span
                    className={`text-xs ${description.length < DESC_MIN ? colors.error.text : colors.text.muted}`}
                  >
                    {description.length < DESC_MIN
                      ? `Minimum ${DESC_MIN} caractères`
                      : ""}
                  </span>
                  <span className={`text-xs ${colors.text.muted}`}>
                    {description.length}/{DESC_MAX}
                  </span>
                </div>
              </div>

              {/* Budget */}
              <Input
                label="Budget estimé (€) — optionnel"
                type="number"
                min="0"
                placeholder="Ex: 50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />

              {/* Ville */}
              <CityInput
                label="Ville *"
                value={ville}
                onChange={setVille}
                placeholder="Ex: Paris ou 75001"
              />

              {/* Date souhaitée */}
              <div>
                <label
                  className={`block text-sm font-medium ${colors.text.primary} mb-1.5`}
                >
                  Date souhaitée — optionnel
                </label>
                <input
                  type="date"
                  value={dateEcheance}
                  min={today}
                  onChange={(e) => setDateEcheance(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${colors.border.light} text-sm focus:outline-none focus:ring-2 focus:ring-pink-300`}
                />
              </div>

              {/* Urgence */}
              <div>
                <label
                  className={`block text-sm font-medium ${colors.text.primary} mb-3`}
                >
                  Niveau d'urgence
                </label>
                <div className="flex gap-3">
                  {[
                    { value: "NORMAL" as Urgence, label: "Normal", icon: "🟢" },
                    { value: "URGENT" as Urgence, label: "Urgent", icon: "🟡" },
                    {
                      value: "TRES_URGENT" as Urgence,
                      label: "Très urgent",
                      icon: "🔴",
                    },
                  ].map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUrgence(u.value)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                        urgence === u.value
                          ? "border-pink-400 bg-pink-50 text-pink-700"
                          : `${colors.border.light} ${colors.text.secondary} hover:border-gray-300`
                      }`}
                    >
                      {u.icon} {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <label
                  className={`block text-sm font-medium ${colors.text.primary} mb-3`}
                >
                  Photos — optionnel (max {MAX_PHOTOS})
                </label>
                <div className="flex gap-3 flex-wrap">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative w-24 h-24">
                      <img
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        onClick={() =>
                          setPhotos((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <label
                      className={`w-24 h-24 rounded-xl border-2 border-dashed ${colors.border.light} flex flex-col items-center justify-center cursor-pointer hover:border-pink-300 transition-all`}
                    >
                      <span className="text-2xl text-gray-400">+</span>
                      <span className={`text-xs ${colors.text.muted} mt-1`}>
                        Ajouter
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
                {uploading && (
                  <p className={`text-xs ${colors.text.muted} mt-2`}>
                    ⏳ Upload en cours...
                  </p>
                )}
              </div>

              {/* Erreur */}
              {error && (
                <div
                  className={`p-3 rounded-xl ${colors.error.bg} border ${colors.error.borderLight}`}
                >
                  <p className={`text-sm ${colors.error.text}`}>{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setEtape(2)}>
                  ← Retour
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  disabled={!canSubmit}
                  isLoading={createDemande.isPending}
                  onClick={handleSubmit}
                >
                  Publier la demande
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

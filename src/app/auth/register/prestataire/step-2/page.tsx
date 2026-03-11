"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { ProgressSteps } from "@/components/ProgressSteps";
import { colors } from "@/config/colors";
import { routes } from "@/config/routes";
import { INSCRIPTION_LIMITS } from "@/config/inscription-limits";
import categoriesData from "@/data/categories.json";
import type { Categorie, SousCategorie } from "@/types/categories.types";

// ─── Hiérarchie couleurs + symboles ──────────────────────────────────────────
// Catégorie   → secondary (emerald/vert)  ✦ étoile 4 branches
// Sous-cat    → neutral   (bleu)          ◆ losange
// Compétence  → premium   (violet)        ● cercle plein

const ICONS = {
  categorie: <span className="text-emerald-500 text-base leading-none">✦</span>,
  sousCategorie: <span className="text-blue-500 text-sm leading-none">◆</span>,
  competence: <span className="text-purple-500 text-xs leading-none">●</span>,
};

interface Selection {
  [categorieId: string]: { [sousCategorieId: string]: string[] };
}

const nbSousCat = (sel: Selection, catId: string) =>
  Object.keys(sel[catId] || {}).length;
const nbComp = (sel: Selection, catId: string, scId: string) =>
  sel[catId]?.[scId]?.length || 0;
const totalComp = (sel: Selection) =>
  Object.values(sel).reduce(
    (acc, cat) => acc + Object.values(cat).reduce((a, c) => a + c.length, 0),
    0,
  );

export default function RegisterPrestataireStep2() {
  const router = useRouter();
  const categories = categoriesData.categories as Categorie[];
  const {
    MAX_CATEGORIES,
    MAX_SOUS_CATEGORIES_PAR_CATEGORIE,
    MAX_COMPETENCES_PAR_SOUS_CATEGORIE,
  } = INSCRIPTION_LIMITS;

  const [selection, setSelection] = useState<Selection>({});
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openSc, setOpenSc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("prestataire_step1")) {
      router.push(routes.auth.register.prestataire.step1);
      return;
    }
    // Restaurer la sélection si on revient en arrière
    const saved = sessionStorage.getItem("prestataire_step2");
    if (saved) {
      try {
        const { prestations } = JSON.parse(saved);
        if (prestations?.length) {
          const restored: Selection = {};
          for (const p of prestations) {
            if (!restored[p.catId]) restored[p.catId] = {};
            if (!restored[p.catId][p.scId]) restored[p.catId][p.scId] = [];
            restored[p.catId][p.scId].push(p.prestId);
          }
          setSelection(restored);
        }
      } catch {}
    }
  }, [router]);

  const handleStepClick = (step: number) => {
    if (step === 1) router.push(routes.auth.register.prestataire.step1);
  };

  const selectedCatIds = Object.keys(selection);
  const total = totalComp(selection);

  const toggleCat = (catId: string) => {
    if (openCat === catId) {
      setOpenCat(null);
      setOpenSc(null);
      return;
    }
    if (!selection[catId] && selectedCatIds.length >= MAX_CATEGORIES) {
      setError(`Limite atteinte : maximum ${MAX_CATEGORIES} catégories`);
      return;
    }
    setError(null);
    setOpenCat(catId);
    setOpenSc(null);
  };

  const toggleSc = (catId: string, scId: string) => {
    if (openSc === scId) {
      setOpenSc(null);
      return;
    }
    if (
      !selection[catId]?.[scId] &&
      nbSousCat(selection, catId) >= MAX_SOUS_CATEGORIES_PAR_CATEGORIE
    ) {
      setError(
        `Maximum ${MAX_SOUS_CATEGORIES_PAR_CATEGORIE} sous-catégories par catégorie`,
      );
      return;
    }
    setError(null);
    setOpenSc(scId);
  };

  const toggleComp = (catId: string, scId: string, prestId: string) => {
    setError(null);
    setSelection((prev) => {
      const cat = prev[catId] || {};
      const sc = cat[scId] || [];
      const isOn = sc.includes(prestId);
      if (!isOn && sc.length >= MAX_COMPETENCES_PAR_SOUS_CATEGORIE) {
        setError(
          `Maximum ${MAX_COMPETENCES_PAR_SOUS_CATEGORIE} compétences par sous-catégorie`,
        );
        return prev;
      }
      const newSc = isOn ? sc.filter((id) => id !== prestId) : [...sc, prestId];
      const newCat = { ...cat, [scId]: newSc };
      if (newSc.length === 0) delete newCat[scId];
      const next = { ...prev, [catId]: newCat };
      if (Object.keys(newCat).length === 0) delete next[catId];
      return next;
    });
  };

  const isOn = (catId: string, scId: string, prestId: string) =>
    selection[catId]?.[scId]?.includes(prestId) || false;

  const resume = useMemo(
    () =>
      categories.flatMap((cat) =>
        (cat.sousCategories as SousCategorie[]).flatMap((sc) =>
          (selection[cat.id]?.[sc.id] || []).map((pId) => ({
            catId: cat.id,
            catNom: cat.nom,
            catIcon: cat.icon,
            scId: sc.id,
            scNom: sc.nom,
            prestId: pId,
            prestNom: sc.prestations.find((p) => p.id === pId)?.nom || pId,
          })),
        ),
      ),
    [selection, categories],
  );

  const handleSubmit = () => {
    if (total === 0) {
      setError("Sélectionnez au moins une compétence pour continuer");
      return;
    }
    const catIds = [...new Set(resume.map((r) => r.catId))];
    sessionStorage.setItem(
      "prestataire_step2",
      JSON.stringify({ competences: catIds, prestations: resume }),
    );
    router.push(routes.auth.register.prestataire.step3);
  };

  return (
    <AuthLayout variant="prestataire">
      <ProgressSteps
        currentStep={2}
        totalSteps={4}
        completedSteps={[1]}
        onStepClick={handleStepClick}
      />

      {/* ── Titre + instructions ── */}
      <div className="text-center mb-5">
        <div className="text-4xl mb-2">🛠️</div>
        <h1 className={`text-2xl font-bold ${colors.secondary.text} mb-3`}>
          Vos compétences
        </h1>
        <div
          className={`${colors.background.light} rounded-xl p-3 text-left space-y-1.5 text-sm border ${colors.border.light}`}
        >
          <p className={`font-semibold ${colors.text.primary} mb-1`}>
            Sélectionnez vos services :
          </p>
          <p className="flex items-center gap-2">
            <span className="text-emerald-500 text-base w-5 text-center">
              ✦
            </span>
            <span className={colors.text.secondary}>
              Choisissez jusqu'à{" "}
              <strong className={colors.secondary.text}>
                {MAX_CATEGORIES} catégories
              </strong>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-blue-500 text-sm w-5 text-center">◆</span>
            <span className={colors.text.secondary}>
              Pour chaque catégorie, jusqu'à{" "}
              <strong className={colors.neutral.text}>
                {MAX_SOUS_CATEGORIES_PAR_CATEGORIE} sous-catégories
              </strong>
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-purple-500 text-xs w-5 text-center">●</span>
            <span className={colors.text.secondary}>
              Pour chaque sous-catégorie, jusqu'à{" "}
              <strong className={colors.premium.text}>
                {MAX_COMPETENCES_PAR_SOUS_CATEGORIE} compétences
              </strong>
            </span>
          </p>
        </div>
      </div>

      {/* ── Compteurs PAR CATÉGORIE (dynamique) ── */}
      {selectedCatIds.length > 0 ? (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span
              className={`text-xs font-semibold ${colors.text.tertiary} uppercase tracking-wide px-2`}
            >
              {selectedCatIds.length}/{MAX_CATEGORIES} catégories sélectionnées
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {selectedCatIds.map((catId) => {
            const cat = categories.find((c) => c.id === catId)!;
            const scCount = nbSousCat(selection, catId);
            const compCount = Object.values(selection[catId] || {}).flat()
              .length;
            return (
              <div
                key={catId}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border ${colors.secondary.borderLight} ${colors.secondary.bg}`}
              >
                <div className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span
                    className={`text-sm font-semibold ${colors.secondary.textDark}`}
                  >
                    {cat.nom}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${colors.neutral.bg} ${colors.neutral.text} font-medium border border-blue-200 flex items-center gap-1`}
                  >
                    <span className="text-blue-400 text-xs">◆</span> {scCount}/
                    {MAX_SOUS_CATEGORIES_PAR_CATEGORIE}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${colors.premium.bg} ${colors.premium.text} font-medium border border-purple-200 flex items-center gap-1`}
                  >
                    <span className="text-purple-400 text-xs">●</span>{" "}
                    {compCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className={`text-center p-2.5 rounded-xl border-2 ${colors.secondary.borderLight} ${colors.secondary.bg}`}
          >
            <div className={`text-lg font-bold ${colors.secondary.text}`}>
              0
              <span className="text-xs font-normal text-gray-400">
                /{MAX_CATEGORIES}
              </span>
            </div>
            <div className="text-xs text-gray-500">Catégories</div>
          </div>
          <div
            className={`text-center p-2.5 rounded-xl border-2 border-blue-100 ${colors.neutral.bg}`}
          >
            <div className={`text-lg font-bold ${colors.neutral.text}`}>0</div>
            <div className="text-xs text-gray-500">Sous-catégories</div>
          </div>
          <div
            className={`text-center p-2.5 rounded-xl border-2 border-purple-100 ${colors.premium.bg}`}
          >
            <div className={`text-lg font-bold ${colors.premium.text}`}>0</div>
            <div className="text-xs text-gray-500">Compétences</div>
          </div>
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div
          className={`mb-3 p-2.5 ${colors.error.bg} border ${colors.error.border} rounded-lg`}
        >
          <p className={`${colors.error.text} text-xs text-center`}>
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* ── Arbre catégories ── */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span
          className={`text-xs font-semibold ${colors.text.tertiary} uppercase tracking-wide px-2`}
        >
          Liste des prestations
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="space-y-2 mb-4 max-h-72 overflow-y-auto pr-0.5">
        {categories.map((cat) => {
          const isOpen = openCat === cat.id;
          const inSel = !!selection[cat.id];
          const blocked = !inSel && selectedCatIds.length >= MAX_CATEGORIES;
          const scCount = nbSousCat(selection, cat.id);
          const compCount = Object.values(selection[cat.id] || {}).flat()
            .length;

          return (
            <div
              key={cat.id}
              className={`rounded-xl overflow-hidden border-2 transition-all ${
                inSel
                  ? "border-pink-300"
                  : blocked
                    ? "border-gray-100 opacity-40"
                    : `${colors.border.light} hover:border-pink-200`
              }`}
            >
              {/* Catégorie sélectionnée → fond rose clair / sinon fond vert */}
              <button
                type="button"
                disabled={blocked}
                onClick={() => toggleCat(cat.id)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${colors.secondary.bg} hover:opacity-90`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-500 text-base">✦</span>
                  <span className="text-xl">{cat.icon}</span>
                  <div className="text-left">
                    <div
                      className={`font-semibold text-sm ${colors.text.primary}`}
                    >
                      {cat.nom}
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${inSel ? "text-pink-400" : colors.secondary.text}`}
                    >
                      {scCount}/{MAX_SOUS_CATEGORIES_PAR_CATEGORIE}{" "}
                      sous-catégories
                      {compCount > 0 && ` · ${compCount} compétences`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {inSel && (
                    <span className="w-5 h-5 rounded-full bg-pink-400 text-white text-xs flex items-center justify-center">
                      ✓
                    </span>
                  )}
                  <svg
                    className={`w-4 h-4 ${inSel ? "text-pink-400" : colors.secondary.text} transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                </div>
              </button>

              {/* Sous-catégories → fond bleu */}
              {isOpen && (
                <div className={`border-t ${colors.secondary.borderLight}`}>
                  {cat.sousCategories.map((sc) => {
                    const scOpen = openSc === sc.id;
                    const scSelected = nbComp(selection, cat.id, sc.id);
                    const scBlocked =
                      !selection[cat.id]?.[sc.id] &&
                      nbSousCat(selection, cat.id) >=
                        MAX_SOUS_CATEGORIES_PAR_CATEGORIE;

                    return (
                      <div
                        key={sc.id}
                        className={`border-b border-blue-100 last:border-0 ${scBlocked ? "opacity-40" : ""}`}
                      >
                        {/* Header sous-cat */}
                        <button
                          type="button"
                          disabled={scBlocked}
                          onClick={() => toggleSc(cat.id, sc.id)}
                          className={`w-full flex items-center justify-between px-5 py-2.5 text-sm transition-colors ${
                            scOpen
                              ? "bg-blue-100"
                              : `${colors.neutral.bg} hover:bg-blue-100`
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400 text-sm">◆</span>
                            <span
                              className={`font-medium ${scSelected > 0 ? colors.neutral.text : "text-gray-600"}`}
                            >
                              {sc.nom}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-semibold ${scSelected >= MAX_COMPETENCES_PAR_SOUS_CATEGORIE ? colors.error.text : colors.neutral.text}`}
                            >
                              {scSelected}/{MAX_COMPETENCES_PAR_SOUS_CATEGORIE}
                            </span>
                            <svg
                              className={`w-3.5 h-3.5 ${colors.neutral.text} transition-transform ${scOpen ? "rotate-180" : ""}`}
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
                          </div>
                        </button>

                        {/* Compétences → fond gris, checkbox violet */}
                        {scOpen && (
                          <div
                            className={`${colors.background.light} px-6 py-2 border-t border-blue-100`}
                          >
                            <p
                              className={`text-xs ${colors.premium.text} font-medium mb-2`}
                            >
                              {scSelected}/{MAX_COMPETENCES_PAR_SOUS_CATEGORIE}{" "}
                              compétences sélectionnées
                            </p>
                            <div className="space-y-1.5">
                              {sc.prestations.map((prest) => {
                                const on = isOn(cat.id, sc.id, prest.id);
                                const compBlocked =
                                  !on &&
                                  scSelected >=
                                    MAX_COMPETENCES_PAR_SOUS_CATEGORIE;
                                return (
                                  <label
                                    key={prest.id}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors border ${
                                      on
                                        ? `${colors.premium.bg} border-purple-300`
                                        : compBlocked
                                          ? "opacity-40 cursor-not-allowed bg-white border-gray-200"
                                          : `bg-white ${colors.border.light} hover:border-purple-300 hover:${colors.premium.bg}`
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={on}
                                      disabled={compBlocked}
                                      onChange={() =>
                                        !compBlocked &&
                                        toggleComp(cat.id, sc.id, prest.id)
                                      }
                                      className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
                                    />
                                    <span className="text-purple-400 text-xs">
                                      ●
                                    </span>
                                    <span
                                      className={`text-sm ${on ? `${colors.premium.text} font-medium` : "text-gray-700"}`}
                                    >
                                      {prest.nom}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Récapitulatif hiérarchique ── */}
      {resume.length > 0 && (
        <div
          className={`mb-4 p-3.5 ${colors.background.white} border-2 ${colors.secondary.borderLight} rounded-xl`}
        >
          <p
            className={`text-xs font-bold ${colors.secondary.textDark} mb-3 uppercase tracking-wide`}
          >
            ✅ Ma sélection ({total} compétence{total > 1 ? "s" : ""})
          </p>
          <div className="space-y-3">
            {selectedCatIds.map((catId) => {
              const cat = categories.find((c) => c.id === catId)!;
              const catResume = resume.filter((r) => r.catId === catId);
              const scIds = [...new Set(catResume.map((r) => r.scId))];
              return (
                <div key={catId}>
                  {/* Catégorie → vert */}
                  <div
                    className={`flex items-center gap-2 px-2 py-1 rounded-lg ${colors.secondary.bg} border ${colors.secondary.borderLight} mb-1.5`}
                  >
                    <span className="text-emerald-500 text-base">✦</span>
                    <span>{cat.icon}</span>
                    <span
                      className={`text-xs font-bold ${colors.secondary.textDark}`}
                    >
                      {cat.nom}
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-2">
                    {scIds.map((scId) => {
                      const scResume = catResume.filter((r) => r.scId === scId);
                      return (
                        <div key={scId}>
                          {/* Sous-catégorie → bleu */}
                          <div
                            className={`text-xs font-medium px-2 py-0.5 rounded ${colors.neutral.bg} ${colors.neutral.text} mb-1 inline-flex items-center gap-1 border border-blue-200`}
                          >
                            <span className="text-blue-400">◆</span>{" "}
                            {scResume[0]?.scNom}
                          </div>
                          {/* Compétences → violet cliquables */}
                          <div className="flex flex-wrap gap-1 pl-1">
                            {scResume.map((r) => (
                              <button
                                key={r.prestId}
                                type="button"
                                onClick={() =>
                                  toggleComp(r.catId, r.scId, r.prestId)
                                }
                                title="Cliquer pour retirer"
                                className={`text-xs px-2 py-1 ${colors.premium.bg} ${colors.premium.text} border border-purple-300 rounded-full hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition flex items-center gap-1`}
                              >
                                <span className="text-purple-400 text-xs">
                                  ●
                                </span>{" "}
                                {r.prestNom}{" "}
                                <span className="opacity-60">✕</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.push(routes.auth.register.prestataire.step1)}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ← Retour
        </Button>
        <Button
          type="button"
          variant="secondary"
          fullWidth
          size="lg"
          onClick={handleSubmit}
          disabled={total === 0}
          className={`text-white`}
        >
          Continuer →{total > 0 ? ` (${total})` : ""}
        </Button>
      </div>
    </AuthLayout>
  );
}

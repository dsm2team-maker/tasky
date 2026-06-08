"use client";

import { colors } from "@/config/colors";

// ─── Section catégorie (commune client + prestataire) ─────────────────────────

interface CategoryProps {
  category: { icon: string; nom: string };
  subCategory?: { nom: string } | null;
  interventionIds?: string[];
}

export const DemandCardCategory: React.FC<CategoryProps> = ({ category, subCategory, interventionIds }) => (
  <div className="flex flex-wrap gap-2 mb-3">
    <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}>
      {category.icon} {category.nom}
    </span>
    {subCategory && (
      <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}>
        › {subCategory.nom}
      </span>
    )}
    {interventionIds && interventionIds.length > 0 && (
      <span className={`text-xs px-2.5 py-1 rounded-lg ${colors.background.gray} ${colors.text.secondary}`}>
        › {interventionIds.length} intervention(s)
      </span>
    )}
  </div>
);

// ─── Section méta-infos (commune client + prestataire) ────────────────────────

interface MetaProps {
  ville?: string | null;
  budget?: number | null;
  delaiJours?: number | null;
  createdAt: string;
}

export const DemandCardMeta: React.FC<MetaProps> = ({ ville, budget, delaiJours, createdAt }) => (
  <div className="flex flex-wrap gap-3 mb-3">
    {ville && <span className={`text-xs ${colors.text.secondary}`}>📍 {ville}</span>}
    {budget && <span className={`text-xs ${colors.text.secondary}`}>💶 {budget} €</span>}
    {delaiJours && (
      <span className={`text-xs ${colors.text.secondary}`}>
        ⏱️ {delaiJours} jour{delaiJours > 1 ? "s" : ""}
      </span>
    )}
    <span className={`text-xs ${colors.text.muted}`}>
      Publié le {new Date(createdAt).toLocaleDateString("fr-FR")}
    </span>
  </div>
);

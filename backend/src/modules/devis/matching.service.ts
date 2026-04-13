// =============================================================================
// TASKY — Algorithme de matching prestataire / demande
// =============================================================================

export type MatchLabel = "PARFAIT" | "BON" | "PARTIEL";

export interface MatchScore {
  prestataireId: string;
  score: number;
  label: MatchLabel;
  details: {
    categorie: number;
    sousCategorie: number;
    interventions: number;
    ville: number;
    rating: number;
  };
}

interface DemandeForMatching {
  categoryId: string;
  subCategoryId?: string | null;
  interventionIds: string[];
  ville?: string | null;
}

interface PrestataireForMatching {
  id: string;
  disponibilite: string;
  rating: number;
  iban: string | null;
  bio: string | null;
  pointDepotAdresse: string | null;
  user: { city?: string | null };
  competences: {
    categoryId: string;
    subCategoryId?: string | null;
    interventionId?: string | null;
  }[];
}

const BIO_MIN = 100;

export const calculerScore = (
  demande: DemandeForMatching,
  prestataire: PrestataireForMatching,
): MatchScore | null => {
  // ── Hard filters ────────────────────────────────────────────────────────────
  if (prestataire.disponibilite !== "ACTIF") return null;
  if (!prestataire.iban) return null;
  if (!prestataire.bio || prestataire.bio.length < BIO_MIN) return null;
  if (!prestataire.pointDepotAdresse) return null;

  const aCategorie = prestataire.competences.some(
    (c) => c.categoryId === demande.categoryId,
  );
  if (!aCategorie) return null;

  // ── Scoring ─────────────────────────────────────────────────────────────────
  let score = 0;
  const details = {
    categorie: 0,
    sousCategorie: 0,
    interventions: 0,
    ville: 0,
    rating: 0,
  };

  // Catégorie (40 pts)
  details.categorie = 40;
  score += 40;

  // Sous-catégorie (25 pts)
  if (demande.subCategoryId) {
    const aSousCategorie = prestataire.competences.some(
      (c) => c.subCategoryId === demande.subCategoryId,
    );
    if (aSousCategorie) {
      details.sousCategorie = 25;
      score += 25;
    }
  }

  // Interventions (20 pts, ratio)
  if (demande.interventionIds.length > 0) {
    const prestataireInterventions = prestataire.competences
      .map((c) => c.interventionId)
      .filter(Boolean) as string[];

    const matched = demande.interventionIds.filter((id) =>
      prestataireInterventions.includes(id),
    ).length;

    const ratio = matched / demande.interventionIds.length;
    details.interventions = Math.round(ratio * 20);
    score += details.interventions;
  }

  // Ville (10 pts)
  if (
    demande.ville &&
    prestataire.user.city?.toLowerCase() === demande.ville.toLowerCase()
  ) {
    details.ville = 10;
    score += 10;
  }

  // Rating (5 pts max)
  details.rating = Math.round((prestataire.rating / 5) * 5 * 10) / 10;
  score += details.rating;

  // ── Label ───────────────────────────────────────────────────────────────────
  const label: MatchLabel =
    score >= 90 ? "PARFAIT" : score >= 65 ? "BON" : "PARTIEL";

  return { prestataireId: prestataire.id, score, label, details };
};

// Bornes communes aux montants saisis par les prestataires (devis, révision d'état des lieux).
// Stripe refuse < 0,50 € et > 999 999,99 € : un montant hors bornes rendait la prestation
// impayable et bloquée (SEC-012 / SEC-013). Le plafond est une décision métier à ajuster.
export const MONTANT_MIN = 1;
export const MONTANT_MAX = 50_000;
export const DELAI_MAX_JOURS = 365;
export const DESCRIPTION_DEVIS_MAX = 5_000;
export const PHOTOS_MAX = 10;

// Nombre ou chaîne décimale simple, 2 décimales max (rejette "1e3", "Infinity", "-5", "12,50")
const MONTANT_REGEX = /^\d+(\.\d{1,2})?$/;

export const parseMontant = (value: unknown): number | null => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const raw = String(value).trim();
  if (!MONTANT_REGEX.test(raw)) return null;
  const montant = Number(raw);
  if (!Number.isFinite(montant) || montant < MONTANT_MIN || montant > MONTANT_MAX) return null;
  return montant;
};

export const parseDelai = (value: unknown): number | null => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const delai = Number(value);
  if (!Number.isInteger(delai) || delai < 1 || delai > DELAI_MAX_JOURS) return null;
  return delai;
};

// Photos : uniquement des URLs publiques du stockage Supabase du projet (pas d'URL arbitraire
// rendue chez le client). Sans SUPABASE_URL configuré, aucune photo n'est acceptée.
export const parsePhotos = (value: unknown, supabaseUrl = process.env.SUPABASE_URL): string[] | null => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > PHOTOS_MAX) return null;
  if (value.length === 0) return [];
  if (!supabaseUrl) return null;
  const prefix = `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/`;
  const ok = value.every(
    (p) => typeof p === "string" && p.length <= 1_000 && p.startsWith(prefix) && !p.includes(".."),
  );
  return ok ? (value as string[]) : null;
};

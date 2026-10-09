import { prisma } from "../lib/prisma";

// Emails insensibles à la casse (SEC-017). Les nouveaux comptes sont stockés en minuscules ;
// les recherches tolèrent les comptes historiques enregistrés avec des majuscules, sans
// migration de données.

export const normalizeEmail = (value: unknown) => String(value ?? "").trim().toLowerCase();

const sameEmail = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

const findCaseInsensitive = async (input: string) => {
  const candidates = await prisma.user.findMany({
    where: { email: { equals: input, mode: "insensitive" } },
    take: 5,
  });
  // Filtre strict côté application : ne dépend pas de la traduction SQL de "insensitive"
  return candidates.filter((u) => sameEmail(u.email, input));
};

// Retourne le compte correspondant à l'email, quelle que soit la casse.
// S'il existe des doublons historiques ne différant que par la casse, on ne devine pas :
// seule une correspondance exacte (saisie telle quelle, puis en minuscules) est retenue.
export const findUserByEmail = async (value: unknown) => {
  const input = String(value ?? "").trim();
  if (!input) return null;
  const matches = await findCaseInsensitive(input);
  if (matches.length <= 1) return matches[0] ?? null;
  return matches.find((u) => u.email === input) ?? matches.find((u) => u.email === input.toLowerCase()) ?? null;
};

export const emailExists = async (value: unknown) => {
  const input = String(value ?? "").trim();
  if (!input) return false;
  return (await findCaseInsensitive(input)).length > 0;
};

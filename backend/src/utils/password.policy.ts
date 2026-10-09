import { z } from "zod";

// Politique unique pour tout nouveau mot de passe : inscription et réinitialisation (SEC-016).
// Alignée sur le formulaire front (src/lib/schemas.ts). Le login n'applique PAS cette politique :
// les mots de passe existants restent valides.
// Max 64 : bcrypt ignore tout au-delà de 72 octets, on reste en dessous (y compris accents).
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;

export const passwordSchema = z
  .string({ required_error: "Mot de passe requis", invalid_type_error: "Mot de passe invalide" })
  .min(PASSWORD_MIN, `Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères`)
  .max(PASSWORD_MAX, `Le mot de passe ne peut pas dépasser ${PASSWORD_MAX} caractères`)
  .regex(/[A-Z]/, "Au moins une majuscule requise")
  .regex(/[a-z]/, "Au moins une minuscule requise")
  .regex(/[0-9]/, "Au moins un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial requis");

// Premier message d'erreur, ou null si le mot de passe est conforme
export const checkPassword = (value: unknown): string | null => {
  const r = passwordSchema.safeParse(value);
  return r.success ? null : r.error.issues[0].message;
};

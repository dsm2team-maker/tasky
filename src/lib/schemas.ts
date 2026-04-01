// Schémas de validation Zod pour tous les formulaires
import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(12, "Le mot de passe ne peut pas dépasser 12 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule requise")
  .regex(/[a-z]/, "Au moins une minuscule requise")
  .regex(/[0-9]/, "Au moins un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial requis");

// Validation téléphone mobile français (06 ou 07, 10 chiffres)
export const phoneSchema = z
  .string()
  .min(1, "Le numéro de téléphone est requis")
  .transform((val) => val.replace(/\s/g, ""))
  .refine(
    (val) => /^0[67]\d{8}$/.test(val),
    "Numéro invalide. Format attendu : 06 XX XX XX XX ou 07 XX XX XX XX",
  );

// ─── Inscription Client + Prestataire (même formulaire) ───────────────────────
export const registerClientSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    city: z.string().min(2, "La ville est requise"),
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirmez votre mot de passe"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les CGU",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type RegisterClientInput = z.infer<typeof registerClientSchema>;

// ─── Connexion ────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Mot de passe oublié ──────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

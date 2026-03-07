// Schémas de validation Zod pour tous les formulaires
import { z } from "zod";

// Schéma commun pour l'email
export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Format d'email invalide")
  .toLowerCase();

// Schéma commun pour le mot de passe
export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule requise")
  .regex(/[a-z]/, "Au moins une minuscule requise")
  .regex(/[0-9]/, "Au moins un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial requis");

// US1 - Inscription Client
export const registerClientSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    city: z.string().min(2, "La ville est requise"),
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

// US2 - Étape 1 : Inscription Artisan (compte de base)
export const registerArtisanStep1Schema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    city: z.string().min(2, "La ville est requise"),
    phone: z.string().min(10, "Téléphone invalide"),
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

export type RegisterArtisanStep1Input = z.infer<
  typeof registerArtisanStep1Schema
>;

// US2 - Étape 2 : Profil Public
export const artisanProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Maximum 50 caractères"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Maximum 50 caractères"),
  bio: z
    .string()
    .min(20, "La bio doit contenir au moins 20 caractères")
    .max(500, "Maximum 500 caractères"),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Code postal invalide (5 chiffres requis)"),
  profilePicture: z
    .instanceof(File, { message: "Une photo de profil est requise" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "La photo doit faire moins de 5 Mo",
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Format accepté : JPG, PNG ou WEBP",
    ),
});

export type ArtisanProfileInput = z.infer<typeof artisanProfileSchema>;

// US2 - Étape 3 : Vérification d'identité
export const identityVerificationSchema = z.object({
  identityDocument: z
    .instanceof(File, { message: "Une pièce d'identité est requise" })
    .refine(
      (file) => file.size <= 10 * 1024 * 1024,
      "Le document doit faire moins de 10 Mo",
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
          file.type,
        ),
      "Format accepté : JPG, PNG, WEBP ou PDF",
    ),
  documentType: z.enum(["CNI", "PASSPORT"], {
    message: "Sélectionnez le type de document",
  }),
});

export type IdentityVerificationInput = z.infer<
  typeof identityVerificationSchema
>;

// US2 - Étape 4 : CGU Artisan
export const artisanTermsSchema = z.object({
  acceptArtisanTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les CGU Artisan",
  }),
});

export type ArtisanTermsInput = z.infer<typeof artisanTermsSchema>;

// Schéma de connexion
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Mot de passe oublié
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

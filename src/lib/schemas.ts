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
  .regex(/[A-Z]/, "Au moins une majuscule requise")
  .regex(/[a-z]/, "Au moins une minuscule requise")
  .regex(/[0-9]/, "Au moins un chiffre requis")
  .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial requis");

// Validation téléphone mobile français (06 ou 07, 10 chiffres)
export const phoneSchema = z
  .string()
  .min(1, "Le numéro de téléphone est requis")
  .transform((val) => val.replace(/\s/g, "")) // Supprimer les espaces
  .refine(
    (val) => /^0[67]\d{8}$/.test(val),
    "Numéro invalide. Format attendu : 06 XX XX XX XX ou 07 XX XX XX XX",
  );

// Inscription Client
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

// Inscription Prestataire - Étape 1
export const registerPrestataireStep1Schema = z
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

export type RegisterPrestataireStep1Input = z.infer<
  typeof registerPrestataireStep1Schema
>;

export const registerArtisanStep1Schema = registerPrestataireStep1Schema;
export type RegisterArtisanStep1Input = RegisterPrestataireStep1Input;

// Profil Prestataire
export const prestataireProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  bio: z
    .string()
    .min(20, "La bio doit contenir au moins 20 caractères")
    .max(500),
  postalCode: z.string().regex(/^[0-9]{5}$/, "Code postal invalide"),
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

export type PrestataireProfileInput = z.infer<typeof prestataireProfileSchema>;
export const artisanProfileSchema = prestataireProfileSchema;
export type ArtisanProfileInput = PrestataireProfileInput;

// Vérification d'identité
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

// CGU Prestataire - Étape 4
export const prestataireTermsSchema = z.object({
  acceptPrestataireTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les CGU Prestataire",
  }),
});

export type PrestataireTermsInput = z.infer<typeof prestataireTermsSchema>;
export const artisanTermsSchema = prestataireTermsSchema;
export type ArtisanTermsInput = PrestataireTermsInput;

// Connexion
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Mot de passe oublié
export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

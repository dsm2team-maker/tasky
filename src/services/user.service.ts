/**
 * 🔌 TASKY — Service utilisateur frontend
 * Appels HTTP vers le backend — aucune logique métier ici
 */
import { apiClient } from "@/lib/api-client";
import { routes } from "@/config/routes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  city: string | null;
  avatar: string | null;
  phoneMasked: string | null;
  role: "CLIENT" | "PRESTATAIRE" | "ADMIN";
  emailVerified: boolean;
  createdAt: string;
  client?: { id: string } | null;
  prestataire?: {
    id: string;
    bio: string | null;
    rating: number;
    reviewCount: number;
    disponibilite: "ACTIF" | "OCCUPE" | "ABSENT";
    pointDepotAdresse: string | null;
    pointDepotVille: string | null;
    pointDepotCodePostal: string | null;
    pointDepotLat: number | null;
    pointDepotLng: number | null;
    pointDepotInstructions: string | null;
    tauxReussite: number;
    delaiMoyen: number;
    tempsReponse: number;
    iban: string | null;
    bic: string | null;
    bankName: string | null;
    ibanVerified: boolean;
  } | null;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  city?: string | null;
}

export interface UpdatePrestatairePayload {
  bio?: string;
  disponibilite?: "ACTIF" | "OCCUPE" | "ABSENT";
  pointDepotAdresse?: string;
  pointDepotVille?: string;
  pointDepotCodePostal?: string;
  pointDepotLat?: number;
  pointDepotLng?: number;
  pointDepotInstructions?: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  ibanVerified?: boolean;
}

// ─── Types compétences ────────────────────────────────────────────────────────

export interface CompetenceInput {
  categoryId: string;
  subCategoryId?: string;
  interventionId?: string;
}

export interface CompetenceItem {
  id: string;
  categoryId: string;
  category: {
    id: string;
    nom: string;
    icon: string;
    slug: string;
  };
  subCategoryId: string | null;
  subCategory: {
    id: string;
    nom: string;
    slug: string;
  } | null;
  interventionId: string | null;
  intervention: {
    id: string;
    nom: string;
  } | null;
}

export interface PrestataireStats {
  rating: number;
  reviewCount: number;
  nbPrestations: number;
}

// ─── Appels API ───────────────────────────────────────────────────────────────

export const userService = {
  // ── Profil commun ─────────────────────────────────────────────────────────

  getProfile: () =>
    apiClient.get<{ success: boolean; data: UserProfile }>(
      routes.api.users.profile,
    ),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.patch<{ success: boolean; message: string; data: UserProfile }>(
      routes.api.users.profile,
      data,
    ),

  uploadAvatar: (imageData: string) =>
    apiClient.post<{ success: boolean; data: { avatarUrl: string } }>(
      routes.api.users.avatar,
      { imageData },
    ),

  requestPhoneChange: (newPhone: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.requestPhoneChange,
      { newPhone },
    ),

  verifyPhoneOtp: (otp: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.verifyPhoneOtp,
      { otp },
    ),

  requestEmailChange: (newEmail: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.requestEmailChange,
      { newEmail },
    ),

  verifyEmailOtp: (otp: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.verifyEmailOtp,
      { otp },
    ),

  // ── Prestataire ───────────────────────────────────────────────────────────

  updatePrestataireProfile: (data: UpdatePrestatairePayload) =>
    apiClient.patch<{ success: boolean; message: string; data: any }>(
      "/api/users/prestataire",
      data,
    ),

  getPrestataireCompetences: () =>
    apiClient.get<{ success: boolean; data: CompetenceItem[] }>(
      "/api/users/prestataire/competences",
    ),

  updatePrestataireCompetences: (competences: CompetenceInput[]) =>
    apiClient.put<{
      success: boolean;
      message: string;
      data: CompetenceItem[];
    }>("/api/users/prestataire/competences", { competences }),

  getPrestataireStats: () =>
    apiClient.get<{ success: boolean; data: PrestataireStats }>(
      "/api/users/prestataire/stats",
    ),
};

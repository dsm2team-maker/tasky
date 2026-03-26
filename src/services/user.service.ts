/**
 * 🔌 TASKY — Service utilisateur
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
    verified: boolean;
  } | null;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  city?: string | null;
}

// ─── Appels API ───────────────────────────────────────────────────────────────

export const userService = {
  // GET /api/users/profile
  getProfile: () =>
    apiClient.get<{ success: boolean; data: UserProfile }>(
      routes.api.users.profile,
    ),

  // PATCH /api/users/profile
  updateProfile: (data: UpdateProfilePayload) =>
    apiClient.patch<{ success: boolean; message: string; data: UserProfile }>(
      routes.api.users.profile,
      data,
    ),

  // POST /api/users/avatar
  uploadAvatar: (imageData: string) =>
    apiClient.post<{ success: boolean; data: { avatarUrl: string } }>(
      routes.api.users.avatar,
      { imageData },
    ),

  // POST /api/users/profile/request-phone-change
  requestPhoneChange: (newPhone: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.requestPhoneChange,
      { newPhone },
    ),

  // POST /api/users/profile/verify-phone-otp
  verifyPhoneOtp: (otp: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.verifyPhoneOtp,
      { otp },
    ),

  // POST /api/users/profile/request-email-change
  requestEmailChange: (newEmail: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.requestEmailChange,
      { newEmail },
    ),

  // POST /api/users/profile/verify-email-otp
  verifyEmailOtp: (otp: string) =>
    apiClient.post<{ success: boolean; message: string }>(
      routes.api.users.verifyEmailOtp,
      { otp },
    ),
};

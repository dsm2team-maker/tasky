import { apiClient } from "@/lib/api-client";

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  clientFirstName: string;
  clientAvatar: string | null;
}

export interface PublicPrestataire {
  id: string;
  firstName: string;
  city: string | null;
  avatar: string | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  disponibilite: string;
  pointDepotAdresse: string | null;
  pointDepotVille: string | null;
  pointDepotCodePostal: string | null;
  pointDepotInstructions: string | null;
  tauxReussite: number | null;
  delaiMoyen: number | null;
  nbPrestations: number;
  memberSince: string;
  competences: { id: string; categoryId: string; category: { id: string; nom: string; icon: string } }[];
  reviews: PublicReview[];
}

export const prestataireService = {
  getProfil: (id: string) =>
    apiClient.get<{ success: boolean; data: PublicPrestataire }>(`/api/prestataires/${id}`),

  list: (filters?: { city?: string; categoryId?: string; disponibilite?: string; nom?: string }) => {
    const params = new URLSearchParams();
    if (filters?.city) params.set("city", filters.city);
    if (filters?.categoryId) params.set("categoryId", filters.categoryId);
    if (filters?.disponibilite) params.set("disponibilite", filters.disponibilite);
    if (filters?.nom) params.set("nom", filters.nom);
    const qs = params.toString();
    return apiClient.get<{ success: boolean; data: PublicPrestataire[] }>(
      `/api/prestataires${qs ? `?${qs}` : ""}`,
    );
  },
};

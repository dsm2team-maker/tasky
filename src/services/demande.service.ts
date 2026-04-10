import { apiClient } from "@/lib/api-client";

export interface CreateDemandePayload {
  titre: string;
  description: string;
  typePrestation: "MODIFICATION" | "CREATION" | "FORMATION";
  categoryId: string;
  subCategoryId?: string;
  interventionIds?: string[];
  budget?: number;
  ville?: string;
  photos?: string[];
  dateEcheance?: string;
  urgence: "NORMAL" | "URGENT" | "TRES_URGENT";
}

export interface Demande {
  id: string;
  titre: string;
  description: string;
  typePrestation: "MODIFICATION" | "CREATION" | "FORMATION";
  categoryId: string;
  category: { id: string; nom: string; icon: string };
  subCategoryId?: string;
  subCategory?: { id: string; nom: string };
  interventionIds: string[];
  budget?: number;
  ville?: string;
  photos: string[];
  dateEcheance?: string;
  urgence: "NORMAL" | "URGENT" | "TRES_URGENT";
  status:
    | "PUBLIEE"
    | "EN_ATTENTE"
    | "EN_COURS"
    | "A_VALIDER"
    | "TERMINEE"
    | "SUPPRIMEE"
    | "ANNULEE";
  createdAt: string;
  _count?: { devis: number };
}

export const demandeService = {
  create: (data: CreateDemandePayload) =>
    apiClient.post<{ success: boolean; data: Demande }>("/api/demandes", data),

  getMyDemandes: () =>
    apiClient.get<{ success: boolean; data: Demande[] }>("/api/demandes"),

  getDemande: (id: string) =>
    apiClient.get<{ success: boolean; data: Demande }>(`/api/demandes/${id}`),

  delete: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/api/demandes/${id}`),
};

import { apiClient } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EtatDesLieux {
  id: string;
  prestationId: string;
  description: string;
  photos: string[];
  montantRevise: number | null;
  status: "EN_ATTENTE" | "VALIDE" | "REFUSE";
  createdAt: string;
}

export interface Prestation {
  id: string;
  demandeId: string;
  prestataireId: string;
  montant: number;
  montantFinal: number | null;
  status: "EN_ATTENTE_INSPECTION" | "EN_ATTENTE_PAIEMENT" | "EN_COURS" | "A_VALIDER" | "TERMINEE" | "ANNULEE";
  createdAt: string;
  completedAt: string | null;
  validatedAt: string | null;
  autoValidateAt: string | null;
  demande: {
    id: string;
    titre: string;
    description: string;
    typePrestation: "MODIFICATION" | "CREATION" | "FORMATION";
    photos: string[];
    ville: string | null;
    category: { id: string; nom: string; icon: string };
    subCategory: { id: string; nom: string } | null;
    client?: {
      user: {
        firstName: string;
        lastName: string;
        avatar: string | null;
        city: string | null;
        phone?: string | null;
      };
    };
  };
  prestataire?: {
    id: string;
    rating: number;
    user: { firstName: string; lastName: string; avatar: string | null };
  };
  etatDesLieux: EtatDesLieux | null;
  review: { rating: number; comment?: string | null } | null;
}

export interface CreerEtatDesLieuxPayload {
  description: string;
  photos?: string[];
  montantRevise?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const prestationService = {
  // Prestataire
  getMesPrestations: () =>
    apiClient.get<{ success: boolean; data: Prestation[] }>("/api/prestations"),

  getPrestationDetail: (id: string) =>
    apiClient.get<{ success: boolean; data: Prestation }>(
      `/api/prestations/${id}`,
    ),

  creerEtatDesLieux: (id: string, data: CreerEtatDesLieuxPayload) =>
    apiClient.post<{ success: boolean; data: EtatDesLieux }>(
      `/api/prestations/${id}/etat-des-lieux`,
      data,
    ),

  marquerTermine: (id: string) =>
    apiClient.patch<{ success: boolean }>(
      `/api/prestations/${id}/terminer`,
      {},
    ),

  // Client
  getMesPrestationsClient: () =>
    apiClient.get<{ success: boolean; data: Prestation[] }>(
      "/api/prestations/client",
    ),

  validerPrestation: (id: string) =>
    apiClient.patch<{ success: boolean }>(`/api/prestations/${id}/valider`, {}),

  contesterPrestation: (id: string) =>
    apiClient.patch<{ success: boolean }>(
      `/api/prestations/${id}/contester`,
      {},
    ),

  validerEtatDesLieux: (id: string, accepte: boolean) =>
    apiClient.patch<{ success: boolean }>(
      `/api/prestations/${id}/etat-des-lieux/valider`,
      { accepte },
    ),

  confirmerConformite: (id: string) =>
    apiClient.patch<{ success: boolean }>(
      `/api/prestations/${id}/confirmer-conformite`,
      {},
    ),

  // Stub Stripe — à remplacer par webhook en production
  passerEnCours: (id: string) =>
    apiClient.patch<{ success: boolean }>(`/api/prestations/${id}/payer`, {}),

  creerReview: (id: string, data: { rating: number; comment?: string }) =>
    apiClient.post<{ success: boolean }>(`/api/prestations/${id}/review`, data),
};

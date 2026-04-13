import { apiClient } from "@/lib/api-client";
import type { Demande } from "@/services/demande.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchLabel = "PARFAIT" | "BON" | "PARTIEL";

export interface MatchScore {
  score: number;
  label: MatchLabel;
  details: {
    categorie: number;
    sousCategorie: number;
    interventions: number;
    ville: number;
    rating: number;
  };
}

export interface DemandeDisponible extends Demande {
  matching: MatchScore;
  client: {
    user: { firstName: string; avatar: string | null; city: string | null };
  };
  _count: { devis: number };
}

export interface Devis {
  id: string;
  demandeId: string;
  prestataireId: string;
  montant: number;
  delai: number;
  description: string;
  status: "ENVOYE" | "ACCEPTE" | "REFUSE" | "EXPIRE";
  expiresAt: string;
  createdAt: string;
  prestataire: {
    id: string;
    bio: string | null;
    rating: number;
    reviewCount: number;
    user: {
      firstName: string;
      lastName: string;
      avatar: string | null;
      city: string | null;
    };
  };
}

export interface EnvoyerDevisPayload {
  montant: number;
  delai: number;
  description: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const devisService = {
  // Prestataire
  getDemandesDisponibles: () =>
    apiClient.get<{ success: boolean; data: DemandeDisponible[] }>(
      "/api/demandes/available",
    ),

  getDemandeDetail: (id: string) =>
    apiClient.get<{
      success: boolean;
      data: DemandeDisponible & { devisExistant: boolean };
    }>(`/api/demandes/${id}/detail`),

  envoyerDevis: (demandeId: string, data: EnvoyerDevisPayload) =>
    apiClient.post<{ success: boolean; data: Devis }>(
      `/api/demandes/${demandeId}/devis`,
      data,
    ),

  // Client
  getDevisDemande: (demandeId: string) =>
    apiClient.get<{
      success: boolean;
      data: { demande: Demande; devis: Devis[] };
    }>(`/api/demandes/${demandeId}/devis`),

  accepterDevis: (devisId: string) =>
    apiClient.patch<{ success: boolean }>(`/api/devis/${devisId}/accept`, {}),

  refuserDevis: (devisId: string) =>
    apiClient.patch<{ success: boolean }>(`/api/devis/${devisId}/refuse`, {}),
};

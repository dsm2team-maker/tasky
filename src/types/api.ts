// ─── Types API centralisés ────────────────────────────────────────────────────
// Source unique de vérité pour tous les types retournés par le backend.
// Les services importent depuis ici plutôt que de redéfinir leurs propres types.

// ─── Réponse API générique ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: Record<string, string[]>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: "CLIENT" | "PRESTATAIRE" | "ADMIN";
  firstName: string;
  lastName: string;
  city?: string | null;
  phone?: string | null;
  avatar?: string | null;
  emailVerified: boolean;
  createdAt: string;
}

// ─── Profil utilisateur ───────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  city?: string | null;
  phone?: string | null;
  phoneMasked?: string | null;
  avatar?: string | null;
  emailVerified: boolean;
  createdAt: string;
  role: "CLIENT" | "PRESTATAIRE" | "ADMIN";
  prestataire?: PrestataireProfile | null;
  client?: ClientProfile | null;
}

export interface PrestataireProfile {
  id: string;
  bio?: string | null;
  disponibilite: "ACTIF" | "OCCUPE" | "ABSENT";
  rating: number;
  reviewCount: number;
  iban?: string | null;
  ibanVerified: boolean;
  pointDepotAdresse?: string | null;
  pointDepotCodePostal?: string | null;
  pointDepotVille?: string | null;
  pointDepotInstructions?: string | null;
  isActive: boolean;
}

export interface ClientProfile {
  id: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  city?: string;
}

export interface UpdatePrestatairePayload {
  bio?: string;
  disponibilite?: "ACTIF" | "OCCUPE" | "ABSENT";
  pointDepotAdresse?: string;
  pointDepotCodePostal?: string;
  pointDepotVille?: string;
  pointDepotInstructions?: string;
}

export interface CompetenceInput {
  categoryId: string;
  subCategoryId?: string;
  interventionId?: string;
}

export interface CompetenceItem {
  id: string;
  categoryId: string;
  subCategoryId?: string | null;
  interventionId?: string | null;
  category: { id: string; nom: string; icon: string };
  subCategory?: { id: string; nom: string } | null;
}

export interface PrestataireStats {
  totalPrestations: number;
  prestationsTerminees: number;
  enCours: number;
  tauxAcceptation: number;
  revenuTotal: number;
  rating: number;
  reviewCount: number;
}

// ─── Demandes ─────────────────────────────────────────────────────────────────

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
  delaiJours: number;
  urgence?: "NORMAL" | "URGENT" | "TRES_URGENT";
}

export interface Demande {
  id: string;
  reference: number;
  titre: string;
  description: string;
  typePrestation: "MODIFICATION" | "CREATION" | "FORMATION";
  status: string;
  ville?: string | null;
  budget?: number | null;
  delaiJours: number;
  urgence: "NORMAL" | "URGENT" | "TRES_URGENT";
  photos: string[];
  interventionIds: string[];
  createdAt: string;
  category: { id: string; nom: string; icon: string };
  subCategory?: { id: string; nom: string } | null;
  _count?: { devis: number };
}

// ─── Devis ────────────────────────────────────────────────────────────────────

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
  client: { user: { firstName: string; avatar?: string | null } };
}

export interface Devis {
  id: string;
  demandeId: string;
  montant: number;
  delai: number;
  description: string;
  status: "ENVOYE" | "ACCEPTE" | "REFUSE" | "EXPIRE";
  estSelectionnable: boolean;
  createdAt: string;
  prestataire: {
    id: string;
    rating: number;
    reviewCount: number;
    user: { firstName: string; lastName: string; avatar?: string | null; city?: string | null };
  };
}

export interface EnvoyerDevisPayload {
  montant: number;
  delai: number;
  description: string;
}

export interface StatsDevis {
  envoyes: number;
  acceptes: number;
  refuses: number;
  enAttente: number;
  tauxAcceptation: number;
}

export interface DevisRefuse {
  id: string;
  demandeId: string;
  montant: number;
  dismissedByPrestataire: boolean;
  demande: { titre: string; reference: number };
}

// ─── Prestations ──────────────────────────────────────────────────────────────

export interface EtatDesLieux {
  id: string;
  status: "EN_ATTENTE" | "ACCEPTE" | "REFUSE";
  description: string;
  photos: string[];
  photosApres?: string[];
  montantRevise?: number | null;
  commentaire?: string | null;
}

export interface Prestation {
  id: string;
  demandeId: string;
  prestataireId: string;
  montant: number;
  montantFinal?: number | null;
  status: string;
  stripePaymentIntentId?: string | null;
  autoValidateAt?: string | null;
  completedAt?: string | null;
  validatedAt?: string | null;
  createdAt: string;
  etatDesLieux?: EtatDesLieux | null;
}

export interface CreerEtatDesLieuxPayload {
  description: string;
  photos: string[];
  montantRevise?: number;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  prestationId: string;
  auteurId?: string | null;
  contenu: string;
  lu: boolean;
  isSystem: boolean;
  createdAt: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: "CLIENT" | "PRESTATAIRE";
}

export interface MessagesData {
  messages: Message[];
  participants: { client: Participant; prestataire: Participant };
}

// ─── Prestataires publics ─────────────────────────────────────────────────────

export interface PublicReview {
  id: string;
  note: number;
  commentaire?: string | null;
  createdAt: string;
  client: { user: { firstName: string; avatar?: string | null } };
}

export interface PublicPrestataire {
  id: string;
  bio?: string | null;
  disponibilite: string;
  rating: number;
  reviewCount: number;
  user: { firstName: string; lastName: string; city?: string | null; avatar?: string | null };
  competences: CompetenceItem[];
  reviews: PublicReview[];
}

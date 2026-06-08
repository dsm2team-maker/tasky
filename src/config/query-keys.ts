// ─── Source unique de vérité pour toutes les queryKeys React Query ────────────
// Importer depuis ici dans tous les hooks et pages pour éviter les désync de cache.

export const queryKeys = {
  // ── Profil ────────────────────────────────────────────────────────────────
  profile:      ["profile"] as const,
  competences:  ["profile", "competences"] as const,
  stats:        ["profile", "stats"] as const,

  // ── Demandes ──────────────────────────────────────────────────────────────
  demandes:     ["demandes"] as const,
  demande:      (id: string) => ["demandes", id] as const,

  // ── Devis ─────────────────────────────────────────────────────────────────
  devis:               (demandeId: string) => ["devis", demandeId] as const,
  devisDisponibles:    ["devis", "disponibles"] as const,
  demandeDetail:       (id: string) => ["demande-detail", id] as const,
  devisRefuses:        ["devis", "refuses"] as const,
  devisStats:          ["devis", "stats"] as const,

  // ── Prestations ───────────────────────────────────────────────────────────
  prestations:         ["prestations"] as const,
  prestation:          (id: string) => ["prestations", id] as const,
  prestationsClient:   ["prestations", "client"] as const,

  // ── Messages ──────────────────────────────────────────────────────────────
  messages:              (prestationId: string) => ["messages", prestationId] as const,
  messagesUnreadCount:   ["messages", "unread-count"] as const,
  messagesUnreadByPrestation: ["messages", "unread-by-prestation"] as const,

  // ── Prestataires (public) ─────────────────────────────────────────────────
  prestataire:      (id: string) => ["prestataire", id] as const,
  prestataires:     (filters: Record<string, unknown>) => ["prestataires", filters] as const,
  prestatairePublic: (id: string) => ["prestataire-public", id] as const,

  // ── Admin ─────────────────────────────────────────────────────────────────
  adminDashboard:   ["admin", "dashboard"] as const,
  adminUsers:       (page: number, search: string) => ["admin", "users", page, search] as const,
  adminPrestations: (page: number, status: string) => ["admin", "prestations", page, status] as const,
  adminPrestation:  (id: string) => ["admin", "prestations", id] as const,
  adminSignalements: (page: number) => ["admin", "signalements", page] as const,
  adminPaiements:   (page: number) => ["admin", "paiements", page] as const,
} as const;

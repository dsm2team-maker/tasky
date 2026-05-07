-- =============================================================================
-- MIGRATION v6 — PARTIE 1 : Ajouter les nouvelles valeurs d'enum
-- ⚠️  Exécuter cette partie SEULE en premier, puis attendre la validation
-- =============================================================================

-- 1. Nouveaux statuts dans StatusDemande
ALTER TYPE "StatusDemande" ADD VALUE IF NOT EXISTS 'EN_ATTENTE_INSPECTION';
ALTER TYPE "StatusDemande" ADD VALUE IF NOT EXISTS 'EN_ATTENTE_PAIEMENT';

-- 2. Nouveaux statuts dans StatusPrestation
ALTER TYPE "StatusPrestation" ADD VALUE IF NOT EXISTS 'EN_ATTENTE_INSPECTION';
ALTER TYPE "StatusPrestation" ADD VALUE IF NOT EXISTS 'EN_ATTENTE_PAIEMENT';

-- =============================================================================
-- FIN PARTIE 1 — Exécuter, puis lancer la PARTIE 2 dans une nouvelle requête
-- =============================================================================


-- =============================================================================
-- MIGRATION v6 — PARTIE 2 : DDL et migration de données
-- ⚠️  À exécuter dans une NOUVELLE requête SQL, après la Partie 1
-- =============================================================================

-- 3. Migrer les données existantes : EN_ATTENTE → EN_ATTENTE_INSPECTION
UPDATE demandes SET status = 'EN_ATTENTE_INSPECTION' WHERE status = 'EN_ATTENTE';
UPDATE prestations SET status = 'EN_ATTENTE_INSPECTION'
  WHERE status = 'EN_COURS'
  AND "demandeId" IN (
    SELECT id FROM demandes WHERE "typePrestation" = 'MODIFICATION' AND status = 'EN_ATTENTE_INSPECTION'
  );

-- 4. Ajouter colonnes estSelectionnable et aVerifier sur devis
ALTER TABLE devis ADD COLUMN IF NOT EXISTS "estSelectionnable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE devis ADD COLUMN IF NOT EXISTS "aVerifier" BOOLEAN NOT NULL DEFAULT false;

-- 5. Recréer la table messages avec la nouvelle structure
DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id             TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "prestationId" TEXT        NOT NULL,
  "auteurId"     TEXT        NOT NULL,
  contenu        TEXT        NOT NULL,
  lu             BOOLEAN     NOT NULL DEFAULT false,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT "messages_prestationId_fkey" FOREIGN KEY ("prestationId")
    REFERENCES prestations(id) ON DELETE CASCADE
);

-- 6. Créer la table signalements
CREATE TABLE IF NOT EXISTS signalements (
  id           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "demandeId"  TEXT        NOT NULL,
  "auteurId"   TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  statut       TEXT        NOT NULL DEFAULT 'EN_ATTENTE',
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT signalements_pkey PRIMARY KEY (id),
  CONSTRAINT "signalements_demandeId_fkey" FOREIGN KEY ("demandeId")
    REFERENCES demandes(id) ON DELETE CASCADE
);

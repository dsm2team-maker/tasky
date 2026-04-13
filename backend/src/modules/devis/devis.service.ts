import { prisma } from "../../lib/prisma";
import { calculerScore } from "./matching.service";

// =============================================================================
// GET DEMANDES DISPONIBLES (avec matching)
// =============================================================================
export const getDemandesDisponibles = async (userId: string) => {
  // Récupérer le prestataire avec ses compétences
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: {
      id: true,
      disponibilite: true,
      rating: true,
      iban: true,
      bio: true,
      pointDepotAdresse: true,
      user: { select: { city: true } },
      competences: {
        select: {
          categoryId: true,
          subCategoryId: true,
          interventionId: true,
        },
      },
    },
  });

  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");
  if (prestataire.disponibilite !== "ACTIF")
    throw new Error("PRESTATAIRE_INACTIF");

  // Récupérer les demandes publiées
  const demandes = await prisma.demande.findMany({
    where: { status: "PUBLIEE" },
    include: {
      client: {
        select: {
          user: { select: { firstName: true, avatar: true, city: true } },
        },
      },
      category: { select: { id: true, nom: true, icon: true } },
      subCategory: { select: { id: true, nom: true } },
      _count: { select: { devis: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // IDs des demandes où le prestataire a déjà envoyé un devis
  const devisExistants = await prisma.devis.findMany({
    where: { prestataireId: prestataire.id },
    select: { demandeId: true },
  });
  const demandesAvecDevis = new Set(devisExistants.map((d) => d.demandeId));

  // Calculer le score pour chaque demande
  const results = demandes
    .filter((d) => !demandesAvecDevis.has(d.id))
    .map((demande) => {
      const score = calculerScore(
        {
          categoryId: demande.categoryId,
          subCategoryId: demande.subCategoryId,
          interventionIds: demande.interventionIds,
          ville: demande.ville,
        },
        prestataire,
      );

      if (!score) return null;

      return {
        ...demande,
        matching: score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b!.matching.score - a!.matching.score);

  return results;
};

// =============================================================================
// GET DEMANDE DETAIL (pour prestataire)
// =============================================================================
export const getDemandeDetail = async (userId: string, demandeId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const demande = await prisma.demande.findUnique({
    where: { id: demandeId, status: "PUBLIEE" },
    include: {
      client: {
        select: {
          user: { select: { firstName: true, avatar: true, city: true } },
        },
      },
      category: { select: { id: true, nom: true, icon: true } },
      subCategory: { select: { id: true, nom: true } },
      _count: { select: { devis: true } },
    },
  });

  if (!demande) throw new Error("DEMANDE_NOT_FOUND");

  // Vérifier si le prestataire a déjà envoyé un devis
  const devisExistant = await prisma.devis.findFirst({
    where: { demandeId, prestataireId: prestataire.id },
  });

  return { ...demande, devisExistant: !!devisExistant };
};

// =============================================================================
// ENVOYER UN DEVIS
// =============================================================================
export const envoyerDevis = async (
  userId: string,
  demandeId: string,
  data: { montant: number; delai: number; description: string },
) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true, disponibilite: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");
  if (prestataire.disponibilite !== "ACTIF")
    throw new Error("PRESTATAIRE_INACTIF");

  const demande = await prisma.demande.findUnique({ where: { id: demandeId } });
  if (!demande) throw new Error("DEMANDE_NOT_FOUND");
  if (demande.status !== "PUBLIEE") throw new Error("DEMANDE_NON_DISPONIBLE");

  // Vérifier pas de devis existant
  const existant = await prisma.devis.findFirst({
    where: { demandeId, prestataireId: prestataire.id },
  });
  if (existant) throw new Error("DEVIS_DEJA_ENVOYE");

  // Expiration dans 7 jours
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const devis = await prisma.devis.create({
    data: {
      demandeId,
      prestataireId: prestataire.id,
      montant: data.montant,
      delai: data.delai,
      description: data.description,
      status: "ENVOYE",
      expiresAt,
    },
    include: {
      prestataire: {
        select: {
          id: true,
          rating: true,
          reviewCount: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              city: true,
            },
          },
        },
      },
    },
  });

  return devis;
};

// =============================================================================
// GET DEVIS D'UNE DEMANDE (pour client)
// =============================================================================
export const getDevisDemande = async (userId: string, demandeId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const demande = await prisma.demande.findUnique({ where: { id: demandeId } });
  if (!demande) throw new Error("DEMANDE_NOT_FOUND");
  if (demande.clientId !== client.id) throw new Error("FORBIDDEN");

  const devis = await prisma.devis.findMany({
    where: { demandeId },
    include: {
      prestataire: {
        select: {
          id: true,
          bio: true,
          rating: true,
          reviewCount: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              city: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return { demande, devis };
};

// =============================================================================
// ACCEPTER UN DEVIS
// =============================================================================
export const accepterDevis = async (userId: string, devisId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { demande: true },
  });
  if (!devis) throw new Error("DEVIS_NOT_FOUND");
  if (devis.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (devis.status !== "ENVOYE") throw new Error("DEVIS_NON_DISPONIBLE");

  await prisma.$transaction(async (tx) => {
    // Accepter ce devis
    await tx.devis.update({
      where: { id: devisId },
      data: { status: "ACCEPTE" },
    });

    // Refuser tous les autres devis de cette demande
    await tx.devis.updateMany({
      where: { demandeId: devis.demandeId, id: { not: devisId } },
      data: { status: "REFUSE" },
    });

    // Mettre à jour le statut de la demande
    await tx.demande.update({
      where: { id: devis.demandeId },
      data: { status: "EN_COURS" },
    });

    // Créer la prestation
    await tx.prestation.create({
      data: {
        demandeId: devis.demandeId,
        prestataireId: devis.prestataireId,
        subCategoryId: devis.demande.subCategoryId,
        montant: devis.montant,
        status: "EN_COURS",
      },
    });
  });
};

// =============================================================================
// REFUSER UN DEVIS
// =============================================================================
export const refuserDevis = async (userId: string, devisId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: { demande: true },
  });
  if (!devis) throw new Error("DEVIS_NOT_FOUND");
  if (devis.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (devis.status !== "ENVOYE") throw new Error("DEVIS_NON_DISPONIBLE");

  await prisma.devis.update({
    where: { id: devisId },
    data: { status: "REFUSE" },
  });
};

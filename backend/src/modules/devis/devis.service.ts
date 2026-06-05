import { prisma } from "../../lib/prisma";
import { calculerScore } from "./matching.service";
import { addEmailJob } from "../../queues/email.queue";
import { sendSystemMessage } from "../messages/message.service";

// =============================================================================
// GET DEMANDES DISPONIBLES (avec matching)
// =============================================================================
export const getDemandesDisponibles = async (userId: string) => {
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
  if (prestataire.disponibilite === "ABSENT")
    throw new Error("PRESTATAIRE_INACTIF");

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

  const devisExistants = await prisma.devis.findMany({
    where: { prestataireId: prestataire.id },
    select: { demandeId: true },
  });
  const demandesAvecDevis = new Set(devisExistants.map((d) => d.demandeId));

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

      return { ...demande, matching: score };
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

  const devisExistant = await prisma.devis.findFirst({
    where: { demandeId, prestataireId: prestataire.id },
    select: { id: true, status: true },
  });

  return {
    ...demande,
    devisExistant: devisExistant?.status === "ENVOYE",
    devisRefuse: devisExistant?.status === "REFUSE",
  };
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
  if (prestataire.disponibilite === "ABSENT")
    throw new Error("PRESTATAIRE_INACTIF");

  const demande = await prisma.demande.findUnique({ where: { id: demandeId } });
  if (!demande) throw new Error("DEMANDE_NOT_FOUND");
  if (demande.status !== "PUBLIEE") throw new Error("DEMANDE_NON_DISPONIBLE");

  const existant = await prisma.devis.findFirst({
    where: { demandeId, prestataireId: prestataire.id },
  });
  if (existant) throw new Error("DEVIS_DEJA_ENVOYE");

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
      estSelectionnable: true,
      aVerifier: false,
      expiresAt,
    },
    include: {
      prestataire: {
        select: {
          id: true,
          rating: true,
          reviewCount: true,
          user: { select: { firstName: true, lastName: true, avatar: true, city: true } },
        },
      },
    },
  });

  // Email au client — nouveau devis reçu
  const clientUser = await prisma.user.findFirst({
    where: { client: { demandes: { some: { id: demandeId } } } },
    select: { email: true, firstName: true },
  });
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";
  if (clientUser) {
    addEmailJob({
      type: "quote-received",
      to: clientUser.email,
      payload: {
        firstName: clientUser.firstName,
        demandeReference: `TSK-${String(demande.reference).padStart(6, "0")}`,
        demandeTitre: demande.titre,
        prestataireNom: `${devis.prestataire.user.firstName} ${devis.prestataire.user.lastName}`,
        montant: data.montant,
        devisUrl: `${frontendUrl}/client/requests/${demandeId}`,
      },
    }).catch(() => {});
  }

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
  if (!devis.estSelectionnable) throw new Error("DEVIS_NON_SELECTIONNABLE");

  const isModification = devis.demande.typePrestation === "MODIFICATION";

  const { prestationId } = await prisma.$transaction(async (tx) => {
    // Accepter ce devis
    await tx.devis.update({
      where: { id: devisId },
      data: { status: "ACCEPTE", estSelectionnable: false },
    });

    let newPrestation;

    if (isModification) {
      // MODIFICATION : les autres restent ENVOYE mais deviennent non-sélectionnables
      await tx.devis.updateMany({
        where: { demandeId: devis.demandeId, id: { not: devisId } },
        data: { estSelectionnable: false },
      });

      await tx.demande.update({
        where: { id: devis.demandeId },
        data: { status: "EN_ATTENTE_INSPECTION" },
      });

      newPrestation = await tx.prestation.create({
        data: {
          demandeId: devis.demandeId,
          prestataireId: devis.prestataireId,
          subCategoryId: devis.demande.subCategoryId,
          montant: devis.montant,
          status: "EN_ATTENTE_INSPECTION",
        },
      });
    } else {
      // CREATION : refuser tous les autres devis immédiatement
      await tx.devis.updateMany({
        where: { demandeId: devis.demandeId, id: { not: devisId } },
        data: { status: "REFUSE", estSelectionnable: false },
      });

      await tx.demande.update({
        where: { id: devis.demandeId },
        data: { status: "EN_ATTENTE_PAIEMENT" },
      });

      newPrestation = await tx.prestation.create({
        data: {
          demandeId: devis.demandeId,
          prestataireId: devis.prestataireId,
          subCategoryId: devis.demande.subCategoryId,
          montant: devis.montant,
          status: "EN_ATTENTE_PAIEMENT",
        },
      });
    }

    return { prestationId: newPrestation.id };
  });

  await sendSystemMessage(
    prestationId,
    isModification
      ? "✅ Tasky-Infos — Devis accepté. La prochaine étape est l'inspection de l'objet par le prestataire."
      : "✅ Tasky-Infos — Devis accepté. La prestation démarrera dès que le paiement sera confirmé.",
  ).catch((e: any) => console.error("[Tasky-Infos]", e.message));
};

// =============================================================================
// MES STATS DEVIS (pour prestataire)
// =============================================================================
export const getMesStatsDevis = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const [envoyes, acceptes] = await Promise.all([
    prisma.devis.count({ where: { prestataireId: prestataire.id } }),
    prisma.devis.count({ where: { prestataireId: prestataire.id, status: "ACCEPTE" } }),
  ]);

  return {
    envoyes,
    acceptes,
    taux: envoyes > 0 ? Math.round((acceptes / envoyes) * 100) : 0,
  };
};

// =============================================================================
// REFUSER UN DEVIS
// =============================================================================
export const refuserDevis = async (userId: string, devisId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    include: {
      demande: true,
      prestataire: {
        select: {
          userId: true,
          user: { select: { firstName: true, email: true } },
        },
      },
    },
  });
  if (!devis) throw new Error("DEVIS_NOT_FOUND");
  if (devis.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (devis.status !== "ENVOYE") throw new Error("DEVIS_NON_DISPONIBLE");

  await prisma.devis.update({
    where: { id: devisId },
    data: { status: "REFUSE" },
  });

  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";
  const ref = devis.demande.reference
    ? `TSK-${String(devis.demande.reference).padStart(6, "0")}`
    : devisId;

  await addEmailJob({
    type: "devis-refuse",
    to: devis.prestataire.user.email,
    userId: devis.prestataire.userId,
    payload: {
      firstName: devis.prestataire.user.firstName,
      demandeReference: ref,
      demandeTitre: devis.demande.titre,
      demandesUrl: `${frontendUrl}/prestataire/requests`,
    },
  });
};

// =============================================================================
// MES DEVIS REFUSÉS (pour prestataire — dashboard)
// =============================================================================
export const getMesDevisRefuses = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const depuis30j = new Date();
  depuis30j.setDate(depuis30j.getDate() - 30);

  return prisma.devis.findMany({
    where: {
      prestataireId: prestataire.id,
      status: "REFUSE",
      dismissedByPrestataire: false,
      updatedAt: { gte: depuis30j },
    },
    select: {
      id: true,
      updatedAt: true,
      demande: { select: { id: true, titre: true, reference: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
};

// =============================================================================
// DISMISSER UN DEVIS REFUSE (prestataire)
// =============================================================================
export const dismisserDevis = async (userId: string, devisId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const devis = await prisma.devis.findUnique({
    where: { id: devisId },
    select: { id: true, prestataireId: true, status: true },
  });
  if (!devis) throw new Error("DEVIS_NOT_FOUND");
  if (devis.prestataireId !== prestataire.id) throw new Error("FORBIDDEN");
  if (devis.status !== "REFUSE") throw new Error("DEVIS_NON_REFUSE");

  await prisma.devis.update({
    where: { id: devisId },
    data: { dismissedByPrestataire: true },
  });
};

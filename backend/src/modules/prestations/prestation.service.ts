import { prisma } from "../../lib/prisma";

// =============================================================================
// GET MES PRESTATIONS (Prestataire)
// =============================================================================
export const getMesPrestations = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  return await prisma.prestation.findMany({
    where: { prestataireId: prestataire.id },
    include: {
      demande: {
        include: {
          category: { select: { id: true, nom: true, icon: true } },
          subCategory: { select: { id: true, nom: true } },
          client: {
            select: {
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
      },
      etatDesLieux: true,
      review: { select: { rating: true, comment: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================================================================
// GET PRESTATION DETAIL (Prestataire)
// =============================================================================
export const getPrestationDetail = async (
  userId: string,
  prestationId: string,
) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: {
      demande: {
        include: {
          category: { select: { id: true, nom: true, icon: true } },
          subCategory: { select: { id: true, nom: true } },
          client: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  city: true,
                  phone: true,
                },
              },
            },
          },
        },
      },
      etatDesLieux: true,
      review: { select: { rating: true, comment: true } },
    },
  });

  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.prestataireId !== prestataire.id) throw new Error("FORBIDDEN");

  return prestation;
};

// =============================================================================
// CRÉER ÉTAT DES LIEUX (Prestataire)
// =============================================================================
export const creerEtatDesLieux = async (
  userId: string,
  prestationId: string,
  data: { description: string; photos?: string[]; montantRevise?: number },
) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: {
      demande: true,
      etatDesLieux: true,
    },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.prestataireId !== prestataire.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "EN_COURS")
    throw new Error("PRESTATION_NOT_EN_COURS");
  if (prestation.etatDesLieux) throw new Error("ETAT_DES_LIEUX_ALREADY_EXISTS");

  // Vérifier que c'est une MODIFICATION
  if (prestation.demande.typePrestation !== "MODIFICATION")
    throw new Error("NOT_MODIFICATION");

  const etatDesLieux = await prisma.etatDesLieux.create({
    data: {
      prestationId,
      description: data.description,
      photos: data.photos || [],
      montantRevise: data.montantRevise || null,
      status: "EN_ATTENTE",
    },
  });

  // Si montant révisé → en attente validation client
  // Si pas de montant révisé → devis conforme, montant final = montant initial
  if (!data.montantRevise) {
    await prisma.prestation.update({
      where: { id: prestationId },
      data: { montantFinal: prestation.montant },
    });
  }

  return etatDesLieux;
};

// =============================================================================
// VALIDER ÉTAT DES LIEUX (Client)
// =============================================================================
export const validerEtatDesLieux = async (
  userId: string,
  prestationId: string,
  accepte: boolean,
) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: { demande: true, etatDesLieux: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (!prestation.etatDesLieux) throw new Error("ETAT_DES_LIEUX_NOT_FOUND");
  if (prestation.etatDesLieux.status !== "EN_ATTENTE")
    throw new Error("ETAT_DES_LIEUX_ALREADY_PROCESSED");

  if (accepte) {
    // Client accepte → montant final = montant révisé ou montant initial
    const montantFinal =
      prestation.etatDesLieux.montantRevise || prestation.montant;
    await prisma.$transaction([
      prisma.etatDesLieux.update({
        where: { id: prestation.etatDesLieux.id },
        data: { status: "VALIDE" },
      }),
      prisma.prestation.update({
        where: { id: prestationId },
        data: { montantFinal },
      }),
    ]);
  } else {
    // Client refuse → prestation ANNULEE, demande repasse en PUBLIEE
    await prisma.$transaction([
      prisma.etatDesLieux.update({
        where: { id: prestation.etatDesLieux.id },
        data: { status: "REFUSE" },
      }),
      prisma.prestation.update({
        where: { id: prestationId },
        data: { status: "ANNULEE" },
      }),
      prisma.demande.update({
        where: { id: prestation.demandeId },
        data: { status: "PUBLIEE" },
      }),
    ]);
  }
};

// =============================================================================
// MARQUER TERMINÉ (Prestataire)
// =============================================================================
export const marquerTermine = async (userId: string, prestationId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: { demande: true, etatDesLieux: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.prestataireId !== prestataire.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "EN_COURS")
    throw new Error("PRESTATION_NOT_EN_COURS");

  if (prestation.demande.typePrestation === "MODIFICATION") {
    if (!prestation.etatDesLieux) throw new Error("ETAT_DES_LIEUX_REQUIRED");
    if (prestation.etatDesLieux.status !== "VALIDE")
      throw new Error("ETAT_DES_LIEUX_NOT_VALIDATED");
  }

  const autoValidateAt = new Date();
  autoValidateAt.setDate(autoValidateAt.getDate() + 3);

  await prisma.$transaction([
    prisma.prestation.update({
      where: { id: prestationId },
      data: { status: "A_VALIDER", completedAt: new Date(), autoValidateAt },
    }),
    prisma.demande.update({
      where: { id: prestation.demandeId },
      data: { status: "A_VALIDER" },
    }),
  ]);
};

// =============================================================================
// VALIDER PRESTATION (Client)
// =============================================================================
export const validerPrestation = async (
  userId: string,
  prestationId: string,
) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: { demande: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "A_VALIDER")
    throw new Error("PRESTATION_NOT_A_VALIDER");

  await prisma.$transaction([
    prisma.prestation.update({
      where: { id: prestationId },
      data: { status: "TERMINEE", validatedAt: new Date() },
    }),
    prisma.demande.update({
      where: { id: prestation.demandeId },
      data: { status: "TERMINEE" },
    }),
  ]);
};

// =============================================================================
// CONTESTER PRESTATION (Client — litige)
// =============================================================================
export const contesterPrestation = async (
  userId: string,
  prestationId: string,
) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: { demande: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "A_VALIDER")
    throw new Error("PRESTATION_NOT_A_VALIDER");

  await prisma.$transaction([
    prisma.prestation.update({
      where: { id: prestationId },
      data: { status: "EN_COURS" },
    }),
    prisma.demande.update({
      where: { id: prestation.demandeId },
      data: { status: "EN_COURS" },
    }),
  ]);
};

// =============================================================================
// GET MES PRESTATIONS (Client)
// =============================================================================
export const getMesPrestationsClient = async (userId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  return await prisma.prestation.findMany({
    where: { demande: { clientId: client.id } },
    include: {
      demande: {
        include: {
          category: { select: { id: true, nom: true, icon: true } },
          subCategory: { select: { id: true, nom: true } },
        },
      },
      prestataire: {
        select: {
          id: true,
          rating: true,
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
      },
      etatDesLieux: true,
      review: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

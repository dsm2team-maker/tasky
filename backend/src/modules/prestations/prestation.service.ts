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
// CRÉER ÉTAT DES LIEUX (Prestataire) — status EN_ATTENTE_INSPECTION requis
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
    include: { demande: true, etatDesLieux: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.prestataireId !== prestataire.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "EN_ATTENTE_INSPECTION")
    throw new Error("PRESTATION_NOT_EN_ATTENTE_INSPECTION");
  if (prestation.etatDesLieux) throw new Error("ETAT_DES_LIEUX_ALREADY_EXISTS");
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
    // Client accepte → montant final fixé, attente paiement
    const montantFinal =
      prestation.etatDesLieux.montantRevise || prestation.montant;

    await prisma.$transaction([
      prisma.etatDesLieux.update({
        where: { id: prestation.etatDesLieux.id },
        data: { status: "VALIDE" },
      }),
      prisma.prestation.update({
        where: { id: prestationId },
        data: { montantFinal, status: "EN_ATTENTE_PAIEMENT" },
      }),
      prisma.demande.update({
        where: { id: prestation.demandeId },
        data: { status: "EN_ATTENTE_PAIEMENT" },
      }),
    ]);
  } else {
    // Client refuse → prestation ANNULEE, demande PUBLIEE
    // Devis accepté → REFUSE + aVerifier=true, autres ENVOYE → estSelectionnable=true
    const devisAccepte = await prisma.devis.findFirst({
      where: { demandeId: prestation.demandeId, status: "ACCEPTE" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.etatDesLieux.update({
        where: { id: prestation.etatDesLieux!.id },
        data: { status: "REFUSE" },
      });

      await tx.prestation.update({
        where: { id: prestationId },
        data: { status: "ANNULEE" },
      });

      await tx.demande.update({
        where: { id: prestation.demandeId },
        data: { status: "PUBLIEE" },
      });

      if (devisAccepte) {
        // Marquer le devis accepté comme refusé avec flag aVerifier
        await tx.devis.update({
          where: { id: devisAccepte.id },
          data: { status: "REFUSE", aVerifier: true, estSelectionnable: false },
        });
      }

      // Remettre les autres devis ENVOYE comme sélectionnables
      await tx.devis.updateMany({
        where: {
          demandeId: prestation.demandeId,
          status: "ENVOYE",
        },
        data: { estSelectionnable: true },
      });
    });
  }
};

// =============================================================================
// CONFIRMER CONFORMITÉ (Prestataire) — objet OK, pas de changement de tarif
// Crée un état des lieux VALIDE directement et passe à EN_ATTENTE_PAIEMENT
// =============================================================================
export const confirmerConformite = async (
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
    include: { demande: true, etatDesLieux: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.prestataireId !== prestataire.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "EN_ATTENTE_INSPECTION")
    throw new Error("PRESTATION_NOT_EN_ATTENTE_INSPECTION");
  if (prestation.demande.typePrestation !== "MODIFICATION")
    throw new Error("NOT_MODIFICATION");
  if (prestation.etatDesLieux) throw new Error("ETAT_DES_LIEUX_ALREADY_EXISTS");

  await prisma.$transaction(async (tx) => {
    // Créer l'état des lieux déjà validé (montant conforme, pas de révision)
    await tx.etatDesLieux.create({
      data: {
        prestationId,
        description: "Objet conforme à la description initiale.",
        photos: [],
        montantRevise: null,
        status: "VALIDE",
      },
    });

    await tx.prestation.update({
      where: { id: prestationId },
      data: {
        montantFinal: prestation.montant,
        status: "EN_ATTENTE_PAIEMENT",
      },
    });

    await tx.demande.update({
      where: { id: prestation.demandeId },
      data: { status: "EN_ATTENTE_PAIEMENT" },
    });
  });
};

// =============================================================================
// PASSER EN COURS (stub Stripe) — EN_ATTENTE_PAIEMENT → EN_COURS
// À remplacer par le webhook Stripe en production
// =============================================================================
export const passerEnCours = async (userId: string, prestationId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: { demande: true },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "EN_ATTENTE_PAIEMENT")
    throw new Error("PRESTATION_NOT_EN_ATTENTE_PAIEMENT");

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
// MARQUER TERMINÉ (Prestataire) — EN_COURS requis
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

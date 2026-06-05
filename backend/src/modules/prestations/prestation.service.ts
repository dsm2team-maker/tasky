import { prisma } from "../../lib/prisma";
import { sendSystemMessage } from "../messages/message.service";
import { addEmailJob } from "../../queues/email.queue";

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

  await sendSystemMessage(
    prestationId,
    data.montantRevise
      ? "📋 Tasky-Infos — Le prestataire a soumis un état des lieux avec révision de montant. Le client doit l'examiner."
      : "📋 Tasky-Infos — Le prestataire a soumis un état des lieux. Le client doit l'examiner.",
  ).catch((e: any) => console.error("[Tasky-Infos]", e.message));

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

    await sendSystemMessage(
      prestationId,
      "✅ Tasky-Infos — État des lieux accepté. En attente du paiement pour démarrer la prestation.",
    ).catch((e: any) => console.error("[Tasky-Infos]", e.message));
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

    await sendSystemMessage(
      prestationId,
      "❌ Tasky-Infos — État des lieux refusé. La prestation est annulée, la demande est à nouveau disponible.",
    ).catch((e: any) => console.error("[Tasky-Infos]", e.message));
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

  await sendSystemMessage(
    prestationId,
    "✅ Tasky-Infos — Objet conforme. En attente du paiement pour démarrer la prestation.",
  ).catch((e: any) => console.error("[Tasky-Infos]", e.message));
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

  const delaiJours = (prestation.demande as any).delaiJours ?? 7;
  const dateEcheanceFinal = new Date();
  dateEcheanceFinal.setDate(dateEcheanceFinal.getDate() + delaiJours);

  await prisma.$transaction([
    prisma.prestation.update({
      where: { id: prestationId },
      data: { status: "EN_COURS", dateEcheanceFinal },
    }),
    prisma.demande.update({
      where: { id: prestation.demandeId },
      data: { status: "EN_COURS" },
    }),
  ]);

  await sendSystemMessage(
    prestationId,
    `💳 Tasky-Infos — Paiement confirmé par le client. La prestation est maintenant en cours ! Date limite de livraison : ${dateEcheanceFinal.toLocaleDateString("fr-FR")}.`,
  ).catch((e: any) => console.error("[Tasky-Infos]", e.message));
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

  await sendSystemMessage(
    prestationId,
    "🔔 Tasky-Infos — Prestation marquée comme terminée. Convenez d'un rendez-vous pour la remise de l'objet, puis le client devra valider depuis la page de la demande.",
  ).catch((e: any) => console.error("[Tasky-Infos]", e.message));
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
    include: {
      demande: { include: { client: { include: { user: true } } } },
      prestataire: { include: { user: true } },
    },
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

  await sendSystemMessage(
    prestationId,
    "🎉 Tasky-Infos — Prestation validée par le client ! Le paiement sera libéré sous 1 à 2 jours ouvrés.",
  ).catch((e: any) => console.error("[Tasky-Infos]", e.message));

  // Emails order-completed
  const frontendUrl = process.env.FRONTEND_URL || "https://tasky.fr";
  const ref = `TSK-${String(prestation.demande.reference).padStart(6, "0")}`;
  const titre = prestation.demande.titre;
  const montant = prestation.montantFinal ?? prestation.montant;
  const emailPayload = { demandeReference: ref, demandeTitre: titre, montant, isAutoValidated: false };

  addEmailJob({ type: "order-completed", to: prestation.demande.client.user.email, payload: {
    ...emailPayload, firstName: prestation.demande.client.user.firstName, role: "client",
    prestationUrl: `${frontendUrl}/client/requests/${prestation.demandeId}`,
  }}).catch(() => {});

  addEmailJob({ type: "order-completed", to: prestation.prestataire.user.email, payload: {
    ...emailPayload, firstName: prestation.prestataire.user.firstName, role: "prestataire",
    prestationUrl: `${frontendUrl}/prestataire/requests`,
  }}).catch(() => {});
};

// =============================================================================
// CONTESTER PRESTATION (Client — litige)
// =============================================================================
export const contesterPrestation = async (
  userId: string,
  prestationId: string,
  motif: string,
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
  if (!motif || motif.trim().length < 10)
    throw new Error("MOTIF_TROP_COURT");

  await prisma.$transaction([
    prisma.prestation.update({
      where: { id: prestationId },
      data: { status: "EN_COURS" },
    }),
    prisma.demande.update({
      where: { id: prestation.demandeId },
      data: { status: "EN_COURS" },
    }),
    prisma.message.create({
      data: {
        prestationId,
        contenu: `⚠️ Tasky-Infos — Prestation contestée par le client.\n\nMotif : ${motif.trim()}`,
        isSystem: true,
      },
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
      review: { select: { rating: true, comment: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================================================================
// CREER REVIEW (Client)
// =============================================================================
export const creerReview = async (
  userId: string,
  prestationId: string,
  data: { rating: number; comment?: string },
) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: {
      review: true,
      demande: { select: { clientId: true } },
    },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");
  if (prestation.demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (prestation.status !== "TERMINEE") throw new Error("PRESTATION_NOT_TERMINEE");
  if (prestation.review) throw new Error("REVIEW_ALREADY_EXISTS");
  if (data.rating < 1 || data.rating > 5) throw new Error("RATING_INVALID");

  const review = await prisma.review.create({
    data: {
      prestationId,
      clientId: client.id,
      prestataireId: prestation.prestataireId,
      rating: data.rating,
      comment: data.comment?.trim() || null,
    },
  });

  // Recalcul note moyenne du prestataire
  const allReviews = await prisma.review.findMany({
    where: { prestataireId: prestation.prestataireId },
    select: { rating: true },
  });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await prisma.prestataire.update({
    where: { id: prestation.prestataireId },
    data: {
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    },
  });

  return review;
};

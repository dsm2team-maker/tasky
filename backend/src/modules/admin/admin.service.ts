import { prisma } from "../../lib/prisma";
import { splitMontant } from "../../config/commission.config";

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [
    totalUsers,
    totalClients,
    totalPrestataires,
    totalPrestations,
    prestationsActives,
    prestationsTerminees,
    signalements,
    paiements,
  ] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.client.count(),
    prisma.prestataire.count(),
    prisma.prestation.count(),
    prisma.prestation.count({ where: { status: { in: ["EN_COURS", "EN_ATTENTE_INSPECTION", "EN_ATTENTE_PAIEMENT", "A_VALIDER"] } } }),
    prisma.prestation.count({ where: { status: "TERMINEE" } }),
    prisma.signalement.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.prestation.findMany({
      where: { stripePaymentIntentId: { not: null }, status: "TERMINEE" },
      select: { montantFinal: true, montant: true },
    }),
  ]);

  const caTotal = paiements.reduce((s, p) => s + (p.montantFinal ?? p.montant), 0);
  const commissionTotal = splitMontant(caTotal).commissionTasky;

  return {
    totalUsers,
    totalClients,
    totalPrestataires,
    totalPrestations,
    prestationsActives,
    prestationsTerminees,
    signalentsOuverts: signalements,
    caTotal,
    commissionTotal,
  };
};

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

export const getUsers = async (
  page = 1,
  filters: { nom?: string; prenom?: string; email?: string } = {},
) => {
  const take = 20;
  const skip = (page - 1) * take;
  const { nom, prenom, email } = filters;
  const AND: Record<string, unknown>[] = [];
  if (nom) AND.push({ lastName: { contains: nom, mode: "insensitive" as const } });
  if (prenom) AND.push({ firstName: { contains: prenom, mode: "insensitive" as const } });
  if (email) AND.push({ email: { contains: email, mode: "insensitive" as const } });
  const where = AND.length ? { AND } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        deletedAt: true,
        client: { select: { _count: { select: { demandes: true } } } },
        prestataire: { select: { _count: { select: { prestations: true } }, rating: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, pages: Math.ceil(total / take) };
};

export const suspendUser = async (userId: string) => {
  await prisma.user.update({ where: { id: userId }, data: { isActive: false } });
};

export const reactivateUser = async (userId: string) => {
  await prisma.user.update({ where: { id: userId }, data: { isActive: true } });
};

// ─── Prestations ─────────────────────────────────────────────────────────────

export const getPrestations = async (
  page = 1,
  status = "",
  filters: { reference?: string; client?: string; prestataire?: string } = {},
) => {
  const take = 20;
  const skip = (page - 1) * take;
  const { reference, client, prestataire } = filters;

  const AND: Record<string, unknown>[] = [];
  if (status) AND.push({ status: status as any });
  if (reference) {
    const refNum = parseInt(reference.replace(/[^0-9]/g, ""), 10);
    AND.push({ demande: { reference: Number.isNaN(refNum) ? -1 : refNum } });
  }
  if (client) {
    AND.push({
      demande: {
        client: {
          user: {
            OR: [
              { firstName: { contains: client, mode: "insensitive" as const } },
              { lastName: { contains: client, mode: "insensitive" as const } },
            ],
          },
        },
      },
    });
  }
  if (prestataire) {
    AND.push({
      prestataire: {
        user: {
          OR: [
            { firstName: { contains: prestataire, mode: "insensitive" as const } },
            { lastName: { contains: prestataire, mode: "insensitive" as const } },
          ],
        },
      },
    });
  }
  const where = AND.length ? { AND } : {};

  const [prestations, total] = await Promise.all([
    prisma.prestation.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        demande: {
          select: {
            titre: true,
            reference: true,
            client: { select: { user: { select: { firstName: true, lastName: true, email: true } } } },
          },
        },
        prestataire: {
          select: { user: { select: { firstName: true, lastName: true, email: true } } },
        },
      },
    }),
    prisma.prestation.count({ where }),
  ]);

  return { prestations, total, pages: Math.ceil(total / take) };
};

export const getPrestationDetail = async (id: string) => {
  const prestation = await prisma.prestation.findUnique({
    where: { id },
    include: {
      demande: {
        include: {
          client: { include: { user: true } },
          category: true,
          devis: {
            include: {
              prestataire: { select: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
      },
      prestataire: { include: { user: true } },
      etatDesLieux: true,
      messages: { orderBy: { createdAt: "asc" } },
      review: true,
    },
  });

  if (!prestation) return prestation;

  return prestation;
};

// ─── Signalements ─────────────────────────────────────────────────────────────

export const getSignalements = async (page = 1) => {
  const take = 20;
  const skip = (page - 1) * take;

  const [signalements, total] = await Promise.all([
    prisma.signalement.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        demande: {
          select: {
            titre: true,
            reference: true,
            client: { select: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    }),
    prisma.signalement.count(),
  ]);

  return { signalements, total, pages: Math.ceil(total / take) };
};

export const resolveSignalement = async (id: string, note: string) => {
  const signalement = await prisma.signalement.findUnique({
    where: { id },
    include: { demande: { include: { prestation: { select: { id: true } } } } },
  });

  if (!signalement) throw new Error("SIGNALEMENT_NOT_FOUND");

  const messageAdmin = note
    ? `${signalement.message}\n\n[Admin] ${note}`
    : signalement.message;

  await prisma.signalement.update({
    where: { id },
    data: { statut: "RESOLU", message: messageAdmin },
  });

  // Notifier le client via Tasky-Infos si une prestation est liée
  const prestationId = signalement.demande?.prestation?.id;
  if (prestationId) {
    const notifMessage = note
      ? `🔔 Tasky-Infos — Votre signalement a été traité par l'équipe Tasky.\n\nRéponse de l'admin : ${note}`
      : `🔔 Tasky-Infos — Votre signalement a été traité et marqué comme résolu par l'équipe Tasky.`;

    await prisma.message.create({
      data: {
        prestationId,
        contenu: notifMessage,
        isSystem: true,
      },
    });
  }
};

// ─── Paiements ────────────────────────────────────────────────────────────────

export const getPaiements = async (page = 1) => {
  const take = 20;
  const skip = (page - 1) * take;

  const [paiements, total] = await Promise.all([
    prisma.prestation.findMany({
      where: { stripePaymentIntentId: { not: null } },
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        demande: {
          select: {
            titre: true,
            reference: true,
            client: { select: { user: { select: { firstName: true, lastName: true, email: true } } } },
          },
        },
        prestataire: {
          select: {
            stripeAccountId: true,
            stripePayoutsEnabled: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    }),
    prisma.prestation.count({ where: { stripePaymentIntentId: { not: null } } }),
  ]);

  return { paiements, total, pages: Math.ceil(total / take) };
};

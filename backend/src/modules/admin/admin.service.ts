import { prisma } from "../../lib/prisma";

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
      where: { stripePaymentIntentId: { not: null } },
      select: { montantFinal: true, montant: true },
    }),
  ]);

  const caTotal = paiements.reduce((s, p) => s + (p.montantFinal ?? p.montant), 0);
  const commissionTotal = caTotal * 0.15;

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

export const getUsers = async (page = 1, search = "") => {
  const take = 20;
  const skip = (page - 1) * take;
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

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
        _count: { select: { client: false } },
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

export const getPrestations = async (page = 1, status = "") => {
  const take = 20;
  const skip = (page - 1) * take;
  const where = status ? { status: status as any } : {};

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
  return prisma.prestation.findUnique({
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
  await prisma.signalement.update({
    where: { id },
    data: { statut: "RESOLU", message: note ? `${(await prisma.signalement.findUnique({ where: { id } }))?.message}\n\n[Admin] ${note}` : undefined },
  });
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
            iban: true,
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    }),
    prisma.prestation.count({ where: { stripePaymentIntentId: { not: null } } }),
  ]);

  return { paiements, total, pages: Math.ceil(total / take) };
};

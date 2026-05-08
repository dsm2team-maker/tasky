import { prisma } from "../../lib/prisma";

const checkAccess = async (prestationId: string, userId: string) => {
  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: {
      demande: { include: { client: { select: { userId: true } } } },
      prestataire: { select: { userId: true } },
    },
  });
  if (!prestation) throw new Error("PRESTATION_NOT_FOUND");

  const isClient = prestation.demande.client.userId === userId;
  const isPrestataire = prestation.prestataire.userId === userId;
  if (!isClient && !isPrestataire) throw new Error("FORBIDDEN");

  return prestation;
};

export const getMessages = async (prestationId: string, userId: string) => {
  const prestation = await checkAccess(prestationId, userId);

  await prisma.message.updateMany({
    where: { prestationId, auteurId: { not: userId }, lu: false },
    data: { lu: true },
  });

  const messages = await prisma.message.findMany({
    where: { prestationId },
    orderBy: { createdAt: "asc" },
  });

  const [clientUser, prestataireUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: prestation.demande.client.userId },
      select: { id: true, firstName: true, avatar: true },
    }),
    prisma.user.findUnique({
      where: { id: prestation.prestataire.userId },
      select: { id: true, firstName: true, avatar: true },
    }),
  ]);

  return {
    messages,
    participants: { client: clientUser, prestataire: prestataireUser },
  };
};

export const getUnreadByPrestation = async (userId: string) => {
  const [clientPrestations, prestatairePrestations] = await Promise.all([
    prisma.prestation.findMany({
      where: { demande: { client: { userId } } },
      select: { id: true },
    }),
    prisma.prestation.findMany({
      where: { prestataire: { userId } },
      select: { id: true },
    }),
  ]);

  const ids = [
    ...clientPrestations.map((p) => p.id),
    ...prestatairePrestations.map((p) => p.id),
  ];

  if (ids.length === 0) return {} as Record<string, number>;

  const rows = await prisma.message.groupBy({
    by: ["prestationId"],
    where: { prestationId: { in: ids }, auteurId: { not: userId }, lu: false },
    _count: { id: true },
  });

  return Object.fromEntries(rows.map((r) => [r.prestationId, r._count.id]));
};

export const getUnreadCount = async (userId: string) => {
  const [clientPrestations, prestatairePrestations] = await Promise.all([
    prisma.prestation.findMany({
      where: { demande: { client: { userId } } },
      select: { id: true },
    }),
    prisma.prestation.findMany({
      where: { prestataire: { userId } },
      select: { id: true },
    }),
  ]);

  const ids = [
    ...clientPrestations.map((p) => p.id),
    ...prestatairePrestations.map((p) => p.id),
  ];

  if (ids.length === 0) return 0;

  return prisma.message.count({
    where: { prestationId: { in: ids }, auteurId: { not: userId }, lu: false },
  });
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d[\s.\-\/()]{0,2}){7,}\d/;

export const sendMessage = async (
  prestationId: string,
  userId: string,
  contenu: string,
) => {
  await checkAccess(prestationId, userId);

  if (!contenu || contenu.trim().length === 0) throw new Error("CONTENU_VIDE");
  if (contenu.trim().length > 1000) throw new Error("CONTENU_TROP_LONG");
  if (EMAIL_REGEX.test(contenu) || PHONE_REGEX.test(contenu))
    throw new Error("CONTACT_INFO_DETECTED");

  return prisma.message.create({
    data: { prestationId, auteurId: userId, contenu: contenu.trim() },
  });
};

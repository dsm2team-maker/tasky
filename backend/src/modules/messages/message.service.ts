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
  const [clientPrestations, prestatairePrestations, clientConversations, prestataireConversations] =
    await Promise.all([
      prisma.prestation.findMany({
        where: { demande: { client: { userId } } },
        select: { id: true },
      }),
      prisma.prestation.findMany({
        where: { prestataire: { userId } },
        select: { id: true },
      }),
      prisma.conversation.findMany({ where: { client: { userId } }, select: { id: true } }),
      prisma.conversation.findMany({ where: { prestataire: { userId } }, select: { id: true } }),
    ]);

  const prestationIds = [
    ...clientPrestations.map((p) => p.id),
    ...prestatairePrestations.map((p) => p.id),
  ];
  const conversationIds = [
    ...clientConversations.map((c) => c.id),
    ...prestataireConversations.map((c) => c.id),
  ];

  if (prestationIds.length === 0 && conversationIds.length === 0) return 0;

  const [fromPrestations, fromConversations] = await Promise.all([
    prestationIds.length
      ? prisma.message.count({
          where: { prestationId: { in: prestationIds }, auteurId: { not: userId }, lu: false },
        })
      : 0,
    conversationIds.length
      ? prisma.message.count({
          where: { conversationId: { in: conversationIds }, auteurId: { not: userId }, lu: false },
        })
      : 0,
  ]);

  return fromPrestations + fromConversations;
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

export const sendSystemMessage = async (prestationId: string, contenu: string) => {
  return prisma.message.create({
    data: { prestationId, auteurId: null, contenu, isSystem: true },
  });
};

export const sendSystemMessageConversation = async (
  clientId: string,
  prestataireId: string,
  contenu: string,
) => {
  const conversation = await prisma.conversation.upsert({
    where: { clientId_prestataireId: { clientId, prestataireId } },
    update: {},
    create: { clientId, prestataireId },
  });
  return prisma.message.create({
    data: { conversationId: conversation.id, auteurId: null, contenu, isSystem: true },
  });
};

// =============================================================================
// CONVERSATIONS DIRECTES (client ↔ prestataire, avant toute demande/devis)
// =============================================================================

const checkConversationAccess = async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client: { select: { userId: true } },
      prestataire: { select: { userId: true } },
    },
  });
  if (!conversation) throw new Error("CONVERSATION_NOT_FOUND");

  const isClient = conversation.client.userId === userId;
  const isPrestataire = conversation.prestataire.userId === userId;
  if (!isClient && !isPrestataire) throw new Error("FORBIDDEN");

  return conversation;
};

export const startConversation = async (userId: string, prestataireId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const prestataire = await prisma.prestataire.findUnique({ where: { id: prestataireId } });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const existing = await prisma.conversation.findUnique({
    where: { clientId_prestataireId: { clientId: client.id, prestataireId } },
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: { clientId: client.id, prestataireId },
  });
};

export const getConversations = async (userId: string) => {
  const [asClient, asPrestataire] = await Promise.all([
    prisma.conversation.findMany({
      where: { client: { userId } },
      include: {
        prestataire: { select: { id: true, user: { select: { firstName: true, lastName: true, avatar: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.findMany({
      where: { prestataire: { userId } },
      include: {
        client: { select: { id: true, user: { select: { firstName: true, lastName: true, avatar: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return [
    ...asClient.map((c) => ({
      id: c.id,
      other: c.prestataire.user,
      lastMessage: c.messages[0] ?? null,
      createdAt: c.createdAt,
    })),
    ...asPrestataire.map((c) => ({
      id: c.id,
      other: c.client.user,
      lastMessage: c.messages[0] ?? null,
      createdAt: c.createdAt,
    })),
  ];
};

export const getConversationMessages = async (conversationId: string, userId: string) => {
  const conversation = await checkConversationAccess(conversationId, userId);

  await prisma.message.updateMany({
    where: { conversationId, auteurId: { not: userId }, lu: false },
    data: { lu: true },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  const [clientUser, prestataireUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: conversation.client.userId },
      select: { id: true, firstName: true, avatar: true },
    }),
    prisma.user.findUnique({
      where: { id: conversation.prestataire.userId },
      select: { id: true, firstName: true, avatar: true },
    }),
  ]);

  return {
    messages,
    participants: { client: clientUser, prestataire: prestataireUser },
  };
};

export const getUnreadByConversation = async (userId: string) => {
  const [asClient, asPrestataire] = await Promise.all([
    prisma.conversation.findMany({ where: { client: { userId } }, select: { id: true } }),
    prisma.conversation.findMany({ where: { prestataire: { userId } }, select: { id: true } }),
  ]);

  const ids = [...asClient.map((c) => c.id), ...asPrestataire.map((c) => c.id)];
  if (ids.length === 0) return {} as Record<string, number>;

  const rows = await prisma.message.groupBy({
    by: ["conversationId"],
    where: { conversationId: { in: ids }, auteurId: { not: userId }, lu: false },
    _count: { id: true },
  });

  return Object.fromEntries(rows.map((r) => [r.conversationId as string, r._count.id]));
};

export const sendConversationMessage = async (
  conversationId: string,
  userId: string,
  contenu: string,
) => {
  await checkConversationAccess(conversationId, userId);

  if (!contenu || contenu.trim().length === 0) throw new Error("CONTENU_VIDE");
  if (contenu.trim().length > 1000) throw new Error("CONTENU_TROP_LONG");
  if (EMAIL_REGEX.test(contenu) || PHONE_REGEX.test(contenu))
    throw new Error("CONTACT_INFO_DETECTED");

  return prisma.message.create({
    data: { conversationId, auteurId: userId, contenu: contenu.trim() },
  });
};

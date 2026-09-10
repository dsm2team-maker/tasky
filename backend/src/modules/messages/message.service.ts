import { prisma } from "../../lib/prisma";

const checkAccess = async (prestationId: string, userId: string) => {
  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    include: {
      demande: {
        include: {
          client: { select: { userId: true, user: { select: { email: true, firstName: true } } } },
        },
      },
      prestataire: { select: { userId: true, user: { select: { email: true, firstName: true } } } },
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
    where: { prestationId, isSystem: false, auteurId: { not: userId }, lu: false },
    data: { lu: true },
  });

  // isSystem: false — les notifications Tasky-Infos vivent désormais uniquement dans le
  // fil global (destinataireId), pas dans la discussion classique de la prestation.
  const messages = await prisma.message.findMany({
    where: { prestationId, isSystem: false },
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
    where: { prestationId: { in: ids }, isSystem: false, OR: [{ auteurId: null }, { auteurId: { not: userId } }], lu: false },
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

  const [fromPrestations, fromConversations, fromTaskyInfo] = await Promise.all([
    prestationIds.length
      ? prisma.message.count({
          where: { prestationId: { in: prestationIds }, isSystem: false, OR: [{ auteurId: null }, { auteurId: { not: userId } }], lu: false },
        })
      : 0,
    conversationIds.length
      ? prisma.message.count({
          where: { conversationId: { in: conversationIds }, OR: [{ auteurId: null }, { auteurId: { not: userId } }], lu: false },
        })
      : 0,
    prisma.message.count({ where: { destinataireId: userId, lu: false } }),
  ]);

  return fromPrestations + fromConversations + fromTaskyInfo;
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

  const message = await prisma.message.create({
    data: { prestationId, auteurId: userId, contenu: contenu.trim() },
  });

  return message;
};

// =============================================================================
// TASKY-INFO (fil de notifications système, séparé des discussions personnelles)
// =============================================================================

export const sendSystemMessageToUser = async (
  destinataireId: string,
  contenu: string,
  prestationId?: string,
  demandeId?: string,
) => {
  return prisma.message.create({
    data: {
      destinataireId,
      auteurId: null,
      contenu,
      isSystem: true,
      ...(prestationId && { prestationId }),
      ...(demandeId && { demandeId }),
    },
  });
};

export const getUnreadTaskyInfoCount = async (userId: string) => {
  return prisma.message.count({ where: { destinataireId: userId, lu: false } });
};

export const getTaskyInfoMessages = async (userId: string) => {
  await prisma.message.updateMany({
    where: { destinataireId: userId, lu: false },
    data: { lu: true },
  });

  return prisma.message.findMany({
    where: { destinataireId: userId },
    include: {
      prestation: { select: { id: true, demandeId: true } },
      demande: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================================================================
// CONVERSATIONS DIRECTES (client ↔ prestataire, avant toute demande/devis)
// =============================================================================

const checkConversationAccess = async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      client: { select: { userId: true, user: { select: { email: true, firstName: true } } } },
      prestataire: { select: { userId: true, user: { select: { email: true, firstName: true } } } },
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
      where: { client: { userId }, messages: { some: {} } },
      include: {
        prestataire: { select: { id: true, user: { select: { firstName: true, lastName: true, avatar: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.findMany({
      where: { prestataire: { userId }, messages: { some: {} } },
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
    where: { conversationId, OR: [{ auteurId: null }, { auteurId: { not: userId } }], lu: false },
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
    where: { conversationId: { in: ids }, OR: [{ auteurId: null }, { auteurId: { not: userId } }], lu: false },
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

  const message = await prisma.message.create({
    data: { conversationId, auteurId: userId, contenu: contenu.trim() },
  });

  return message;
};

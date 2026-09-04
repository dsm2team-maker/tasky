import { prisma } from "../../lib/prisma";
import { notifySignalementCreated } from "../../services/notifications.service";

export const creerSignalement = async (
  userId: string,
  demandeId: string,
  message: string,
) => {
  if (!message || message.trim().length < 10)
    throw new Error("MESSAGE_TROP_COURT");

  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: { client: { include: { user: { select: { firstName: true, lastName: true } } } } },
  });

  if (!demande) throw new Error("DEMANDE_NOT_FOUND");
  if (demande.client.userId !== userId) throw new Error("FORBIDDEN");

  const statuts_autorises = ["EN_COURS", "A_VALIDER", "EN_ATTENTE_PAIEMENT", "EN_ATTENTE_INSPECTION"];
  if (!statuts_autorises.includes(demande.status))
    throw new Error("STATUT_INVALIDE");

  // Un seul signalement actif par demande
  const existing = await prisma.signalement.findFirst({
    where: { demandeId, statut: { not: "RESOLU" } },
  });
  if (existing) throw new Error("SIGNALEMENT_EXISTANT");

  const signalement = await prisma.signalement.create({
    data: {
      demandeId,
      auteurId: userId,
      message: message.trim(),
      statut: "EN_ATTENTE",
    },
  });

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  notifySignalementCreated(
    admins.map((a) => a.email),
    demande.reference,
    demande.titre,
    `${demande.client.user.firstName} ${demande.client.user.lastName}`,
    message.trim(),
  );

  return signalement;
};

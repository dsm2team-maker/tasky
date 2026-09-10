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
    include: {
      client: { include: { user: { select: { firstName: true, lastName: true } } } },
      prestations: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          prestataire: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
    },
  });

  if (!demande) throw new Error("DEMANDE_NOT_FOUND");

  const prestation = demande.prestations[0];
  const isClient = demande.client.userId === userId;
  const isPrestataire = prestation?.prestataire.userId === userId;
  if (!isClient && !isPrestataire) throw new Error("FORBIDDEN");

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
  const auteurNom = isClient
    ? `${demande.client.user.firstName} ${demande.client.user.lastName} (Client)`
    : `${prestation!.prestataire.user.firstName} ${prestation!.prestataire.user.lastName} (Prestataire)`;
  notifySignalementCreated(
    admins.map((a) => a.email),
    demande.reference,
    demande.titre,
    auteurNom,
    message.trim(),
  );

  return signalement;
};

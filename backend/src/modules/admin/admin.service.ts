import { prisma } from "../../lib/prisma";
import { splitMontant } from "../../config/commission.config";
import { addEmailJob, EmailJobData, EmailJobType } from "../../queues/email.queue";
import { notifyAccountStatus, notifySignalementResolved } from "../../services/notifications.service";

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
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { email: true, firstName: true },
  });
  notifyAccountStatus(user.email, user.firstName, true);
};

export const reactivateUser = async (userId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: { email: true, firstName: true },
  });
  notifyAccountStatus(user.email, user.firstName, false);
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
    include: {
      demande: {
        include: {
          prestations: { select: { id: true }, orderBy: { createdAt: "desc" }, take: 1 },
          client: { include: { user: { select: { email: true, firstName: true } } } },
        },
      },
    },
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
  const prestationId = signalement.demande?.prestations?.[0]?.id;
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

  const demande = signalement.demande;
  if (demande) {
    notifySignalementResolved(
      demande.client.user.email,
      demande.client.user.firstName,
      demande.reference,
      demande.titre,
      demande.id,
      note || undefined,
    );
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

// ─── Emails de test ───────────────────────────────────────────────────────────

export const TEST_EMAIL_TYPES: EmailJobType[] = [
  "verify-email",
  "reset-password",
  "quote-received",
  "order-confirmed",
  "order-completed",
  "phone-change-otp",
  "email-change-otp",
  "email-change-alert",
  "devis-refuse",
  "devis-accepte",
  "delete-account-otp",
  "signalement-created",
  "signalement-resolved",
  "prestation-contested",
  "account-status",
  "connect-onboarding-complete",
  "transfer-completed",
];

const buildTestEmailPayload = (type: EmailJobType) => {
  switch (type) {
    case "verify-email":
      return { firstName: "Test", verificationUrl: "https://tasky.fr/auth/verify?token=test-token", variant: "client" };
    case "reset-password":
      return { firstName: "Test", resetUrl: "https://tasky.fr/auth/reset-password?token=test-token" };
    case "quote-received":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", prestataireNom: "Jean Dupont", montant: 150, devisUrl: "https://tasky.fr/client/requests/test-id" };
    case "order-confirmed":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", montant: 150, role: "client" as const, prestationUrl: "https://tasky.fr/client/requests/test-id" };
    case "order-completed":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", montant: 150, role: "client" as const, isAutoValidated: false, prestationUrl: "https://tasky.fr/client/requests/test-id" };
    case "phone-change-otp":
      return { firstName: "Test", otp: "123456", newPhone: "0612345678", isAlert: false };
    case "email-change-otp":
      return { firstName: "Test", otp: "123456", newEmail: "nouvelle-adresse@example.com" };
    case "email-change-alert":
      return { firstName: "Test", newEmail: "nouvelle-adresse@example.com" };
    case "devis-refuse":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", demandesUrl: "https://tasky.fr/prestataire/requests" };
    case "devis-accepte":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", prestationUrl: "https://tasky.fr/prestataire/services/test-id" };
    case "delete-account-otp":
      return { firstName: "Test", otp: "123456" };
    case "signalement-created":
      return { demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", auteurNom: "Jean Dupont", message: "La prestation ne correspond pas à ce qui était prévu.", signalementUrl: "https://tasky.fr/admin/signalements" };
    case "signalement-resolved":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", note: "Le prestataire a été recontacté, le problème est résolu.", demandeUrl: "https://tasky.fr/client/requests/test-id" };
    case "prestation-contested":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", motif: "Le travail n'a pas été terminé correctement.", prestationUrl: "https://tasky.fr/prestataire/requests" };
    case "account-status":
      return { firstName: "Test", suspended: true, reason: "Non-respect des CGU.", supportUrl: "https://tasky.fr/contact" };
    case "connect-onboarding-complete":
      return { firstName: "Test", earningsUrl: "https://tasky.fr/prestataire/earnings" };
    case "transfer-completed":
      return { firstName: "Test", demandeReference: "TSK-000123", demandeTitre: "Réparation plomberie", montant: 127.5, earningsUrl: "https://tasky.fr/prestataire/earnings" };
  }
};

export const sendTestEmail = async (type: EmailJobType, to: string) => {
  const data = { type, to, payload: buildTestEmailPayload(type) } as EmailJobData;
  await addEmailJob(data);
};

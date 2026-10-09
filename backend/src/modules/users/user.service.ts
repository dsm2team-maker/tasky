import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { emailExists, findUserByEmail } from "../../utils/email.utils";
import { addEmailJob, EMAIL_PRIORITY } from "../../queues/email.queue";
import { generateOtp, generateResetToken } from "../../utils/token.utils";
import { env } from "../../config/env.config";
import { timingSafeEqual } from "crypto";

// ─── Constantes ───────────────────────────────────────────────────────────────
const OTP_COOLDOWN_MS = 2 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const BIO_MIN = 100;

// ─── OTP : tentative atomique ─────────────────────────────────────────────────
// Le compteur est incrémenté AVANT la comparaison, par une mise à jour conditionnée à la
// valeur lue (verrouillage optimiste). Avant : N requêtes parallèles lisaient toutes
// attempts=0 et testaient N codes → la limite de 5 essais était contournable (SEC-001/009).
const otpEquals = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

export const consumeOtpAttempt = async (
  record: { id: string; token: string; metadata: unknown },
  otp: unknown,
) => {
  const metadata = (record.metadata ?? {}) as Record<string, unknown>;
  const attempts = typeof metadata.attempts === "number" ? metadata.attempts : 0;
  if (attempts >= MAX_OTP_ATTEMPTS) throw new Error("OTP_MAX_ATTEMPTS");

  const remaining = MAX_OTP_ATTEMPTS - (attempts + 1);
  const { count } = await prisma.verificationToken.updateMany({
    where: { id: record.id, used: false, metadata: { path: ["attempts"], equals: attempts } },
    data: { metadata: { ...metadata, attempts: attempts + 1 } as any },
  });
  // Une autre tentative concurrente a consommé ce créneau : refus sans comparer le code
  if (count === 0) throw new Error(`OTP_INVALID:${Math.max(remaining, 0)}`);

  if (typeof otp !== "string" || !otpEquals(record.token, otp)) {
    throw new Error(`OTP_INVALID:${remaining}`);
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  city?: string;
  codePostal?: string | null;
}

// =============================================================================
// GET PROFILE
// =============================================================================
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      city: true,
      codePostal: true,
      avatar: true,
      role: true,
      emailVerified: true,
      isActive: true,
      createdAt: true,
      client: { select: { id: true } },
      prestataire: {
        select: {
          id: true,
          bio: true,
          rating: true,
          reviewCount: true,
          disponibilite: true,
          pointDepotAdresse: true,
          pointDepotVille: true,
          pointDepotCodePostal: true,
          pointDepotLat: true,
          pointDepotLng: true,
          pointDepotInstructions: true,
          tauxReussite: true,
          delaiMoyen: true,
          tempsReponse: true,
          stripeAccountId: true,
          stripeOnboardingStatus: true,
          stripeChargesEnabled: true,
          stripePayoutsEnabled: true,
          stripeDetailsSubmitted: true,
        },
      },
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  const phoneMasked = user.phone ? maskPhone(user.phone) : null;

  return {
    ...user,
    phone: undefined,
    phoneMasked,
  };
};

// =============================================================================
// UPDATE PROFILE
// =============================================================================
export const updateProfile = async (
  userId: string,
  data: UpdateProfileData,
) => {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.codePostal !== undefined && { codePostal: data.codePostal }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
        codePostal: true,
        avatar: true,
        updatedAt: true,
      },
    });
    return updated;
  } catch (error: any) {
    if (error.code === "P2025") throw new Error("USER_NOT_FOUND");
    throw error;
  }
};

// =============================================================================
// REQUEST PHONE CHANGE
// =============================================================================
export const requestPhoneChange = async (userId: string, newPhone: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, phone: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.phone === newPhone) throw new Error("SAME_PHONE");

  const existing = await prisma.user.findFirst({ where: { phone: newPhone } });
  if (existing) throw new Error("PHONE_ALREADY_USED");

  const lastOtp = await prisma.verificationToken.findFirst({
    where: { userId, type: "PHONE_CHANGE_OTP", used: false },
    orderBy: { createdAt: "desc" },
  });

  if (lastOtp) {
    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`COOLDOWN:${waitSeconds}`);
    }
    await prisma.verificationToken.update({
      where: { id: lastOtp.id },
      data: { used: true },
    });
  }

  const { otp, expiresAt } = generateOtp();

  await prisma.verificationToken.create({
    data: {
      userId,
      token: otp,
      type: "PHONE_CHANGE_OTP",
      expiresAt,
      metadata: { newPhone, attempts: 0 },
    },
  });

  if (env.isDev) {
    console.log(
      `🔐 [DEV] OTP changement téléphone → envoyé sur ${newPhone} : ${otp}`,
    );
  } else {
    addEmailJob(
      {
        type: "phone-change-otp",
        to: user.email,
        userId,
        payload: {
          firstName: user.firstName,
          otp,
          isAlert: false,
          newPhone,
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    ).catch((e) => console.warn("[email] phone-change otp:", e?.message));
  }
};

// =============================================================================
// VERIFY PHONE OTP
// =============================================================================
export const verifyPhoneOtp = async (userId: string, otp: string) => {
  const record = await prisma.verificationToken.findFirst({
    where: {
      userId,
      type: "PHONE_CHANGE_OTP",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new Error("OTP_EXPIRED_OR_NOT_FOUND");

  const metadata = record.metadata as { newPhone: string; attempts: number };

  await consumeOtpAttempt(record, otp);

  const conflict = await prisma.user.findFirst({
    where: { phone: metadata.newPhone },
  });
  if (conflict) throw new Error("PHONE_ALREADY_USED");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { phone: metadata.newPhone },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  if (user && !env.isDev) {
    addEmailJob(
      {
        type: "phone-change-otp",
        to: user.email,
        userId,
        payload: {
          firstName: user.firstName,
          otp: "",
          isAlert: true,
          newPhone: maskPhone(metadata.newPhone),
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    ).catch((e) => console.warn("[email] phone-change alert:", e?.message));
  }
};

// =============================================================================
// REQUEST EMAIL CHANGE
// =============================================================================
// Le mot de passe actuel est exigé : un token de session volé ne suffit plus à détourner
// l'email du compte puis à faire un "mot de passe oublié" (SEC-022)
export const requestEmailChange = async (userId: string, newEmail: string, currentPassword: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, phone: true, password: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  if (!(await bcrypt.compare(currentPassword, user.password)))
    throw new Error("INVALID_CURRENT_PASSWORD");
  if (user.email.toLowerCase() === newEmail.toLowerCase())
    throw new Error("SAME_EMAIL");

  if (await emailExists(newEmail)) throw new Error("EMAIL_ALREADY_USED");

  const lastOtp = await prisma.verificationToken.findFirst({
    where: { userId, type: "EMAIL_CHANGE_OTP", used: false },
    orderBy: { createdAt: "desc" },
  });

  if (lastOtp) {
    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`COOLDOWN:${waitSeconds}`);
    }
    await prisma.verificationToken.update({
      where: { id: lastOtp.id },
      data: { used: true },
    });
  }

  const { otp, expiresAt } = generateOtp();

  await prisma.verificationToken.create({
    data: {
      userId,
      token: otp,
      type: "EMAIL_CHANGE_OTP",
      expiresAt,
      metadata: { newEmail: newEmail.toLowerCase(), attempts: 0 },
    },
  });

  if (env.isDev) {
    console.log(
      `🔐 [DEV] OTP changement email → envoyé sur ${newEmail} : ${otp}`,
    );
  } else {
    addEmailJob(
      {
        type: "email-change-otp",
        to: newEmail.toLowerCase(),
        userId,
        payload: {
          firstName: user.firstName,
          otp,
          newEmail: newEmail.toLowerCase(),
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    ).catch((e) => console.warn("[email] email-change otp:", e?.message));
  }
};

// =============================================================================
// VERIFY EMAIL OTP
// =============================================================================
export const verifyEmailOtp = async (userId: string, otp: string) => {
  const record = await prisma.verificationToken.findFirst({
    where: {
      userId,
      type: "EMAIL_CHANGE_OTP",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new Error("OTP_EXPIRED_OR_NOT_FOUND");

  const metadata = record.metadata as { newEmail: string; attempts: number };

  await consumeOtpAttempt(record, otp);

  if (await emailExists(metadata.newEmail)) throw new Error("EMAIL_ALREADY_USED");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { email: metadata.newEmail },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  if (user && !env.isDev) {
    addEmailJob(
      {
        type: "email-change-alert",
        to: user.email,
        userId,
        payload: { firstName: user.firstName, newEmail: metadata.newEmail },
      },
      EMAIL_PRIORITY.CRITICAL,
    ).catch((e) => console.warn("[email] email-change alert:", e?.message));
  } else {
    console.log(
      `🔐 [DEV] Email mis à jour : ${user?.email} → ${metadata.newEmail}`,
    );
  }
};

// =============================================================================
// REQUEST DELETE ACCOUNT
// =============================================================================
export const requestDeleteAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      firstName: true,
      isActive: true,
      client: { select: { id: true } },
      prestataire: { select: { id: true } },
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  if (!user.isActive) throw new Error("ACCOUNT_ALREADY_INACTIVE");

  // Bloquer si prestations actives côté client
  if (user.client) {
    const clientActive = await prisma.prestation.count({
      where: {
        status: { notIn: ["TERMINEE", "ANNULEE"] },
        demande: { clientId: user.client.id },
      },
    });
    if (clientActive > 0) throw new Error("HAS_ACTIVE_PRESTATIONS");
  }

  // Bloquer si prestations actives côté prestataire
  if (user.prestataire) {
    const prestaActive = await prisma.prestation.count({
      where: {
        status: { notIn: ["TERMINEE", "ANNULEE"] },
        prestataireId: user.prestataire.id,
      },
    });
    if (prestaActive > 0) throw new Error("HAS_ACTIVE_PRESTATIONS");
  }

  // Cooldown
  const lastOtp = await prisma.verificationToken.findFirst({
    where: { userId, type: "DELETE_ACCOUNT_OTP", used: false },
    orderBy: { createdAt: "desc" },
  });

  if (lastOtp) {
    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`COOLDOWN:${waitSeconds}`);
    }
    await prisma.verificationToken.update({
      where: { id: lastOtp.id },
      data: { used: true },
    });
  }

  const { otp, expiresAt } = generateOtp();

  await prisma.verificationToken.create({
    data: {
      userId,
      token: otp,
      type: "DELETE_ACCOUNT_OTP",
      expiresAt,
      metadata: { attempts: 0 },
    },
  });

  if (env.isDev) {
    console.log(`🔐 [DEV] OTP suppression compte → ${user.email} : ${otp}`);
  } else {
    addEmailJob(
      {
        type: "delete-account-otp",
        to: user.email,
        userId,
        payload: { firstName: user.firstName, otp },
      },
      EMAIL_PRIORITY.CRITICAL,
    ).catch((e) => console.warn("[email] delete-account otp:", e?.message));
  }
};

// =============================================================================
// CONFIRM DELETE ACCOUNT
// =============================================================================
export const confirmDeleteAccount = async (userId: string, otp: string) => {
  const record = await prisma.verificationToken.findFirst({
    where: {
      userId,
      type: "DELETE_ACCOUNT_OTP",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new Error("OTP_EXPIRED_OR_NOT_FOUND");

  await consumeOtpAttempt(record, otp);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });
  if (!user) throw new Error("USER_NOT_FOUND");

  // Anonymisation RGPD + désactivation
  // L'id complet est encodé dans l'email anonyme pour retrouver le compte en cas de litige
  const now = Date.now();
  const anonEmail = `DEL_${userId}_${now}@deleted.tasky.fr`;
  const anonPhone = `DEL_${userId.slice(0, 15)}`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        email: anonEmail,
        firstName: "Utilisateur",
        lastName: "Supprimé",
        phone: anonPhone,
        avatar: null,
        city: null,
        codePostal: null,
      },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  if (env.isDev) {
    console.log(`✅ [DEV] Compte supprimé → confirmation à ${user.email}`);
  } else {
    addEmailJob(
      {
        type: "account-deleted",
        to: user.email,
        payload: { firstName: user.firstName },
      },
      EMAIL_PRIORITY.CRITICAL,
    ).catch((e) => console.warn("[email] account-deleted:", e?.message));
  }
};

// =============================================================================
// UTILITAIRE — Masquer le téléphone
// =============================================================================
const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length !== 10) return "••••••••••";
  return `${cleaned.slice(0, 2)}•• •• •• ${cleaned.slice(8)}`;
};

// =============================================================================
// UTILITAIRE — Vérifier si le profil prestataire est complet (5/5)
// ✅ Email vérifié + Bio + Compétences + Point de dépôt + Paiement Stripe Connect
// =============================================================================
const isPrestataireProfileComplete = async (
  prestataireId: string,
  userId: string,
): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  const prestataire = await prisma.prestataire.findUnique({
    where: { id: prestataireId },
    select: {
      bio: true,
      pointDepotAdresse: true,
      stripePayoutsEnabled: true,
      competences: { select: { id: true }, take: 1 },
    },
  });

  if (!user || !prestataire) return false;

  const emailVerified = !!user.emailVerified;
  const hasBio = (prestataire.bio?.length ?? 0) >= BIO_MIN;
  const hasCompetences = prestataire.competences.length > 0;
  const hasPointDepot = !!prestataire.pointDepotAdresse;
  const hasPayoutsEnabled = prestataire.stripePayoutsEnabled;

  return emailVerified && hasBio && hasCompetences && hasPointDepot && hasPayoutsEnabled;
};

// =============================================================================
// RECOVER EMAIL — disponibilité
// =============================================================================
// Aucun envoi de SMS n'est implémenté : hors dev, l'OTP n'était livré à personne mais
// restait vérifiable → prise de contrôle de compte par force brute (SEC-001).
// Ne réactiver qu'une fois l'envoi SMS réel en place (et le changement d'email confirmé
// par lien sur la nouvelle adresse plutôt qu'appliqué directement).
export const isRecoverEmailAvailable = () => env.isDev;

// =============================================================================
// RECOVER EMAIL — ÉTAPE 1
// =============================================================================
export const recoverEmailSendOtp = async (email: string) => {
  if (!isRecoverEmailAvailable()) throw new Error("RECOVER_EMAIL_UNAVAILABLE");

  const user = await findUserByEmail(email);

  // Les comptes ADMIN sont exclus de ce flux (réponse identique à un compte inexistant)
  if (!user || user.role === "ADMIN") throw new Error("USER_NOT_FOUND");
  if (!user.phone) throw new Error("NO_PHONE");

  const lastOtp = await prisma.verificationToken.findFirst({
    where: { userId: user.id, type: "RECOVER_EMAIL_OTP", used: false },
    orderBy: { createdAt: "desc" },
  });

  if (lastOtp) {
    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    if (elapsed < OTP_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
      throw new Error(`COOLDOWN:${waitSeconds}`);
    }
    await prisma.verificationToken.update({
      where: { id: lastOtp.id },
      data: { used: true },
    });
  }

  const { otp, expiresAt } = generateOtp();

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: otp,
      type: "RECOVER_EMAIL_OTP",
      expiresAt,
      metadata: { email: email.toLowerCase(), attempts: 0 },
    },
  });

  if (env.isDev) {
    console.log(
      `🔐 [DEV] OTP récupération email → envoyé sur ${user.phone} : ${otp}`,
    );
  } else {
    console.warn("⚠️ [PROD] Twilio non configuré — OTP non envoyé par SMS");
  }

  return { phoneMasked: maskPhone(user.phone) };
};

// =============================================================================
// RECOVER EMAIL — ÉTAPE 2
// =============================================================================
export const recoverEmailVerifyOtp = async (
  email: string,
  otp: string,
  newEmail: string,
) => {
  if (!isRecoverEmailAvailable()) throw new Error("RECOVER_EMAIL_UNAVAILABLE");

  const user = await findUserByEmail(email);

  if (!user || user.role === "ADMIN") throw new Error("USER_NOT_FOUND");
  if (user.email.toLowerCase() === newEmail.toLowerCase())
    throw new Error("SAME_EMAIL");

  if (await emailExists(newEmail)) throw new Error("EMAIL_ALREADY_USED");

  const record = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      type: "RECOVER_EMAIL_OTP",
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new Error("OTP_EXPIRED_OR_NOT_FOUND");

  await consumeOtpAttempt(record, otp);

  if (await emailExists(newEmail)) throw new Error("EMAIL_ALREADY_USED");

  const { token: resetToken, expiresAt: resetExpiresAt } = generateResetToken();
  const resetUrl = `${env.frontendUrl}/auth/reset-password?token=${resetToken}`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail.toLowerCase() },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: "PASSWORD_RESET",
        expiresAt: resetExpiresAt,
        used: false,
      },
    }),
  ]);

  addEmailJob(
    {
      type: "reset-password",
      to: newEmail.toLowerCase(),
      userId: user.id,
      payload: { firstName: user.firstName, resetUrl },
    },
    EMAIL_PRIORITY.CRITICAL,
  ).catch((e) => console.warn("[email] reset-password:", e?.message));

  if (env.isDev) {
    console.log(`🔐 [DEV] Email récupéré : ${user.email} → ${newEmail}`);
    console.log(`📧 [DEV] Reset password URL : ${resetUrl}`);
  }

  return { newEmail: newEmail.toLowerCase() };
};

// =============================================================================
// UPDATE PRESTATAIRE PROFILE
// =============================================================================
interface UpdatePrestataireData {
  bio?: string;
  disponibilite?: "ACTIF" | "OCCUPE" | "ABSENT";
  pointDepotAdresse?: string;
  pointDepotVille?: string;
  pointDepotCodePostal?: string;
  pointDepotLat?: number;
  pointDepotLng?: number;
  pointDepotInstructions?: string;
}

export const updatePrestataireProfile = async (
  userId: string,
  data: UpdatePrestataireData,
) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: {
      id: true,
      bio: true,
      pointDepotAdresse: true,
      competences: { select: { id: true }, take: 1 },
    },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  // ⚡ Bloquer le changement de disponibilité si profil incomplet
  if (data.disponibilite !== undefined) {
    const complete = await isPrestataireProfileComplete(prestataire.id, userId);
    if (!complete) throw new Error("PROFILE_INCOMPLETE");
  }

  const updated = await prisma.prestataire.update({
    where: { userId },
    data: {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.disponibilite !== undefined && {
        disponibilite: data.disponibilite,
      }),
      ...(data.pointDepotAdresse !== undefined && {
        pointDepotAdresse: data.pointDepotAdresse,
      }),
      ...(data.pointDepotVille !== undefined && {
        pointDepotVille: data.pointDepotVille,
      }),
      ...(data.pointDepotCodePostal !== undefined && {
        pointDepotCodePostal: data.pointDepotCodePostal,
      }),
      ...(data.pointDepotLat !== undefined && {
        pointDepotLat: data.pointDepotLat,
      }),
      ...(data.pointDepotLng !== undefined && {
        pointDepotLng: data.pointDepotLng,
      }),
      ...(data.pointDepotInstructions !== undefined && {
        pointDepotInstructions: data.pointDepotInstructions,
      }),
    },
    select: {
      id: true,
      bio: true,
      rating: true,
      reviewCount: true,
      disponibilite: true,
      pointDepotAdresse: true,
      pointDepotVille: true,
      pointDepotCodePostal: true,
      pointDepotLat: true,
      pointDepotLng: true,
      pointDepotInstructions: true,
      stripeAccountId: true,
      stripeOnboardingStatus: true,
      stripeChargesEnabled: true,
      stripePayoutsEnabled: true,
      stripeDetailsSubmitted: true,
    },
  });

  return updated;
};

// =============================================================================
// GET PRESTATAIRE COMPETENCES
// =============================================================================
export const getPrestataireCompetences = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: {
      id: true,
      competences: {
        select: {
          id: true,
          categoryId: true,
          category: { select: { id: true, nom: true, icon: true, slug: true } },
          subCategoryId: true,
          subCategory: { select: { id: true, nom: true, slug: true } },
          interventionId: true,
          intervention: { select: { id: true, nom: true } },
        },
      },
    },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");
  return prestataire.competences;
};

// =============================================================================
// UPDATE PRESTATAIRE COMPETENCES
// =============================================================================
const MAX_CATEGORIES = 3;

interface CompetenceInput {
  categoryId: string;
  subCategoryId?: string;
  interventionId?: string;
}

export const updatePrestataireCompetences = async (
  userId: string,
  competences: CompetenceInput[],
) => {
  if (!competences.length) throw new Error("NO_COMPETENCES");

  const uniqueCategoryIds = [...new Set(competences.map((c) => c.categoryId))];
  if (uniqueCategoryIds.length > MAX_CATEGORIES)
    throw new Error(`MAX_CATEGORIES:${MAX_CATEGORIES}`);

  const categories = await prisma.category.findMany({
    where: { id: { in: uniqueCategoryIds } },
    select: { id: true },
  });
  if (categories.length !== uniqueCategoryIds.length)
    throw new Error("INVALID_CATEGORY");

  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  await prisma.competence.deleteMany({
    where: { prestataireId: prestataire.id },
  });
  await prisma.competence.createMany({
    data: competences.map((c) => ({
      prestataireId: prestataire.id,
      categoryId: c.categoryId,
      subCategoryId: c.subCategoryId || null,
      interventionId: c.interventionId || null,
    })),
  });

  // ⚡ Vérifier si profil complet → activer automatiquement
  const nowComplete = await isPrestataireProfileComplete(
    prestataire.id,
    userId,
  );
  if (nowComplete) {
    const current = await prisma.prestataire.findUnique({
      where: { id: prestataire.id },
      select: { disponibilite: true },
    });
    if (current?.disponibilite === "ABSENT") {
      await prisma.prestataire.update({
        where: { id: prestataire.id },
        data: { disponibilite: "ACTIF" },
      });
    }
  }

  return getPrestataireCompetences(userId);
};

// =============================================================================
// GET PRESTATAIRE STATS
// =============================================================================
export const getPrestataireStats = async (userId: string) => {
  const prestataire = await prisma.prestataire.findUnique({
    where: { userId },
    select: {
      id: true,
      rating: true,
      reviewCount: true,
      prestations: { select: { status: true } },
    },
  });
  if (!prestataire) throw new Error("PRESTATAIRE_NOT_FOUND");

  const nbPrestations = prestataire.prestations.filter(
    (p) => p.status === "TERMINEE",
  ).length;

  return {
    rating: prestataire.rating,
    reviewCount: prestataire.reviewCount,
    nbPrestations,
  };
};

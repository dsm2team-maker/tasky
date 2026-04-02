import { prisma } from "../../lib/prisma";
import { addEmailJob, EMAIL_PRIORITY } from "../../queues/email.queue";
import { generateOtp, generateResetToken } from "../../utils/token.utils";
import { env } from "../../config/env.config";

// ─── Constantes ───────────────────────────────────────────────────────────────
const OTP_COOLDOWN_MS = 2 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const OTP_BLOCK_DURATION_MS = 30 * 60 * 1000;
const BIO_MIN = 100;

// ─── Types ────────────────────────────────────────────────────────────────────
interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  city?: string;
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
          // ✅ IBAN ajouté
          iban: true,
          ibanVerified: true,
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
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        city: true,
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
    console.warn("⚠️ [PROD] Twilio non configuré — OTP non envoyé par SMS");
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

  if (metadata.attempts >= MAX_OTP_ATTEMPTS)
    throw new Error("OTP_MAX_ATTEMPTS");

  if (record.token !== otp) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { metadata: { ...metadata, attempts: metadata.attempts + 1 } },
    });
    const remaining = MAX_OTP_ATTEMPTS - (metadata.attempts + 1);
    throw new Error(`OTP_INVALID:${remaining}`);
  }

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
    await addEmailJob(
      {
        type: "phone-change-otp",
        to: user.email,
        userId,
        payload: {
          firstName: user.firstName,
          isAlert: true,
          newPhone: maskPhone(metadata.newPhone),
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
  }
};

// =============================================================================
// REQUEST EMAIL CHANGE
// =============================================================================
export const requestEmailChange = async (userId: string, newEmail: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, phone: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.email.toLowerCase() === newEmail.toLowerCase())
    throw new Error("SAME_EMAIL");

  const existing = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });
  if (existing) throw new Error("EMAIL_ALREADY_USED");

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
    await addEmailJob(
      {
        type: "phone-change-otp",
        to: newEmail.toLowerCase(),
        userId,
        payload: {
          firstName: user.firstName,
          otp,
          newPhone: newEmail.toLowerCase(),
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
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

  if (metadata.attempts >= MAX_OTP_ATTEMPTS)
    throw new Error("OTP_MAX_ATTEMPTS");

  if (record.token !== otp) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { metadata: { ...metadata, attempts: metadata.attempts + 1 } },
    });
    const remaining = MAX_OTP_ATTEMPTS - (metadata.attempts + 1);
    throw new Error(`OTP_INVALID:${remaining}`);
  }

  const conflict = await prisma.user.findUnique({
    where: { email: metadata.newEmail },
  });
  if (conflict) throw new Error("EMAIL_ALREADY_USED");

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
    await addEmailJob(
      {
        type: "email-change-alert",
        to: user.email,
        userId,
        payload: { firstName: user.firstName, newEmail: metadata.newEmail },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
  } else {
    console.log(
      `🔐 [DEV] Email mis à jour : ${user?.email} → ${metadata.newEmail}`,
    );
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
// ✅ Email vérifié + Bio + Compétences + Point de dépôt + IBAN
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
      iban: true,
      competences: { select: { id: true }, take: 1 },
    },
  });

  if (!user || !prestataire) return false;

  const emailVerified = !!user.emailVerified;
  const hasBio = (prestataire.bio?.length ?? 0) >= BIO_MIN;
  const hasCompetences = prestataire.competences.length > 0;
  const hasPointDepot = !!prestataire.pointDepotAdresse;
  const hasIban = !!prestataire.iban;

  return emailVerified && hasBio && hasCompetences && hasPointDepot && hasIban;
};

// =============================================================================
// RECOVER EMAIL — ÉTAPE 1
// =============================================================================
export const recoverEmailSendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, firstName: true, phone: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
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
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, firstName: true, email: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  if (user.email.toLowerCase() === newEmail.toLowerCase())
    throw new Error("SAME_EMAIL");

  const existing = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });
  if (existing) throw new Error("EMAIL_ALREADY_USED");

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

  const metadata = record.metadata as { email: string; attempts: number };

  if (metadata.attempts >= MAX_OTP_ATTEMPTS)
    throw new Error("OTP_MAX_ATTEMPTS");

  if (record.token !== otp) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { metadata: { ...metadata, attempts: metadata.attempts + 1 } },
    });
    const remaining = MAX_OTP_ATTEMPTS - (metadata.attempts + 1);
    throw new Error(`OTP_INVALID:${remaining}`);
  }

  const conflict = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });
  if (conflict) throw new Error("EMAIL_ALREADY_USED");

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

  await addEmailJob(
    {
      type: "reset-password",
      to: newEmail.toLowerCase(),
      userId: user.id,
      payload: { firstName: user.firstName, resetUrl },
    },
    EMAIL_PRIORITY.CRITICAL,
  );

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
  iban?: string;
}

export const updatePrestataireProfile = async (
  userId: string,
  data: UpdatePrestataireData,
) => {
  console.log("📝 data reçu:", JSON.stringify(data));
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
      ...(data.iban !== undefined && { iban: data.iban, ibanVerified: false }),
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
      iban: true,
      ibanVerified: true,
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

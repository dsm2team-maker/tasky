import { prisma } from "../../lib/prisma";
import { addEmailJob, EMAIL_PRIORITY } from "../../queues/email.queue";
import { generateOtp, generateResetToken } from "../../utils/token.utils";
import { env } from "../../config/env.config";

// ─── Constantes ───────────────────────────────────────────────────────────────
const OTP_COOLDOWN_MS = 2 * 60 * 1000; // 2 min entre chaque demande OTP
const MAX_OTP_ATTEMPTS = 5; // 5 essais avant blocage
const OTP_BLOCK_DURATION_MS = 30 * 60 * 1000; // Blocage 30 min

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
          verified: true,
        },
      },
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  // Masquer partiellement le téléphone : "06•• •• •• 78"
  const phoneMasked = user.phone ? maskPhone(user.phone) : null;

  return {
    ...user,
    phone: undefined, // Ne jamais renvoyer le téléphone brut
    phoneMasked,
  };
};

// =============================================================================
// UPDATE PROFILE
// Champs modifiables librement : firstName, lastName, city
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
// Envoie un OTP sur le NOUVEAU numéro pour vérifier que l'utilisateur y a accès
// DEV → log console / PROD → Twilio SMS
// =============================================================================
export const requestPhoneChange = async (userId: string, newPhone: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, phone: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  // Vérifier que le nouveau numéro n'est pas déjà le numéro actuel
  if (user.phone === newPhone) throw new Error("SAME_PHONE");

  // Vérifier que le nouveau numéro n'est pas déjà pris
  const existing = await prisma.user.findFirst({ where: { phone: newPhone } });
  if (existing) throw new Error("PHONE_ALREADY_USED");

  // Vérifier le cooldown — pas de nouvel OTP avant 2 min
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

  // Générer le nouvel OTP
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

  // DEV → log console / PROD → Twilio SMS sur le NOUVEAU numéro
  if (env.isDev) {
    console.log(
      `🔐 [DEV] OTP changement téléphone → envoyé sur ${newPhone} : ${otp}`,
    );
  } else {
    // TODO: brancher Twilio
    // await sendSms(newPhone, `Votre code Tasky : ${otp} (valable 10 min)`);
    console.warn("⚠️ [PROD] Twilio non configuré — OTP non envoyé par SMS");
  }
};

// =============================================================================
// VERIFY PHONE OTP
// Valide l'OTP → met à jour le téléphone → invalide toutes les sessions
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

  // Vérifier le nombre de tentatives
  if (metadata.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("OTP_MAX_ATTEMPTS");
  }

  // Mauvais OTP → incrémenter les tentatives
  if (record.token !== otp) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { metadata: { ...metadata, attempts: metadata.attempts + 1 } },
    });
    const remaining = MAX_OTP_ATTEMPTS - (metadata.attempts + 1);
    throw new Error(`OTP_INVALID:${remaining}`);
  }

  // ✅ OTP correct — vérifier une dernière fois que le numéro est libre
  const conflict = await prisma.user.findFirst({
    where: { phone: metadata.newPhone },
  });
  if (conflict) throw new Error("PHONE_ALREADY_USED");

  // Appliquer le changement + invalider l'OTP + invalider toutes les sessions
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { phone: metadata.newPhone },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({
      where: { userId },
    }),
  ]);

  // Envoyer un email d'alerte sur l'adresse email du compte
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  if (user && !env.isDev) {
    await addEmailJob(
      {
        type: "phone-change-otp", // réutilise le canal, payload différent
        to: user.email,
        userId,
        payload: {
          firstName: user.firstName,
          isAlert: true, // flag pour le template → mode alerte
          newPhone: maskPhone(metadata.newPhone),
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
  }
};

// =============================================================================
// REQUEST EMAIL CHANGE
// Envoie un OTP sur le NOUVEL email pour vérifier que l'utilisateur y a accès
// =============================================================================
export const requestEmailChange = async (userId: string, newEmail: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true, phone: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  // Vérifier que le nouvel email n'est pas déjà l'email actuel
  if (user.email.toLowerCase() === newEmail.toLowerCase()) {
    throw new Error("SAME_EMAIL");
  }

  // Vérifier que le nouvel email n'est pas déjà pris
  const existing = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });
  if (existing) throw new Error("EMAIL_ALREADY_USED");

  // Vérifier le cooldown
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

  // Générer l'OTP
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

  // Envoyer l'OTP sur le NOUVEL email (prouve que l'utilisateur y a accès)
  if (env.isDev) {
    console.log(
      `🔐 [DEV] OTP changement email → envoyé sur ${newEmail} : ${otp}`,
    );
  } else {
    await addEmailJob(
      {
        type: "phone-change-otp", // réutilise le template OTP existant
        to: newEmail.toLowerCase(),
        userId,
        payload: {
          firstName: user.firstName,
          otp,
          newPhone: newEmail.toLowerCase(), // champ réutilisé pour afficher la destination
        },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
  }
};

// =============================================================================
// VERIFY EMAIL OTP
// Valide l'OTP → met à jour l'email directement → invalide toutes les sessions
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

  // Vérifier le nombre de tentatives
  if (metadata.attempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("OTP_MAX_ATTEMPTS");
  }

  // Mauvais OTP
  if (record.token !== otp) {
    await prisma.verificationToken.update({
      where: { id: record.id },
      data: { metadata: { ...metadata, attempts: metadata.attempts + 1 } },
    });
    const remaining = MAX_OTP_ATTEMPTS - (metadata.attempts + 1);
    throw new Error(`OTP_INVALID:${remaining}`);
  }

  // ✅ OTP correct — vérifier une dernière fois que l'email est libre (race condition)
  const conflict = await prisma.user.findUnique({
    where: { email: metadata.newEmail },
  });
  if (conflict) throw new Error("EMAIL_ALREADY_USED");

  // Récupérer l'ancien email pour l'alerte de sécurité
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, firstName: true },
  });

  // Appliquer le changement + invalider OTP + invalider toutes les sessions
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { email: metadata.newEmail },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({
      where: { userId },
    }),
  ]);

  // Envoyer une alerte de sécurité sur l'ANCIENNE adresse
  if (user && !env.isDev) {
    await addEmailJob(
      {
        type: "email-change-alert",
        to: user.email,
        userId,
        payload: {
          firstName: user.firstName,
          newEmail: metadata.newEmail,
        },
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
// "0612345678" → "06•• •• •• 78"
// =============================================================================
const maskPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length !== 10) return "••••••••••";
  return `${cleaned.slice(0, 2)}•• •• •• ${cleaned.slice(8)}`;
};

// =============================================================================
// RECOVER EMAIL — ÉTAPE 1
// =============================================================================
// RECOVER EMAIL — ÉTAPE 1
// Prend l'ancienne adresse email → trouve le compte → envoie OTP SMS
// DEV → log console / PROD → Twilio
// =============================================================================
export const recoverEmailSendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, firstName: true, phone: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");
  if (!user.phone) throw new Error("NO_PHONE");

  // Cooldown 2 min
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

  // DEV → log console / PROD → Twilio SMS
  if (env.isDev) {
    console.log(
      `🔐 [DEV] OTP récupération email → envoyé sur ${user.phone} : ${otp}`,
    );
  } else {
    // TODO: brancher Twilio
    // await sendSms(user.phone, `Votre code Tasky : ${otp} (valable 10 min)`);
    console.warn("⚠️ [PROD] Twilio non configuré — OTP non envoyé par SMS");
  }

  return { phoneMasked: maskPhone(user.phone) };
};

// =============================================================================
// RECOVER EMAIL — ÉTAPE 2
// Valide OTP SMS + saisie nouvel email → met à jour directement
// + envoie lien reset password sur le nouvel email
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

  // Vérifier que le nouvel email n'est pas déjà l'email actuel
  if (user.email.toLowerCase() === newEmail.toLowerCase()) {
    throw new Error("SAME_EMAIL");
  }

  // Vérifier que le nouvel email n'est pas déjà pris
  const existing = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });
  if (existing) throw new Error("EMAIL_ALREADY_USED");

  // Trouver et valider l'OTP SMS
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

  // Race condition check
  const conflict = await prisma.user.findUnique({
    where: { email: newEmail.toLowerCase() },
  });
  if (conflict) throw new Error("EMAIL_ALREADY_USED");

  // 1. Générer le token reset password AVANT de changer l'email
  const { token: resetToken, expiresAt: resetExpiresAt } = generateResetToken();
  const resetUrl = `${env.frontendUrl}/auth/reset-password?token=${resetToken}`;

  // 2. Tout mettre à jour en transaction atomique
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { email: newEmail.toLowerCase() },
    }),
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { used: true },
    }),
    prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    }),
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

  // 3. Envoyer l'email reset password sur le NOUVEL email
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

import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from "../../lib/jwt";
import {
  generateVerificationToken,
  generateResetToken,
} from "../../utils/token.utils";
import { addEmailJob, EMAIL_PRIORITY } from "../../queues/email.queue";
import { emailExists, findUserByEmail } from "../../utils/email.utils";
import { env } from "../../config/env.config";

const BCRYPT_ROUNDS = 12;

// Les liens (vérification email, reset) portent un token de 32 octets hex. Refuser tout autre
// format empêche de soumettre un OTP à 6 chiffres d'un autre flux sur ces endpoints (SEC-007).
const LINK_TOKEN_REGEX = /^[a-f0-9]{64}$/;
const assertLinkTokenFormat = (token: unknown) => {
  if (typeof token !== "string" || !LINK_TOKEN_REGEX.test(token)) throw new Error("Token invalide");
};

export const authService = {
  // Vérifier si email disponible
  async isEmailAvailable(email: string): Promise<boolean> {
    return !(await emailExists(email));
  },

  // Vérifier si téléphone disponible
  async isPhoneAvailable(phone: string): Promise<boolean> {
    const existing = await prisma.user.findFirst({ where: { phone } });
    return !existing;
  },

  // Envoyer email de vérification
  async sendVerificationEmail(
    userId: string,
    email: string,
    firstName: string,
    variant: "client" | "prestataire",
  ) {
    const { token, expiresAt } = generateVerificationToken();

    // Sauvegarder le token en base
    await prisma.verificationToken.create({
      data: { userId, token, expiresAt, type: "EMAIL_VERIFICATION" },
    });

    const verificationUrl = `${env.frontendUrl}/auth/verify-email?token=${token}`;

    // Ajouter dans la queue (CRITIQUE = envoi immédiat)
    await addEmailJob(
      {
        type: "verify-email",
        to: email,
        userId,
        payload: { firstName, verificationUrl, variant },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
  },

  // Vérifier le token email
  async verifyEmailToken(token: string) {
    assertLinkTokenFormat(token);

    const record = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    // Un token d'un autre type répond exactement comme un token inexistant (pas d'oracle)
    if (!record || record.type !== "EMAIL_VERIFICATION") throw new Error("Token invalide");
    if (record.expiresAt < new Date()) throw new Error("Token expiré");
    if (record.used) throw new Error("Token déjà utilisé");

    // Consommation atomique : deux clics simultanés ne valident qu'une fois
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.verificationToken.updateMany({
        where: { id: record.id, type: "EMAIL_VERIFICATION", used: false },
        data: { used: true },
      });
      if (count === 0) throw new Error("Token déjà utilisé");
      await tx.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      });
    });

    return record.user;
  },

  // Envoyer email reset password
  async sendResetPasswordEmail(email: string) {
    const user = await findUserByEmail(email);
    if (!user || user.deletedAt) throw new Error("USER_NOT_FOUND");

    const { token, expiresAt } = generateResetToken();

    await prisma.verificationToken.create({
      data: { userId: user.id, token, expiresAt, type: "PASSWORD_RESET" },
    });

    const resetUrl = `${env.frontendUrl}/auth/reset-password?token=${token}`;

    await addEmailJob(
      {
        type: "reset-password",
        to: user.email, // l'adresse du compte, pas la saisie
        userId: user.id,
        payload: { firstName: user.firstName, resetUrl },
      },
      EMAIL_PRIORITY.CRITICAL,
    );
  },

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    assertLinkTokenFormat(token);

    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.type !== "PASSWORD_RESET")
      throw new Error("Token invalide");
    if (record.expiresAt < new Date()) throw new Error("Token expiré");
    if (record.used) throw new Error("Token déjà utilisé");

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Consommation atomique du token : un lien de reset ne sert qu'une fois, même en parallèle
    await prisma.$transaction(async (tx) => {
      const { count } = await tx.verificationToken.updateMany({
        where: { id: record.id, type: "PASSWORD_RESET", used: false },
        data: { used: true },
      });
      if (count === 0) throw new Error("Token déjà utilisé");
      await tx.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      });
      await tx.refreshToken.deleteMany({ where: { userId: record.userId } });
    });
  },

  // Générer les tokens JWT
  generateTokens(
    userId: string,
    email: string,
    role: "CLIENT" | "PRESTATAIRE",
  ) {
    const payload = { userId, email, role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
  },

  // Sauvegarder refresh token
  async saveRefreshToken(userId: string, token: string) {
    await prisma.refreshToken.create({
      data: { token, userId, expiresAt: getRefreshTokenExpiry() },
    });
  },
};

export default authService;

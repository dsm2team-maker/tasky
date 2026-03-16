import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiry } from "../../lib/jwt";
import { generateVerificationToken, generateResetToken } from "../../utils/token.utils";
import { addEmailJob, EMAIL_PRIORITY } from "../../queues/email.queue";
import { env } from "../../config/env.config";

const BCRYPT_ROUNDS = 12;

export const authService = {

  // Vérifier si email disponible
  async isEmailAvailable(email: string): Promise<boolean> {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return !existing;
  },

  // Vérifier si téléphone disponible
  async isPhoneAvailable(phone: string): Promise<boolean> {
    const existing = await prisma.user.findFirst({ where: { phone } });
    return !existing;
  },

  // Envoyer email de vérification
  async sendVerificationEmail(userId: string, email: string, firstName: string, variant: "client" | "prestataire") {
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
      EMAIL_PRIORITY.CRITICAL
    );
  },

  // Vérifier le token email
  async verifyEmailToken(token: string) {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) throw new Error("Token invalide");
    if (record.expiresAt < new Date()) throw new Error("Token expiré");
    if (record.used) throw new Error("Token déjà utilisé");

    // Marquer email comme vérifié
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      prisma.verificationToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    return record.user;
  },

  // Envoyer email reset password
  async sendResetPasswordEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Ne pas révéler si l'email existe

    const { token, expiresAt } = generateResetToken();

    await prisma.verificationToken.create({
      data: { userId: user.id, token, expiresAt, type: "PASSWORD_RESET" },
    });

    const resetUrl = `${env.frontendUrl}/auth/reset-password?token=${token}`;

    await addEmailJob(
      {
        type: "reset-password",
        to: email,
        userId: user.id,
        payload: { firstName: user.firstName, resetUrl },
      },
      EMAIL_PRIORITY.CRITICAL
    );
  },

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.type !== "PASSWORD_RESET") throw new Error("Token invalide");
    if (record.expiresAt < new Date()) throw new Error("Token expiré");
    if (record.used) throw new Error("Token déjà utilisé");

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);
  },

  // Générer les tokens JWT
  generateTokens(userId: string, email: string, role: "CLIENT" | "PRESTATAIRE") {
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

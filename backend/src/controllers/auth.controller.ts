import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from "../lib/jwt";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { authService } from "../modules/auth/auth.service";
import {
  recoverEmailSendOtp,
  recoverEmailVerifyOtp,
} from "../modules/users/user.service";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");

// =============================================
// SCHÉMAS DE VALIDATION ZOD
// =============================================

const registerClientSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (min 8 caractères)"),
  firstName: z.string().min(2, "Prénom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  city: z.string().min(2, "Ville requise"),
  phone: z.string().optional(),
});

const registerPrestataireSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (min 8 caractères)"),
  firstName: z.string().min(2, "Prénom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  city: z.string().min(2, "Ville requise"),
  phone: z.string().min(10, "Téléphone invalide"),
  competences: z
    .array(z.string())
    .min(1, "Au moins une compétence requise")
    .max(3, "Maximum 3 compétences"),
  cguAccepted: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les CGU",
  }),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// =============================================
// INSCRIPTION CLIENT
// =============================================

export const registerClient = async (req: Request, res: Response) => {
  try {
    const validation = registerClientSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password, firstName, lastName, city, phone } =
      validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cet email",
      });
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Un compte existe déjà avec ce numéro de téléphone",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "CLIENT",
          firstName,
          lastName,
          city,
          phone,
        },
      });
      await tx.client.create({ data: { userId: newUser.id } });
      return newUser;
    });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as "CLIENT",
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });
    await authService.sendVerificationEmail(
      user.id,
      user.email,
      user.firstName,
      "client",
    );

    return res.status(201).json({
      success: true,
      message: "Compte client créé avec succès",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          phone: user.phone,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    console.error("Erreur registerClient:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
    });
  }
};

// =============================================
// INSCRIPTION PRESTATAIRE
// =============================================

export const registerPrestataire = async (req: Request, res: Response) => {
  try {
    const validation = registerPrestataireSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password, firstName, lastName, city, phone, competences } =
      validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cet email",
      });
    }

    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Un compte existe déjà avec ce numéro de téléphone",
        });
      }
    }

    const categories = await prisma.category.findMany({
      where: { id: { in: competences } },
    });
    if (categories.length !== competences.length) {
      return res.status(400).json({
        success: false,
        message: "Une ou plusieurs catégories sont invalides",
      });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "PRESTATAIRE",
          firstName,
          lastName,
          city,
          phone,
        },
      });

      const prestataire = await tx.prestataire.create({
        data: {
          userId: newUser.id,
          cguAcceptedAt: new Date(),
        },
      });

      await tx.competence.createMany({
        data: competences.map((categoryId) => ({
          prestataireId: prestataire.id,
          categoryId,
        })),
      });

      return newUser;
    });

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as "PRESTATAIRE",
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });
    await authService.sendVerificationEmail(
      user.id,
      user.email,
      user.firstName,
      "prestataire",
    );
    return res.status(201).json({
      success: true,
      message: "Compte prestataire créé avec succès",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          phone: user.phone,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    console.error("Erreur registerPrestataire:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'inscription",
    });
  }
};

// =============================================
// CONNEXION
// =============================================

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Aucun compte trouve avec cet email.",
        code: "USER_NOT_FOUND",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Votre compte a ete desactive. Contactez le support.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect.",
        code: "WRONG_PASSWORD",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Veuillez vérifier votre email avant de vous connecter.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as "CLIENT" | "PRESTATAIRE" | "ADMIN",
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          city: user.city,
          phone: user.phone,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        tokens: { accessToken, refreshToken },
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erreur serveur lors de la connexion" });
  }
};

// =============================================
// MON PROFIL
// =============================================

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        prestataire: {
          include: {
            competences: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        phone: user.phone,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        profile: user.client || user.prestataire,
      },
    });
  } catch (error) {
    console.error("Erreur getMe:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// DÉCONNEXION
// =============================================

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return res
      .status(200)
      .json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur logout:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la déconnexion",
    });
  }
};

// =============================================
// REFRESH TOKEN
// =============================================

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token manquant" });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token invalide ou expiré" });
    }

    try {
      verifyRefreshToken(token);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token invalide" });
    }

    const user = storedToken.user;
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role as "CLIENT" | "PRESTATAIRE" | "ADMIN",
    };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token } }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: user.id,
          expiresAt: getRefreshTokenExpiry(),
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      },
    });
  } catch (error) {
    console.error("Erreur refreshToken:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// VÉRIFICATION EMAIL DISPONIBLE
// =============================================

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query as { email: string };
    if (!email)
      return res.status(400).json({ success: false, message: "Email requis" });

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return res.status(200).json({ success: true, available: !existing });
  } catch (error) {
    console.error("Erreur checkEmail:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// VÉRIFICATION TÉLÉPHONE DISPONIBLE
// =============================================

export const checkPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query as { phone: string };
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Téléphone requis" });

    const existing = await prisma.user.findFirst({ where: { phone } });
    return res.status(200).json({ success: true, available: !existing });
  } catch (error) {
    console.error("Erreur checkPhone:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// VERIFICATION EMAIL
// =============================================

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query as { token: string };
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Token manquant" });
    await authService.verifyEmailToken(token);
    return res
      .status(200)
      .json({ success: true, message: "Email verifie avec succes !" });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Token invalide ou expire",
    });
  }
};

// =============================================
// RENVOYER EMAIL DE VERIFICATION
// =============================================

export const resendVerificationEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(200).json({
        success: true,
        message: "Si ce compte existe, un email a ete envoye.",
      });
    if (user.emailVerified)
      return res
        .status(400)
        .json({ success: false, message: "Cet email est deja verifie." });
    await authService.sendVerificationEmail(
      user.id,
      user.email,
      user.firstName,
      user.role === "PRESTATAIRE" ? "prestataire" : "client",
    );
    return res
      .status(200)
      .json({ success: true, message: "Email de verification renvoye." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// MOT DE PASSE OUBLIE
// =============================================

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email requis" });
    await authService.sendResetPasswordEmail(email);
    return res.status(200).json({
      success: true,
      message: "Si ce compte existe, un email a ete envoye.",
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Aucun compte trouvé avec cette adresse email.",
      });
    }
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// RESET MOT DE PASSE
// =============================================

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res
        .status(400)
        .json({ success: false, message: "Donnees invalides" });
    await authService.resetPassword(token, password);
    return res.status(200).json({
      success: true,
      message: "Mot de passe reinitialise avec succes.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Token invalide ou expire",
    });
  }
};

// =============================================
// RECOVER EMAIL — ÉTAPE 1
// POST /api/auth/recover-email/send-otp
// =============================================
export const recoverEmailSendOtpHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res
        .status(400)
        .json({ success: false, message: "Email invalide" });
    }
    const result = await recoverEmailSendOtp(email.toLowerCase().trim());
    return res.json({ success: true, message: "Code envoyé.", data: result });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Aucun compte trouvé avec cette adresse email.",
      });
    }
    if (error.message === "NO_PHONE") {
      return res.status(400).json({
        success: false,
        message:
          "Aucun numéro de téléphone associé à ce compte. Contactez le support.",
      });
    }
    if (error.message?.startsWith("COOLDOWN:")) {
      const seconds = error.message.split(":")[1];
      return res.status(429).json({
        success: false,
        message: `Veuillez attendre ${seconds} secondes`,
      });
    }
    console.error("Erreur recoverEmailSendOtp:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// RECOVER EMAIL — ÉTAPE 2
// POST /api/auth/recover-email/verify-otp
// =============================================
export const recoverEmailVerifyOtpHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, otp, newEmail } = req.body;
    if (!email || !otp || !newEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Données manquantes" });
    }
    const result = await recoverEmailVerifyOtp(
      email.toLowerCase().trim(),
      otp,
      newEmail.toLowerCase().trim(),
    );
    return res.json({
      success: true,
      message:
        "Email mis à jour. Un lien de connexion a été envoyé sur votre nouvelle adresse.",
      data: result,
    });
  } catch (error: any) {
    if (error.message === "SAME_EMAIL") {
      return res.status(400).json({
        success: false,
        message: "C'est déjà votre adresse email actuelle",
      });
    }
    if (error.message === "EMAIL_ALREADY_USED") {
      return res.status(409).json({
        success: false,
        message: "Cette adresse est déjà associée à un compte",
      });
    }
    if (error.message === "OTP_EXPIRED_OR_NOT_FOUND") {
      return res.status(400).json({
        success: false,
        message: "Code expiré ou introuvable — recommencez",
      });
    }
    if (error.message === "OTP_MAX_ATTEMPTS") {
      return res.status(429).json({
        success: false,
        message: "Trop de tentatives — réessayez dans 30 minutes",
      });
    }
    if (error.message?.startsWith("OTP_INVALID:")) {
      const remaining = error.message.split(":")[1];
      return res.status(400).json({
        success: false,
        message: `Code incorrect — ${remaining} tentative(s) restante(s)`,
      });
    }
    console.error("Erreur recoverEmailVerifyOtp:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

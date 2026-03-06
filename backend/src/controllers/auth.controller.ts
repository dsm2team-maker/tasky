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

const registerArtisanSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (min 8 caractères)"),
  firstName: z.string().min(2, "Prénom trop court"),
  lastName: z.string().min(2, "Nom trop court"),
  city: z.string().min(2, "Ville requise"),
  phone: z.string().min(10, "Téléphone invalide"),
  // Step 2 - compétences
  competences: z
    .array(z.string())
    .min(1, "Au moins une compétence requise")
    .max(3, "Maximum 3 compétences"),
  // Step 4 - CGU
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
    // Validation
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

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cet email",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Créer l'utilisateur + profil client en transaction
    const user = await prisma.$transaction(async (tx) => {
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

      await tx.client.create({
        data: { userId: newUser.id },
      });

      return newUser;
    });

    // Générer les tokens
    const payload = { userId: user.id, email: user.email, role: user.role as "CLIENT" };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

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
// INSCRIPTION ARTISAN
// =============================================

export const registerArtisan = async (req: Request, res: Response) => {
  try {
    // Validation
    const validation = registerArtisanSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password, firstName, lastName, city, phone, competences } =
      validation.data;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un compte existe déjà avec cet email",
      });
    }

    // Vérifier que les catégories existent
    const categories = await prisma.category.findMany({
      where: { id: { in: competences } },
    });
    if (categories.length !== competences.length) {
      return res.status(400).json({
        success: false,
        message: "Une ou plusieurs catégories sont invalides",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Créer l'utilisateur + profil artisan + compétences en transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "ARTISAN",
          firstName,
          lastName,
          city,
          phone,
        },
      });

      const artisan = await tx.artisan.create({
        data: {
          userId: newUser.id,
          cguAcceptedAt: new Date(),
        },
      });

      // Créer les compétences
      await tx.competence.createMany({
        data: competences.map((categoryId) => ({
          artisanId: artisan.id,
          categoryId,
        })),
      });

      return newUser;
    });

    // Générer les tokens
    const payload = { userId: user.id, email: user.email, role: user.role as "ARTISAN" };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Sauvegarder le refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Compte artisan créé avec succès",
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
    console.error("Erreur registerArtisan:", error);
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
    // Validation
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Données invalides",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Votre compte a été désactivé. Contactez le support.",
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    // Générer les tokens
    const payload = { userId: user.id, email: user.email, role: user.role as "CLIENT" | "ARTISAN" | "ADMIN" };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Sauvegarder le refresh token
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
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la connexion",
    });
  }
};

// =============================================
// MON PROFIL (utilisateur connecté)
// =============================================

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
        artisan: {
          include: {
            competences: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
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
        profile: user.client || user.artisan,
      },
    });
  } catch (error) {
    console.error("Erreur getMe:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

// =============================================
// DÉCONNEXION
// =============================================

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Supprimer le refresh token de la DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie",
    });
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
      return res.status(401).json({
        success: false,
        message: "Refresh token manquant",
      });
    }

    // Vérifier le token en DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Refresh token invalide ou expiré",
      });
    }

    // Vérifier la signature JWT
    try {
      verifyRefreshToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Refresh token invalide",
      });
    }

    const user = storedToken.user;

    // Générer un nouveau access token
    const payload = { userId: user.id, email: user.email, role: user.role as "CLIENT" | "ARTISAN" | "ADMIN" };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Remplacer l'ancien refresh token
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
        tokens: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      },
    });
  } catch (error) {
    console.error("Erreur refreshToken:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from "../lib/jwt";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import { authService } from "../modules/auth/auth.service";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12");

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
  competences: z.array(z.string()).max(3, "Maximum 3 compétences"),
  cguAccepted: z.boolean().refine((val) => val === true, { message: "Vous devez accepter les CGU" }),
});

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// ─── Inscription client ───────────────────────────────────────────────────────

export const registerClient = async (req: Request, res: Response) => {
  try {
    const validation = registerClientSchema.safeParse(req.body);
    if (!validation.success)
      return res.status(400).json({ success: false, message: "Données invalides", errors: validation.error.flatten().fieldErrors });

    const { email, password, firstName, lastName, city, phone } = validation.data;

    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(409).json({ success: false, message: "Un compte existe déjà avec cet email" });

    if (phone && await prisma.user.findFirst({ where: { phone } }))
      return res.status(409).json({ success: false, message: "Un compte existe déjà avec ce numéro de téléphone" });

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.$transaction(async (tx: any) => {
      const u = await tx.user.create({ data: { email, password: hashedPassword, role: "CLIENT", firstName, lastName, city, phone } });
      await tx.client.create({ data: { userId: u.id } });
      return u;
    });

    const payload = { userId: user.id, email: user.email, role: user.role as "CLIENT" };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() } });
    await authService.sendVerificationEmail(user.id, user.email, user.firstName, "client");

    return res.status(201).json({
      success: true, message: "Compte client créé avec succès",
      data: { user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, city: user.city, phone: user.phone, emailVerified: user.emailVerified, createdAt: user.createdAt }, tokens: { accessToken, refreshToken } },
    });
  } catch (error) {
    console.error("Erreur registerClient:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de l'inscription" });
  }
};

// ─── Inscription prestataire ──────────────────────────────────────────────────

export const registerPrestataire = async (req: Request, res: Response) => {
  try {
    const validation = registerPrestataireSchema.safeParse(req.body);
    if (!validation.success)
      return res.status(400).json({ success: false, message: "Données invalides", errors: validation.error.flatten().fieldErrors });

    const { email, password, firstName, lastName, city, phone, competences } = validation.data;

    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(409).json({ success: false, message: "Un compte existe déjà avec cet email" });

    if (phone && await prisma.user.findFirst({ where: { phone } }))
      return res.status(409).json({ success: false, message: "Un compte existe déjà avec ce numéro de téléphone" });

    if (competences.length > 0) {
      const categories = await prisma.category.findMany({ where: { id: { in: competences } } });
      if (categories.length !== competences.length)
        return res.status(400).json({ success: false, message: "Une ou plusieurs catégories sont invalides" });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.$transaction(async (tx: any) => {
      const u = await tx.user.create({ data: { email, password: hashedPassword, role: "PRESTATAIRE", firstName, lastName, city, phone } });
      const prestataire = await tx.prestataire.create({ data: { userId: u.id } });
      await tx.competence.createMany({ data: competences.map((categoryId) => ({ prestataireId: prestataire.id, categoryId })) });
      return u;
    });

    const payload = { userId: user.id, email: user.email, role: user.role as "PRESTATAIRE" };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() } });
    await authService.sendVerificationEmail(user.id, user.email, user.firstName, "prestataire");

    return res.status(201).json({
      success: true, message: "Compte prestataire créé avec succès",
      data: { user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, city: user.city, phone: user.phone, emailVerified: user.emailVerified, createdAt: user.createdAt }, tokens: { accessToken, refreshToken } },
    });
  } catch (error) {
    console.error("Erreur registerPrestataire:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de l'inscription" });
  }
};

// ─── Connexion ────────────────────────────────────────────────────────────────

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success)
      return res.status(400).json({ success: false, message: "Données invalides", errors: validation.error.flatten().fieldErrors });

    const { email, password } = validation.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)             return res.status(404).json({ success: false, message: "Aucun compte trouvé avec cet email.", code: "USER_NOT_FOUND" });
    if (!user.isActive)    return res.status(403).json({ success: false, message: "Votre compte a été désactivé. Contactez le support." });
    if (!await bcrypt.compare(password, user.password))
                           return res.status(401).json({ success: false, message: "Mot de passe incorrect.", code: "WRONG_PASSWORD" });
    if (!user.emailVerified) return res.status(403).json({ success: false, message: "Veuillez vérifier votre email avant de vous connecter.", code: "EMAIL_NOT_VERIFIED" });

    const payload = { userId: user.id, email: user.email, role: user.role as "CLIENT" | "PRESTATAIRE" | "ADMIN" };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() } });

    return res.status(200).json({
      success: true, message: "Connexion réussie",
      data: { user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, city: user.city, phone: user.phone, avatar: user.avatar, emailVerified: user.emailVerified, createdAt: user.createdAt }, tokens: { accessToken, refreshToken } },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la connexion" });
  }
};

// ─── Profil courant ───────────────────────────────────────────────────────────

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: { client: true, prestataire: { include: { competences: { include: { category: true } } } } },
    });
    if (!user) return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });

    return res.status(200).json({
      success: true,
      data: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, city: user.city, phone: user.phone, avatar: user.avatar, emailVerified: user.emailVerified, createdAt: user.createdAt, profile: user.client || user.prestataire },
    });
  } catch (error) {
    console.error("Erreur getMe:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Déconnexion ──────────────────────────────────────────────────────────────

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    return res.status(200).json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur logout:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la déconnexion" });
  }
};

// ─── Refresh token ────────────────────────────────────────────────────────────

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return res.status(401).json({ success: false, message: "Refresh token manquant" });

    const storedToken = await prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
    if (!storedToken || storedToken.expiresAt < new Date())
      return res.status(401).json({ success: false, message: "Refresh token invalide ou expiré" });

    try { verifyRefreshToken(token); } catch {
      return res.status(401).json({ success: false, message: "Refresh token invalide" });
    }

    const user = storedToken.user;
    const payload = { userId: user.id, email: user.email, role: user.role as "CLIENT" | "PRESTATAIRE" | "ADMIN" };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token } }),
      prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt: getRefreshTokenExpiry() } }),
    ]);

    return res.status(200).json({ success: true, data: { tokens: { accessToken: newAccessToken, refreshToken: newRefreshToken } } });
  } catch (error) {
    console.error("Erreur refreshToken:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// ─── Checks disponibilité ─────────────────────────────────────────────────────

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query as { email: string };
    if (!email) return res.status(400).json({ success: false, message: "Email requis" });
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return res.status(200).json({ success: true, available: !existing });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const checkPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query as { phone: string };
    if (!phone) return res.status(400).json({ success: false, message: "Téléphone requis" });
    const existing = await prisma.user.findFirst({ where: { phone } });
    return res.status(200).json({ success: true, available: !existing });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

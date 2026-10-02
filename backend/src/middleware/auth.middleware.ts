import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../lib/jwt";
import { prisma } from "../lib/prisma";

// Étendre le type Request pour inclure l'utilisateur
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Middleware de vérification du token JWT.
// Le JWT seul ne suffit pas : le compte est relu en base à chaque requête pour qu'une
// suspension, une suppression ou un changement de rôle prenne effet immédiatement (SEC-005).
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token d'authentification manquant",
    });
  }

  const token = authHeader.split(" ")[1];

  let decoded: JwtPayload;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token invalide ou expiré",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true, deletedAt: true },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ success: false, message: "Compte introuvable" });
    }
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Votre compte a été désactivé. Contactez le support.",
      });
    }

    // Rôle et email issus de la base, jamais du token
    req.user = { userId: user.id, email: user.email, role: user.role as JwtPayload["role"] };
    next();
  } catch (error) {
    console.error("[auth] lecture utilisateur:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// Middleware pour vérifier le rôle
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé - permissions insuffisantes",
      });
    }

    next();
  };
};

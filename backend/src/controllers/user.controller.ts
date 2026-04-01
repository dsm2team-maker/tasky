import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { supabase, AVATAR_BUCKET } from "../config/supabase.config";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getProfile,
  updateProfile,
  requestPhoneChange,
  verifyPhoneOtp,
  requestEmailChange,
  verifyEmailOtp,
  updatePrestataireProfile,
  getPrestataireCompetences,
  updatePrestataireCompetences,
  getPrestataireStats,
} from "../modules/users/user.service";

// =============================================
// UPLOAD AVATAR
// POST /api/users/avatar
// Body: { imageData: "data:image/jpeg;base64,..." }
// =============================================
export const uploadAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { imageData } = req.body;

    if (!imageData) {
      return res.status(400).json({ success: false, message: "Image requise" });
    }

    const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches) {
      return res
        .status(400)
        .json({ success: false, message: "Format d'image invalide" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > 5 * 1024 * 1024) {
      return res
        .status(400)
        .json({ success: false, message: "L'image ne doit pas dépasser 5 Mo" });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(mimeType)) {
      return res
        .status(400)
        .json({ success: false, message: "Format accepté : JPG, PNG ou WEBP" });
    }

    const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
    const fileName = `${userId}-${Date.now()}.${ext}`;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (existingUser?.avatar) {
      const oldFileName = existingUser.avatar.split("/").pop();
      if (oldFileName) {
        await supabase.storage.from(AVATAR_BUCKET).remove([oldFileName]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, buffer, { contentType: mimeType, upsert: true });

    if (uploadError) {
      console.error("Erreur upload Supabase:", uploadError);
      return res
        .status(500)
        .json({ success: false, message: "Erreur lors de l'upload" });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName);

    await prisma.user.update({
      where: { id: userId },
      data: { avatar: publicUrl },
    });

    return res.status(200).json({
      success: true,
      message: "Avatar mis à jour avec succès",
      data: { avatarUrl: publicUrl },
    });
  } catch (error) {
    console.error("Erreur uploadAvatar:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// GET /api/users/profile
// =============================================
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const profile = await getProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur introuvable" });
    }
    console.error("Erreur getMyProfile:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// PATCH /api/users/profile
// Modifier firstName, lastName, city
// =============================================
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { firstName, lastName, city } = req.body;

    if (
      firstName !== undefined &&
      (typeof firstName !== "string" || firstName.trim().length < 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "Prénom invalide (minimum 2 caractères)",
      });
    }
    if (
      lastName !== undefined &&
      (typeof lastName !== "string" || lastName.trim().length < 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "Nom invalide (minimum 2 caractères)",
      });
    }
    if (
      city !== undefined &&
      city !== null &&
      (typeof city !== "string" || city.trim().length < 2)
    ) {
      return res.status(400).json({
        success: false,
        message: "Ville invalide (minimum 2 caractères)",
      });
    }

    const updated = await updateProfile(userId, { firstName, lastName, city });
    return res.json({
      success: true,
      message: "Profil mis à jour",
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur introuvable" });
    }
    console.error("Erreur updateMyProfile:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// POST /api/users/profile/request-phone-change
// =============================================
export const requestPhoneChangeHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { newPhone } = req.body;

    if (!newPhone || !/^0[67]\d{8}$/.test(newPhone.replace(/\s/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Numéro invalide — format 06 ou 07 attendu",
      });
    }

    await requestPhoneChange(userId, newPhone.replace(/\s/g, ""));
    return res.json({
      success: true,
      message: "Un code de vérification a été envoyé par email.",
    });
  } catch (error: any) {
    if (error.message === "SAME_PHONE")
      return res
        .status(400)
        .json({ success: false, message: "C'est déjà votre numéro actuel" });
    if (error.message === "PHONE_ALREADY_USED")
      return res.status(409).json({
        success: false,
        message: "Ce numéro est déjà associé à un compte",
      });
    if (error.message?.startsWith("COOLDOWN:")) {
      const seconds = error.message.split(":")[1];
      return res.status(429).json({
        success: false,
        message: `Veuillez attendre ${seconds} secondes avant de réessayer`,
      });
    }
    console.error("Erreur requestPhoneChange:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// POST /api/users/profile/verify-phone-otp
// =============================================
export const verifyPhoneOtpHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { otp } = req.body;

    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Code invalide — 6 chiffres attendus",
      });
    }

    await verifyPhoneOtp(userId, otp);
    return res.json({
      success: true,
      message: "Téléphone mis à jour. Veuillez vous reconnecter.",
    });
  } catch (error: any) {
    if (error.message === "OTP_EXPIRED_OR_NOT_FOUND")
      return res.status(400).json({
        success: false,
        message: "Code expiré ou introuvable — recommencez",
      });
    if (error.message === "OTP_MAX_ATTEMPTS")
      return res.status(429).json({
        success: false,
        message: "Trop de tentatives — réessayez dans 30 minutes",
      });
    if (error.message?.startsWith("OTP_INVALID:")) {
      const remaining = error.message.split(":")[1];
      return res.status(400).json({
        success: false,
        message: `Code incorrect — ${remaining} tentative(s) restante(s)`,
      });
    }
    if (error.message === "PHONE_ALREADY_USED")
      return res.status(409).json({
        success: false,
        message: "Ce numéro vient d'être pris par un autre compte",
      });
    console.error("Erreur verifyPhoneOtp:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// POST /api/users/profile/request-email-change
// =============================================
export const requestEmailChangeHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { newEmail } = req.body;

    if (!newEmail || typeof newEmail !== "string" || !newEmail.includes("@")) {
      return res
        .status(400)
        .json({ success: false, message: "Email invalide" });
    }

    await requestEmailChange(userId, newEmail.toLowerCase().trim());
    return res.json({
      success: true,
      message:
        "Un code de vérification a été envoyé sur votre nouvelle adresse email.",
    });
  } catch (error: any) {
    if (error.message === "SAME_EMAIL")
      return res.status(400).json({
        success: false,
        message: "C'est déjà votre adresse email actuelle",
      });
    if (error.message === "EMAIL_ALREADY_USED")
      return res.status(409).json({
        success: false,
        message: "Cette adresse est déjà associée à un compte",
      });
    if (error.message?.startsWith("COOLDOWN:")) {
      const seconds = error.message.split(":")[1];
      return res.status(429).json({
        success: false,
        message: `Veuillez attendre ${seconds} secondes avant de réessayer`,
      });
    }
    console.error("Erreur requestEmailChange:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// POST /api/users/profile/verify-email-otp
// =============================================
export const verifyEmailOtpHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { otp } = req.body;

    if (!otp || typeof otp !== "string" || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Code invalide — 6 chiffres attendus",
      });
    }

    await verifyEmailOtp(userId, otp);
    return res.json({
      success: true,
      message: "Email mis à jour. Veuillez vous reconnecter.",
    });
  } catch (error: any) {
    if (error.message === "OTP_EXPIRED_OR_NOT_FOUND")
      return res.status(400).json({
        success: false,
        message: "Code expiré ou introuvable — recommencez",
      });
    if (error.message === "OTP_MAX_ATTEMPTS")
      return res.status(429).json({
        success: false,
        message: "Trop de tentatives — réessayez dans 30 minutes",
      });
    if (error.message?.startsWith("OTP_INVALID:")) {
      const remaining = error.message.split(":")[1];
      return res.status(400).json({
        success: false,
        message: `Code incorrect — ${remaining} tentative(s) restante(s)`,
      });
    }
    if (error.message === "EMAIL_ALREADY_USED")
      return res.status(409).json({
        success: false,
        message: "Cette adresse vient d'être prise par un autre compte",
      });
    console.error("Erreur verifyEmailOtp:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// PATCH /api/users/prestataire
// Modifier bio, disponibilite, pointDepot
// =============================================
export const updatePrestataireProfileHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const {
      bio,
      disponibilite,
      pointDepotAdresse,
      pointDepotVille,
      pointDepotCodePostal,
      pointDepotLat,
      pointDepotLng,
      pointDepotInstructions,
    } = req.body;

    // Validation bio
    if (bio !== undefined) {
      if (typeof bio !== "string" || bio.trim().length < 100) {
        return res.status(400).json({
          success: false,
          message: "La bio doit faire au moins 100 caractères",
        });
      }
      if (bio.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: "La bio ne peut pas dépasser 500 caractères",
        });
      }
    }

    // Validation disponibilite
    if (
      disponibilite !== undefined &&
      !["ACTIF", "OCCUPE", "ABSENT"].includes(disponibilite)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Disponibilité invalide" });
    }

    // Validation instructions
    if (
      pointDepotInstructions !== undefined &&
      pointDepotInstructions.length > 300
    ) {
      return res.status(400).json({
        success: false,
        message: "Les instructions ne peuvent pas dépasser 300 caractères",
      });
    }

    const updated = await updatePrestataireProfile(userId, {
      bio: bio?.trim(),
      disponibilite,
      pointDepotAdresse,
      pointDepotVille,
      pointDepotCodePostal,
      pointDepotLat,
      pointDepotLng,
      pointDepotInstructions,
    });

    return res.json({
      success: true,
      message: "Profil mis à jour",
      data: updated,
    });
  } catch (error: any) {
    if (error.message === "PRESTATAIRE_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Prestataire introuvable" });
    }
    console.error("Erreur updatePrestataireProfile:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// GET /api/users/prestataire/competences
// =============================================
export const getPrestataireCompetencesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const competences = await getPrestataireCompetences(userId);
    return res.json({ success: true, data: competences });
  } catch (error: any) {
    if (error.message === "PRESTATAIRE_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Prestataire introuvable" });
    }
    console.error("Erreur getPrestataireCompetences:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// PUT /api/users/prestataire/competences
// =============================================
export const updatePrestataireCompetencesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { competences: competencesInput } = req.body;

    if (!Array.isArray(competencesInput) || competencesInput.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Sélectionnez au moins une compétence",
      });
    }

    const competences = await updatePrestataireCompetences(
      userId,
      competencesInput,
    );
    return res.json({
      success: true,
      message: "Compétences mises à jour",
      data: competences,
    });
  } catch (error: any) {
    if (error.message === "PRESTATAIRE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Prestataire introuvable" });
    if (error.message?.startsWith("MAX_CATEGORIES:")) {
      const max = error.message.split(":")[1];
      return res.status(400).json({
        success: false,
        message: `Maximum ${max} catégories autorisées`,
      });
    }
    if (error.message === "INVALID_CATEGORY")
      return res
        .status(400)
        .json({ success: false, message: "Catégorie invalide" });
    console.error("Erreur updatePrestataireCompetences:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// GET /api/users/prestataire/stats
// =============================================
export const getPrestataireStatsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const stats = await getPrestataireStats(userId);
    return res.json({ success: true, data: stats });
  } catch (error: any) {
    if (error.message === "PRESTATAIRE_NOT_FOUND") {
      return res
        .status(404)
        .json({ success: false, message: "Prestataire introuvable" });
    }
    console.error("Erreur getPrestataireStats:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createDemande,
  getMyDemandes,
  getDemande,
  deleteDemande,
} from "../modules/demandes/demande.service";

// =============================================================================
// CREATE DEMANDE
// =============================================================================
export const createDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const {
      titre,
      description,
      typePrestation,
      categoryId,
      subCategoryId,
      interventionId,
      budget,
      ville,
      photos,
      dateEcheance,
      urgence,
      interventionIds,
    } = req.body;

    if (!titre || titre.trim().length < 5)
      return res.status(400).json({
        success: false,
        message: "Titre trop court (min 5 caractères)",
      });

    if (!description || description.trim().length < 20)
      return res.status(400).json({
        success: false,
        message: "Description trop courte (min 20 caractères)",
      });

    if (
      !typePrestation ||
      !["MODIFICATION", "CREATION", "FORMATION"].includes(typePrestation)
    )
      return res
        .status(400)
        .json({ success: false, message: "Type de prestation invalide" });

    if (!categoryId)
      return res
        .status(400)
        .json({ success: false, message: "Catégorie requise" });

    if (photos && photos.length > 2)
      return res
        .status(400)
        .json({ success: false, message: "Maximum 2 photos" });

    const demande = await createDemande(userId, {
      titre: titre.trim(),
      description: description.trim(),
      typePrestation,
      categoryId,
      subCategoryId,
      interventionIds,
      budget: budget ? parseFloat(budget) : undefined,
      ville,
      photos: photos || [],
      dateEcheance,
      urgence: urgence || "NORMAL",
    });

    return res.status(201).json({
      success: true,
      message: "Demande créée avec succès",
      data: demande,
    });
  } catch (error: any) {
    if (error.message === "CLIENT_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Profil client introuvable" });
    if (error.message === "CATEGORY_NOT_FOUND")
      return res
        .status(400)
        .json({ success: false, message: "Catégorie invalide" });
    console.error("Erreur createDemande:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// GET MY DEMANDES
// =============================================================================
export const getMyDemandesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const demandes = await getMyDemandes(userId);
    return res.json({ success: true, data: demandes });
  } catch (error: any) {
    console.error("Erreur getMyDemandes:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// GET DEMANDE
// =============================================================================
export const getDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { id } = req.params;
    const demande = await getDemande(userId, id);
    return res.json({ success: true, data: demande });
  } catch (error: any) {
    if (error.message === "DEMANDE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Demande introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    console.error("Erreur getDemande:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// DELETE DEMANDE
// =============================================================================
export const deleteDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { id } = req.params;
    await deleteDemande(userId, id);
    return res.json({ success: true, message: "Demande supprimée" });
  } catch (error: any) {
    if (error.message === "DEMANDE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Demande introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    if (error.message === "DEMANDE_EN_COURS")
      return res.status(400).json({
        success: false,
        message: "Impossible de supprimer une demande en cours",
      });
    console.error("Erreur deleteDemande:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

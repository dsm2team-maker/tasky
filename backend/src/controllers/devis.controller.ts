import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getDemandesDisponibles,
  getDemandeDetail,
  envoyerDevis,
  getDevisDemande,
  accepterDevis,
  refuserDevis,
} from "../modules/devis/devis.service";

// =============================================================================
// GET /api/demandes/available — Demandes disponibles pour prestataire
// =============================================================================
export const getDemandesDisponiblesHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const demandes = await getDemandesDisponibles(userId);
    return res.json({ success: true, data: demandes });
  } catch (error: any) {
    if (error.message === "PRESTATAIRE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Profil prestataire introuvable" });
    if (error.message === "PRESTATAIRE_INACTIF")
      return res.status(403).json({
        success: false,
        message: "Votre profil doit être actif pour voir les demandes",
      });
    console.error("Erreur getDemandesDisponibles:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// GET /api/demandes/:id/detail — Détail demande pour prestataire
// =============================================================================
export const getDemandeDetailHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const demande = await getDemandeDetail(userId, req.params.id);
    return res.json({ success: true, data: demande });
  } catch (error: any) {
    if (error.message === "DEMANDE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Demande introuvable" });
    console.error("Erreur getDemandeDetail:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// POST /api/demandes/:id/devis — Envoyer un devis
// =============================================================================
export const envoyerDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { montant, delai, description } = req.body;

    if (!montant || isNaN(parseFloat(montant)) || parseFloat(montant) <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Montant invalide" });
    if (!delai || isNaN(parseInt(delai)) || parseInt(delai) <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Délai invalide" });
    if (!description || description.trim().length < 20)
      return res.status(400).json({
        success: false,
        message: "Description trop courte (min 20 caractères)",
      });

    const devis = await envoyerDevis(userId, req.params.id, {
      montant: parseFloat(montant),
      delai: parseInt(delai),
      description: description.trim(),
    });

    return res
      .status(201)
      .json({ success: true, message: "Devis envoyé", data: devis });
  } catch (error: any) {
    if (error.message === "DEMANDE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Demande introuvable" });
    if (error.message === "DEMANDE_NON_DISPONIBLE")
      return res.status(400).json({
        success: false,
        message: "Cette demande n'est plus disponible",
      });
    if (error.message === "DEVIS_DEJA_ENVOYE")
      return res.status(409).json({
        success: false,
        message: "Vous avez déjà envoyé un devis pour cette demande",
      });
    if (error.message === "PRESTATAIRE_INACTIF")
      return res
        .status(403)
        .json({ success: false, message: "Votre profil doit être actif" });
    console.error("Erreur envoyerDevis:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// GET /api/demandes/:id/devis — Devis d'une demande (client)
// =============================================================================
export const getDevisDemandeHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const result = await getDevisDemande(userId, req.params.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === "DEMANDE_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Demande introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    console.error("Erreur getDevisDemande:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// PATCH /api/devis/:id/accept — Accepter un devis
// =============================================================================
export const accepterDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    await accepterDevis(userId, req.params.id);
    return res.json({
      success: true,
      message: "Devis accepté — prestation créée",
    });
  } catch (error: any) {
    if (error.message === "DEVIS_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Devis introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    if (error.message === "DEVIS_NON_DISPONIBLE")
      return res
        .status(400)
        .json({ success: false, message: "Ce devis n'est plus disponible" });
    console.error("Erreur accepterDevis:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================================================
// PATCH /api/devis/:id/refuse — Refuser un devis
// =============================================================================
export const refuserDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    await refuserDevis(userId, req.params.id);
    return res.json({ success: true, message: "Devis refusé" });
  } catch (error: any) {
    if (error.message === "DEVIS_NOT_FOUND")
      return res
        .status(404)
        .json({ success: false, message: "Devis introuvable" });
    if (error.message === "FORBIDDEN")
      return res.status(403).json({ success: false, message: "Accès refusé" });
    console.error("Erreur refuserDevis:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

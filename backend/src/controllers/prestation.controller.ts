import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getMesPrestations,
  getPrestationDetail,
  creerEtatDesLieux,
  validerEtatDesLieux,
  marquerTermine,
  validerPrestation,
  contesterPrestation,
  getMesPrestationsClient,
} from "../modules/prestations/prestation.service";

const handleError = (res: Response, error: any) => {
  const errorMap: Record<string, [number, string]> = {
    PRESTATAIRE_NOT_FOUND: [404, "Prestataire introuvable"],
    CLIENT_NOT_FOUND: [404, "Client introuvable"],
    PRESTATION_NOT_FOUND: [404, "Prestation introuvable"],
    FORBIDDEN: [403, "Accès refusé"],
    PRESTATION_NOT_EN_COURS: [400, "La prestation n'est pas en cours"],
    PRESTATION_NOT_A_VALIDER: [400, "La prestation n'est pas à valider"],
    ETAT_DES_LIEUX_REQUIRED: [
      400,
      "L'état des lieux est requis avant de marquer comme terminé",
    ],
    ETAT_DES_LIEUX_NOT_VALIDATED: [
      400,
      "L'état des lieux doit être validé par le client",
    ],
    ETAT_DES_LIEUX_ALREADY_EXISTS: [409, "Un état des lieux existe déjà"],
    ETAT_DES_LIEUX_NOT_FOUND: [404, "État des lieux introuvable"],
    ETAT_DES_LIEUX_ALREADY_PROCESSED: [
      400,
      "L'état des lieux a déjà été traité",
    ],
    NOT_MODIFICATION: [
      400,
      "L'état des lieux n'est disponible que pour les modifications",
    ],
  };

  const [status, message] = errorMap[error.message] || [500, "Erreur serveur"];
  if (status === 500) console.error("Erreur prestation:", error);
  return res.status(status).json({ success: false, message });
};

// GET /api/prestations — Prestataire
export const getMesPrestationsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    const prestations = await getMesPrestations(userId);
    return res.json({ success: true, data: prestations });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// GET /api/prestations/:id — Prestataire
export const getPrestationDetailHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    const prestation = await getPrestationDetail(userId, req.params.id);
    return res.json({ success: true, data: prestation });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// POST /api/prestations/:id/etat-des-lieux — Prestataire
export const creerEtatDesLieuxHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });

    const { description, photos, montantRevise } = req.body;
    if (!description || description.trim().length < 10)
      return res.status(400).json({
        success: false,
        message: "Description trop courte (min 10 caractères)",
      });

    const etat = await creerEtatDesLieux(userId, req.params.id, {
      description: description.trim(),
      photos: photos || [],
      montantRevise: montantRevise ? parseFloat(montantRevise) : undefined,
    });
    return res
      .status(201)
      .json({ success: true, message: "État des lieux créé", data: etat });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// PATCH /api/prestations/:id/etat-des-lieux/valider — Client
export const validerEtatDesLieuxHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    const { accepte } = req.body;
    if (typeof accepte !== "boolean")
      return res
        .status(400)
        .json({ success: false, message: "accepte (boolean) requis" });
    await validerEtatDesLieux(userId, req.params.id, accepte);
    return res.json({
      success: true,
      message: accepte
        ? "État des lieux accepté"
        : "État des lieux refusé — demande republiée",
    });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// PATCH /api/prestations/:id/terminer — Prestataire
export const marquerTermineHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    await marquerTermine(userId, req.params.id);
    return res.json({
      success: true,
      message:
        "Prestation marquée comme terminée — en attente de validation client",
    });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// PATCH /api/prestations/:id/valider — Client
export const validerPrestationHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    await validerPrestation(userId, req.params.id);
    return res.json({ success: true, message: "Prestation validée — merci !" });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// PATCH /api/prestations/:id/contester — Client
export const contesterPrestationHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    await contesterPrestation(userId, req.params.id);
    return res.json({
      success: true,
      message: "Contestation enregistrée — prestation remise en cours",
    });
  } catch (error: any) {
    return handleError(res, error);
  }
};

// GET /api/prestations/client — Client
export const getMesPrestationsClientHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Non authentifié" });
    const prestations = await getMesPrestationsClient(userId);
    return res.json({ success: true, data: prestations });
  } catch (error: any) {
    return handleError(res, error);
  }
};

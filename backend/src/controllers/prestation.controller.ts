import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { handleError } from "../utils/errorHandler";
import {
  getMesPrestations,
  getPrestationDetail,
  creerEtatDesLieux,
  confirmerConformite,
  validerEtatDesLieux,
  passerEnCours,
  marquerTermine,
  validerPrestation,
  contesterPrestation,
  getMesPrestationsClient,
  creerReview,
} from "../modules/prestations/prestation.service";

export const getMesPrestationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const prestations = await getMesPrestations(req.user!.userId);
    return res.json({ success: true, data: prestations });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getPrestationDetailHandler = async (req: AuthRequest, res: Response) => {
  try {
    const prestation = await getPrestationDetail(req.user!.userId, req.params.id);
    return res.json({ success: true, data: prestation });
  } catch (error) {
    return handleError(error, res);
  }
};

export const creerEtatDesLieuxHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { description, photos, montantRevise } = req.body;
    if (!description || description.trim().length < 10)
      return res.status(400).json({ success: false, message: "Description trop courte (min 10 caractères)" });

    const etat = await creerEtatDesLieux(req.user!.userId, req.params.id, {
      description: description.trim(),
      photos: photos || [],
      montantRevise: montantRevise ? parseFloat(montantRevise) : undefined,
    });
    return res.status(201).json({ success: true, message: "État des lieux créé", data: etat });
  } catch (error) {
    return handleError(error, res);
  }
};

export const validerEtatDesLieuxHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { accepte } = req.body;
    if (typeof accepte !== "boolean")
      return res.status(400).json({ success: false, message: "accepte (boolean) requis" });

    await validerEtatDesLieux(req.user!.userId, req.params.id, accepte);
    return res.json({ success: true, message: accepte ? "État des lieux accepté" : "État des lieux refusé — demande republiée" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const confirmerConformiteHandler = async (req: AuthRequest, res: Response) => {
  try {
    await confirmerConformite(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Objet confirmé conforme — en attente du paiement client" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const passerEnCoursHandler = async (req: AuthRequest, res: Response) => {
  try {
    await passerEnCours(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Paiement confirmé — prestation démarrée" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const marquerTermineHandler = async (req: AuthRequest, res: Response) => {
  try {
    await marquerTermine(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Prestation marquée comme terminée — en attente de validation client" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const validerPrestationHandler = async (req: AuthRequest, res: Response) => {
  try {
    await validerPrestation(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Prestation validée — merci !" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const contesterPrestationHandler = async (req: AuthRequest, res: Response) => {
  try {
    await contesterPrestation(req.user!.userId, req.params.id, req.body.motif);
    return res.json({ success: true, message: "Contestation enregistrée — prestation remise en cours" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const creerReviewHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || typeof rating !== "number")
      return res.status(400).json({ success: false, message: "Note (1-5) requise" });

    const review = await creerReview(req.user!.userId, req.params.id, { rating, comment });
    return res.status(201).json({ success: true, message: "Avis enregistré", data: review });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMesPrestationsClientHandler = async (req: AuthRequest, res: Response) => {
  try {
    const prestations = await getMesPrestationsClient(req.user!.userId);
    return res.json({ success: true, data: prestations });
  } catch (error) {
    return handleError(error, res);
  }
};

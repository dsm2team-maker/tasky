import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { handleError } from "../utils/errorHandler";
import {
  getDemandesDisponibles,
  getDemandeDetail,
  envoyerDevis,
  getDevisDemande,
  accepterDevis,
  refuserDevis,
  getMesStatsDevis,
  getMesDevisRefuses,
  dismisserDevis,
} from "../modules/devis/devis.service";

export const getDemandesDisponiblesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const demandes = await getDemandesDisponibles(req.user!.userId);
    return res.json({ success: true, data: demandes });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getDemandeDetailHandler = async (req: AuthRequest, res: Response) => {
  try {
    const demande = await getDemandeDetail(req.user!.userId, req.params.id);
    return res.json({ success: true, data: demande });
  } catch (error) {
    return handleError(error, res);
  }
};

export const envoyerDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { montant, delai, description } = req.body;

    if (!montant || isNaN(parseFloat(montant)) || parseFloat(montant) <= 0)
      return res.status(400).json({ success: false, message: "Montant invalide" });
    if (!delai || isNaN(parseInt(delai)) || parseInt(delai) <= 0)
      return res.status(400).json({ success: false, message: "Délai invalide" });
    if (!description || description.trim().length < 20)
      return res.status(400).json({ success: false, message: "Description trop courte (min 20 caractères)" });

    const devis = await envoyerDevis(req.user!.userId, req.params.id, {
      montant: parseFloat(montant),
      delai: parseInt(delai),
      description: description.trim(),
    });
    return res.status(201).json({ success: true, message: "Devis envoyé", data: devis });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getDevisDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getDevisDemande(req.user!.userId, req.params.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMesStatsDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getMesStatsDevis(req.user!.userId);
    return res.json({ success: true, data: stats });
  } catch (error) {
    return handleError(error, res);
  }
};

export const accepterDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    await accepterDevis(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Devis accepté — prestation créée" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMesDevisRefusesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMesDevisRefuses(req.user!.userId);
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(error, res);
  }
};

export const dismisserDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    await dismisserDevis(req.user!.userId, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return handleError(error, res);
  }
};

export const refuserDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    await refuserDevis(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Devis refusé" });
  } catch (error) {
    return handleError(error, res);
  }
};
